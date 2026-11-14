import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/booking-prices";
import { astanaDay, shiftDay } from "@/lib/booking-slots";
import { canSeeMoney, useCurrentStaffRole } from "@/lib/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/revenue")({
  component: RevenuePage,
});

// Same cap as revenue_by_day() in supabase/sql/2026-11-14-revenue-by-day.sql: checked here too so
// a wide range shows a message instead of a failed request.
const MAX_RANGE_DAYS = 366;

function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
}

function RevenuePage() {
  const role = useCurrentStaffRole();
  // Default: this month so far, in Astana days.
  const [to, setTo] = useState(() => astanaDay());
  const [from, setFrom] = useState(() => `${astanaDay().slice(0, 8)}01`);

  const span = from && to ? daysBetween(from, to) : NaN;
  const rangeError = !(span >= 0)
    ? "Укажите период: начало не позже конца."
    : span >= MAX_RANGE_DAYS
      ? "Период не больше года."
      : null;

  const allowed = canSeeMoney(role);
  const revenue = useQuery({
    // Under ["admin", ...], so the layout drops it on logout or an account switch.
    queryKey: ["admin", "revenue", from, to],
    enabled: allowed && !rangeError,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("revenue_by_day", { p_from: from, p_to: to });
      if (error) throw error;
      return data;
    },
  });

  // The role is still loading: show nothing rather than flash "no access".
  if (role === undefined) return null;
  if (!allowed) {
    return <p className="text-muted-foreground">Выручку видят только владелец и бухгалтер.</p>;
  }

  const rows = revenue.data ?? [];
  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  const done = rows.reduce((sum, r) => sum + r.done_count, 0);
  const unpriced = rows.reduce((sum, r) => sum + r.unpriced_count, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl tracking-wider">Выручка</h1>
        <p className="text-sm text-muted-foreground">
          Сумма цен выполненных заявок по дню, когда заявку отметили «Выполнена». Прототип: цены
          вводятся в CRM, пока нет кассы / 1С.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="revenue-from">С</Label>
          <Input
            id="revenue-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="revenue-to">По</Label>
          <Input id="revenue-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = astanaDay();
            setFrom(shiftDay(today, -6));
            setTo(today);
          }}
        >
          7 дней
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = astanaDay();
            setFrom(`${today.slice(0, 8)}01`);
            setTo(today);
          }}
        >
          Этот месяц
        </Button>
      </div>

      {rangeError ? (
        <p className="text-sm text-destructive">{rangeError}</p>
      ) : revenue.isPending ? (
        <p className="text-muted-foreground">Загрузка…</p>
      ) : revenue.isError ? (
        <div className="space-y-3">
          <p className="text-destructive">Не удалось загрузить выручку.</p>
          <Button variant="outline" onClick={() => revenue.refetch()}>
            Повторить
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Итого за период</p>
              <p className="text-2xl font-semibold">{formatPrice(total)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Выполнено заявок</p>
              <p className="text-2xl font-semibold">{done}</p>
            </div>
          </div>
          {/* Done bookings with no price aren't in the total; say so instead of hiding it. */}
          {unpriced > 0 && (
            <p className="text-sm text-destructive">
              Без цены: {unpriced} — они не входят в итог. Укажите цену в карточке заявки.
            </p>
          )}

          {rows.length === 0 ? (
            <p className="text-muted-foreground">За этот период выполненных заявок нет.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-normal">День</th>
                    <th className="py-2 pr-4 text-right font-normal">Заявок</th>
                    <th className="py-2 pr-4 text-right font-normal">Без цены</th>
                    <th className="py-2 text-right font-normal">Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.done_day} className="border-b border-border">
                      <td className="py-2 pr-4">
                        {format(parseISO(r.done_day), "d MMMM yyyy, EEEEEE", { locale: ru })}
                      </td>
                      <td className="py-2 pr-4 text-right">{r.done_count}</td>
                      <td className="py-2 pr-4 text-right">{r.unpriced_count || "—"}</td>
                      <td className="py-2 text-right">{formatPrice(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
