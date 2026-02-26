# Sing in Seattle

A guide to karaoke nights across Seattle. Browse venues by neighborhood, day of the week, or vibe — on a map or as a list.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Map:** Leaflet (inverted light tiles for dark-mode styling)
- **Database:** Firebase Firestore (falls back to static data if unavailable)

## Getting started

```bash
npm install
npm run dev
```

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |

## Data schema

Venues are stored in the Firestore `venues` collection. Each document has the following shape:

```ts
{
  place: string;             // Venue name
  neighborhood: string;      // e.g. "Capitol Hill", "Fremont"
  day: string;               // e.g. "Friday", "Every Day"
  host: string;              // KJ / host name, or "Self-Service"
  locationType: string;      // e.g. "Bar / Music Venue", "Private Room Karaoke"
  showDescription: string;   // Free-text description of the karaoke night
  lat: number;               // Latitude
  lng: number;               // Longitude
  address: string;           // Street address
  photo: string;             // URL to venue photo (optional)
  hostPhoto: string;         // URL to host photo (optional)
  socialMedia: {
    instagram?: string;
    facebook?: string;
    website?: string;
    tiktok?: string;
  };
  hostSocialMedia: {
    instagram?: string;
    website?: string;
  };
  tags: string[];            // e.g. ["Live Band", "Open Mic", "Late Night"]
}
```

The document ID serves as the venue ID.

## Seeding Firestore

To populate Firestore with the starter venue data:

```bash
npx tsx scripts/seed-firestore.ts
```

This writes the venues defined in the seed script to the `venues` collection. It's safe to re-run — it overwrites documents by ID.
