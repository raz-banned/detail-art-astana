import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { BUSY_SLOTS_KEY } from "./use-busy-slots";

// The CRM's bookings, shared by the list (/admin) and the schedule (/admin/schedule): both read
// one cached query, so a status saved on one page shows on the other without a refetch.

export type Booking = Tables<"bookings">;
export const BOOKINGS_KEY = ["admin", "bookings"];

// Postgres unique_violation: bookings_direction_slot_unique, the slot is taken.
export function isSlotTaken(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "23505";
}

export function useBookings() {
  return useQuery({
    queryKey: BOOKINGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"bookings"> }) => {
      // .select().single() turns "0 rows updated" (e.g. blocked by RLS) into an error.
      const { data, error } = await supabase
        .from("bookings")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // A refetch started before the save could land after it and bring back old values.
    onMutate: () => queryClient.cancelQueries({ queryKey: BOOKINGS_KEY }),
    onSuccess: (updated, { patch }) => {
      queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
        old?.map((b) => (b.id === updated.id ? updated : b)),
      );
      // Cancelling frees a slot and un-cancelling takes it again; a note changes neither.
      if ("status" in patch) void queryClient.invalidateQueries({ queryKey: BUSY_SLOTS_KEY });
    },
    onError: (error) =>
      toast.error(
        // Bringing a cancelled booking back while someone else holds its slot.
        isSlotTaken(error)
          ? "Это время уже занято другой записью. Сначала отмените её."
          : "Не удалось сохранить. Попробуйте ещё раз.",
      ),
  });
}
