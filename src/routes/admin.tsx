import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

// CRM for staff. Access control is enforced by Supabase RLS (see supabase/sql/);
// this layout only decides what to show. The session lives in the browser, so the
// section is rendered client-side only.
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "CRM — APELSIN DETAILING" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function useSession() {
  // undefined = still loading, null = signed out
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}

function AdminLayout() {
  const session = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  const isAdmin = useQuery({
    queryKey: ["admin", "is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data;
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    // Don't keep customers' data in memory after logout.
    queryClient.removeQueries({ queryKey: ["admin"] });
  };

  let content;
  if (session === undefined || (session && isAdmin.isPending)) {
    content = <CenteredMessage>Загрузка…</CenteredMessage>;
  } else if (!session) {
    content = <LoginForm />;
  } else if (isAdmin.isError) {
    content = (
      <CenteredMessage>
        Не удалось проверить доступ. Обновите страницу.
        <Button variant="outline" onClick={signOut} className="mt-4">
          Выйти
        </Button>
      </CenteredMessage>
    );
  } else if (!isAdmin.data) {
    content = (
      <CenteredMessage>
        У аккаунта {session.user.email} нет доступа к CRM.
        <Button variant="outline" onClick={signOut} className="mt-4">
          Выйти
        </Button>
      </CenteredMessage>
    );
  } else {
    content = (
      <>
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
            <Link to="/admin" className="font-display text-xl tracking-widest">
              APELSIN<span className="text-primary">.</span>CRM
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-muted-foreground sm:inline">{session.user.email}</span>
              <Link to="/" className="text-muted-foreground hover:text-primary">
                Сайт
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                Выйти
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {content}
      <Toaster position="top-center" />
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center text-muted-foreground">
      {children}
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) setError("Неверный email или пароль.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-3xl tracking-widest">
          APELSIN<span className="text-primary">.</span>CRM
        </h1>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Входим…" : "Войти"}
        </Button>
      </form>
    </div>
  );
}
