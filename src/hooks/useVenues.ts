import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { KaraokeVenue, karaokeVenues as staticVenues } from "@/data/karaokeData";

export function useVenues() {
  const [venues, setVenues] = useState<KaraokeVenue[]>(staticVenues);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "venues"))
      .then((snap) => {
        if (!snap.empty) {
          setVenues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as KaraokeVenue));
        }
        // If Firestore is empty, keep the static fallback
      })
      .catch((err) => {
        console.warn("Firestore unavailable, using static data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const neighborhoods = [...new Set(venues.map((v) => v.neighborhood))];
  const locationTypes = [...new Set(venues.map((v) => v.locationType))];

  return { venues, neighborhoods, locationTypes, loading };
}
