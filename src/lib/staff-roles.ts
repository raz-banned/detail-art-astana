import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// CRM staff roles, stored in admins.role. The database checks the same list
// (admins_role_check in supabase/sql/2026-11-07-admin-roles.sql): adding one needs SQL too.
// Showing or hiding something by role here is only for convenience; access is enforced in the
// database with has_role().
export const STAFF_ROLES = [
  { value: "manager", label: "Менеджер" },
  { value: "owner", label: "Владелец" },
  { value: "accountant", label: "Бухгалтер" },
] as const;

export function staffRoleLabel(value: string): string {
  return STAFF_ROLES.find((r) => r.value === value)?.label ?? value;
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
