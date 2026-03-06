import { motion } from "framer-motion";
import { MapPin, Calendar, Mic2, Tag, Navigation } from "lucide-react";
import { KaraokeVenue } from "@/data/karaokeData";
import { Badge } from "@/components/ui/badge";

interface KaraokeCardProps {
  venue: KaraokeVenue;
  onClick: (venue: KaraokeVenue) => void;
  index: number;
  distanceMiles?: number;
}

const KaraokeCard = ({ venue, onClick, index, distanceMiles }: KaraokeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group cursor-pointer rounded-lg bg-card border border-border hover:border-glow p-4 transition-all duration-300 hover:shadow-disco"
      onClick={() => onClick(venue)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gradient-disco transition-colors">
          {venue.place}
        </h3>
        <Badge variant="outline" className="border-primary/40 text-primary text-xs shrink-0 ml-2">
          {venue.days.join(" · ")}
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
        <MapPin className="h-3 w-3 text-primary/70" />
        <span>{venue.neighborhood}</span>
        <span className="mx-1 text-border">·</span>
        <span>{venue.locationType}</span>
        {distanceMiles !== undefined && (
          <>
            <span className="mx-1 text-border">·</span>
            <Navigation className="h-3 w-3 text-secondary/70" />
            <span className="text-secondary">{distanceMiles.toFixed(1)} mi</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <Mic2 className="h-3 w-3 text-secondary/70" />
        <span>{venue.host}</span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {venue.showDescription}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {venue.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default KaraokeCard;
