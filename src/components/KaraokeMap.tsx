import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { KaraokeVenue } from "@/data/karaokeData";

interface KaraokeMapProps {
  venues: KaraokeVenue[];
  onVenueClick: (venue: KaraokeVenue) => void;
  selectedVenue: KaraokeVenue | null;
}

const createIcon = (isSelected: boolean) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${isSelected ? 20 : 14}px;
      height: ${isSelected ? 20 : 14}px;
      border-radius: 50%;
      background: ${isSelected ? "hsl(350 80% 35%)" : "hsl(240 70% 25%)"};
      border: 2px solid ${isSelected ? "hsl(350 80% 50%)" : "hsl(240 70% 40%)"};
      box-shadow: 0 0 ${isSelected ? 16 : 8}px ${isSelected ? "hsl(350 80% 35% / 0.6)" : "hsl(240 70% 25% / 0.4)"};
      transition: all 0.3s;
    "></div>`,
    iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
    iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
  });

const KaraokeMap = ({ venues, onVenueClick, selectedVenue }: KaraokeMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [47.6102, -122.3340],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    venues.forEach((venue) => {
      const marker = L.marker([venue.lat, venue.lng], {
        icon: createIcon(selectedVenue?.id === venue.id),
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-family: 'Space Grotesk', sans-serif;">
            <strong>${venue.place}</strong><br/>
            <span style="font-size:12px; opacity:0.8;">${venue.neighborhood} · ${venue.day}</span>
          </div>`,
          { closeButton: false }
        )
        .on("click", () => onVenueClick(venue));

      markersRef.current.push(marker);
    });
  }, [venues, selectedVenue, onVenueClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] md:h-[500px] rounded-lg border border-glow overflow-hidden"
    />
  );
};

export default KaraokeMap;
