import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import type { Database } from "@/integrations/supabase/types";

// CRM staff roles: the staff_role enum in admins.role (supabase/sql/2026-11-11-admin-roles-enum.sql).
// Adding a role starts in SQL; after types.ts is updated, TypeScript asks for its label here.
// Showing or hiding something by role here is only for convenience; access is enforced in the
// database with has_role().
export type StaffRole = Database["public"]["Enums"]["staff_role"];

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Менеджер",
  owner: "Владелец",
  accountant: "Бухгалтер",
};

// The fallback covers a role added in the database before the site is redeployed with its label.
export function staffRoleLabel(role: StaffRole): string {
  return STAFF_ROLE_LABELS[role] ?? role;
}

// The signed-in user's role. RLS lets a user read only their own admins row.
export function useStaffRole(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "role", userId],
    enabled: !!userId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("role")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data.role;
    },
  });
}

// The signed-in user's role, provided by the /admin layout, which already loads it, so pages
// don't query it again. undefined while loading, null if it failed to load: both mean the least
// access, but a page can tell "wait" from "give up".
export const StaffRoleContext = createContext<StaffRole | null | undefined>(undefined);

export function useCurrentStaffRole(): StaffRole | null | undefined {
  return useContext(StaffRoleContext);
}

// Roles that see money: booking prices now, revenue later. Must match has_role('{owner,accountant}')
// in the RLS policies (supabase/sql/2026-11-14-booking-prices.sql).
export function canSeeMoney(role: StaffRole | null | undefined): boolean {
  return role === "owner" || role === "accountant";
}
