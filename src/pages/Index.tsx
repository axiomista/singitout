import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic2, Map, List } from "lucide-react";
import { karaokeVenues, KaraokeVenue } from "@/data/karaokeData";
import SearchFilters from "@/components/SearchFilters";
import KaraokeCard from "@/components/KaraokeCard";
import KaraokeMap from "@/components/KaraokeMap";
import VenueDetail from "@/components/VenueDetail";
import DiscoBall from "@/components/DiscoBall";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<KaraokeVenue | null>(null);
  const [showMap, setShowMap] = useState(true);

  const filteredVenues = useMemo(() => {
    return karaokeVenues.filter((venue) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        venue.place.toLowerCase().includes(q) ||
        venue.host.toLowerCase().includes(q) ||
        venue.neighborhood.toLowerCase().includes(q) ||
        venue.showDescription.toLowerCase().includes(q) ||
        venue.tags.some((t) => t.toLowerCase().includes(q));
      const matchesNeighborhood =
        neighborhoodFilter === "all" || venue.neighborhood === neighborhoodFilter;
      const matchesDay = dayFilter === "all" || venue.day === dayFilter;
      const matchesType = typeFilter === "all" || venue.locationType === typeFilter;
      return matchesSearch && matchesNeighborhood && matchesDay && matchesType;
    });
  }, [searchQuery, neighborhoodFilter, dayFilter, typeFilter]);

  const handleVenueClick = useCallback((venue: KaraokeVenue) => {
    setSelectedVenue(venue);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        {/* Background sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-sparkle"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(${290 + Math.random() * 60} ${60 + Math.random() * 20}% ${25 + Math.random() * 15}%)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="container relative py-12 md:py-16">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-3"
              >
                <Mic2 className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                  Seattle's Karaoke Guide
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-6xl font-bold text-gradient-disco glow-text"
              >
                Seattle Karaoke
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-lg text-muted-foreground max-w-md"
              >
                Find your stage. Every night, every neighborhood, every vibe.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="hidden md:block"
            >
              <DiscoBall size={140} />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            neighborhoodFilter={neighborhoodFilter}
            onNeighborhoodChange={setNeighborhoodFilter}
            dayFilter={dayFilter}
            onDayChange={setDayFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
          />
        </motion.div>

        {/* Toggle + count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{filteredVenues.length}</span>{" "}
            {filteredVenues.length === 1 ? "venue" : "venues"} found
          </p>
          <div className="flex gap-1">
            <Button
              variant={showMap ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowMap(true)}
              className={showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            >
              <Map className="h-4 w-4 mr-1" />
              Map
            </Button>
            <Button
              variant={!showMap ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowMap(false)}
              className={!showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <KaraokeMap
              venues={filteredVenues}
              onVenueClick={handleVenueClick}
              selectedVenue={selectedVenue}
            />
          </motion.div>
        )}

        {/* Card grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue, i) => (
            <KaraokeCard
              key={venue.id}
              venue={venue}
              onClick={handleVenueClick}
              index={i}
            />
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="mt-12 text-center">
            <Mic2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              No venues match your filters. Try loosening your search!
            </p>
          </div>
        )}
      </main>

      {/* Venue detail modal */}
      {selectedVenue && (
        <VenueDetail venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
      )}
    </div>
  );
};

export default Index;
