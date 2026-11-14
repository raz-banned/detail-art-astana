import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { StaffRole } from "./staff-roles";

// Booking prices in the CRM (supabase/sql/2026-11-14-booking-prices.sql). Only the owner and the
// accountant can read or set them; the database enforces that (RLS on booking_prices and the
// role check in set_booking_price). Hiding the field from managers here is only for convenience:
// for them the query would just return no rows.

// The signed-in user's role, provided by the /admin layout, which already loads it.
// undefined while loading or on error: treated as "no prices", the safe default.
export const StaffRoleContext = createContext<StaffRole | undefined>(undefined);

export function useCanSeePrices(): boolean {
  const role = useContext(StaffRoleContext);
  return role === "owner" || role === "accountant";
}

// Under ["admin", ...], so the layout drops it on logout or an account switch.
const PRICES_KEY = ["admin", "booking-prices"];

// All prices at once, as a map by booking id: the list shows every booking anyway, and one query
// beats one per card.
export function useBookingPrices(enabled: boolean) {
  return useQuery({
    queryKey: PRICES_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_prices").select("booking_id, price");
      if (error) throw error;
      return new Map(data.map((p) => [p.booking_id, p.price]));
    },
  });
}

// Max of a Postgres integer: a larger number would fail in the database with a raw error.
export const MAX_PRICE = 2_147_483_647;

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₸`;
}

export function useSetBookingPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { bookingId: string; price: number; reason?: string }) => {
      const { error } = await supabase.rpc("set_booking_price", {
        p_booking_id: args.bookingId,
        p_price: args.price,
        // Left out, not undefined, when there's no reason: the SQL default (null) applies.
        ...(args.reason !== undefined && { p_reason: args.reason }),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRICES_KEY });
      toast.success("Цена сохранена");
    },
    onError: (error) => {
      const code = (error as { code?: string } | null)?.code;
      toast.error(
        // 22023: a locked price changed without a reason. The form asks for one, but the lock
        // may have been set by a status change made in another tab after this card loaded.
        code === "22023"
          ? "Клиент уже согласовал цену: укажите причину изменения."
          : code === "42501"
            ? "Цену может менять только владелец или бухгалтер."
            : "Не удалось сохранить цену. Попробуйте ещё раз.",
      );
    },
  });
}
