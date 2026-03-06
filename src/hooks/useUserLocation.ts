import { useState, useEffect } from "react";

interface UserLocation {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.code, err.message);
        setLoading(false);
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, loading };
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return getDistanceKm(lat1, lng1, lat2, lng2) * 0.621371;
}
