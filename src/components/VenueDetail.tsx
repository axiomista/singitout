import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Calendar,
  Mic2,
  Instagram,
  Facebook,
  Globe,
  ExternalLink,
  Tag,
  Navigation,
} from "lucide-react";
import { KaraokeVenue } from "@/data/karaokeData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface VenueDetailProps {
  venue: KaraokeVenue | null;
  onClose: () => void;
  distanceMiles?: number;
}

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
  >
    <Icon className="h-4 w-4" />
    {label}
  </a>
);

const VenueDetail = ({ venue, onClose }: VenueDetailProps) => {
  if (!venue) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-card border border-glow shadow-disco"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary rounded-t-xl" />

          <div className="p-6">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-5 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <h2 className="font-display text-2xl font-bold text-gradient-disco pr-8">
              {venue.place}
            </h2>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                <Calendar className="h-3 w-3 mr-1" />
                {venue.day}
              </Badge>
              <Badge variant="outline" className="border-secondary/40 text-secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {venue.neighborhood}
              </Badge>
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                {venue.locationType}
              </Badge>
            </div>

            {/* Address */}
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary/60 shrink-0" />
              {venue.address}
            </p>

            <Separator className="my-4 bg-border" />

            {/* Host */}
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Mic2 className="h-4 w-4 text-primary" />
                Host: {venue.host}
              </h3>
              {Object.keys(venue.hostSocialMedia).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {venue.hostSocialMedia.instagram && (
                    <SocialLink
                      href={venue.hostSocialMedia.instagram}
                      icon={Instagram}
                      label="Instagram"
                    />
                  )}
                  {venue.hostSocialMedia.website && (
                    <SocialLink
                      href={venue.hostSocialMedia.website}
                      icon={Globe}
                      label="Website"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                About the Show
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {venue.showDescription}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {venue.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            <Separator className="my-4 bg-border" />

            {/* Venue Social */}
            <h3 className="font-display text-sm font-semibold text-foreground mb-2">
              Venue Links
            </h3>
            <div className="flex flex-wrap gap-2">
              {venue.socialMedia.instagram && (
                <SocialLink
                  href={venue.socialMedia.instagram}
                  icon={Instagram}
                  label="Instagram"
                />
              )}
              {venue.socialMedia.facebook && (
                <SocialLink
                  href={venue.socialMedia.facebook}
                  icon={Facebook}
                  label="Facebook"
                />
              )}
              {venue.socialMedia.website && (
                <SocialLink
                  href={venue.socialMedia.website}
                  icon={Globe}
                  label="Website"
                />
              )}
              {venue.socialMedia.tiktok && (
                <SocialLink
                  href={venue.socialMedia.tiktok}
                  icon={ExternalLink}
                  label="TikTok"
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VenueDetail;
