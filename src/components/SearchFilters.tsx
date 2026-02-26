import { Search, MapPin, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { days } from "@/data/karaokeData";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  neighborhoodFilter: string;
  onNeighborhoodChange: (value: string) => void;
  dayFilter: string;
  onDayChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  neighborhoods: string[];
  locationTypes: string[];
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  neighborhoodFilter,
  onNeighborhoodChange,
  dayFilter,
  onDayChange,
  typeFilter,
  onTypeChange,
  neighborhoods,
  locationTypes,
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search venues, hosts, neighborhoods..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-glow"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={neighborhoodFilter} onValueChange={onNeighborhoodChange}>
          <SelectTrigger className="w-[160px] bg-card border-glow">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <SelectValue placeholder="Neighborhood" />
          </SelectTrigger>
          <SelectContent className="bg-card border-glow">
            <SelectItem value="all">All Neighborhoods</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dayFilter} onValueChange={onDayChange}>
          <SelectTrigger className="w-[140px] bg-card border-glow">
            <Calendar className="h-4 w-4 mr-1 text-primary" />
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent className="bg-card border-glow">
            <SelectItem value="all">All Days</SelectItem>
            {days.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[160px] bg-card border-glow">
            <Filter className="h-4 w-4 mr-1 text-primary" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-glow">
            <SelectItem value="all">All Types</SelectItem>
            {locationTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
