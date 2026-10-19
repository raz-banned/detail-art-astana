import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dayRange, slotKey } from "./booking-slots";
import type { DirectionSlug } from "./directions";

// Taken slots of a direction on one Astana day, as a set of slotKey() values. Goes through
// busy_slots() because anon can't read bookings. Nothing is fetched until a day is picked, so
// the server render and the first client render don't depend on the clock or the database.
export function useBusySlots(direction: DirectionSlug, day: string | null) {
  return useQuery({
    queryKey: ["busy-slots", direction, day],
    enabled: day !== null,
    // Another client may book meanwhile; refetch when the visitor comes back to the tab.
    staleTime: 30_000,
    queryFn: async () => {
      const { from, to } = dayRange(day!);
      const { data, error } = await supabase.rpc("busy_slots", {
        p_direction: direction,
        p_from: from,
        p_to: to,
      });
      if (error) throw error;
      return new Set(data.map(slotKey));
    },
  });
}
