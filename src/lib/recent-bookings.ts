import { useEffect, useState } from "react";
import { appStore } from "@/lib/native";

export type RecentBooking = {
  id: string;
  route: string;
  departure_time: string;
  seats: number[];
  savedAt: string;
};

const KEY = "recent-bookings";

export function readRecentBookings(): RecentBooking[] {
  return appStore.get<RecentBooking[]>(KEY, []);
}

/** Recent bookings kept on the device so tickets load instantly, even offline. */
export function useRecentBookings() {
  const [items, setItems] = useState<RecentBooking[]>([]);
  useEffect(() => {
    setItems(readRecentBookings());
  }, []);
  return items;
}
