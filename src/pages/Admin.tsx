import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { KaraokeVenue } from "@/data/karaokeData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic2, LogOut, Upload, Download, Plus, MapPin, Search, Pencil, Trash2, ChevronLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Every Day",
];

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const venueSchema = z
  .object({
    place: z.string().min(1, "Required"),
    neighborhood: z.string().min(1, "Required"),
    days: z.array(z.string()).min(1, "Select at least one day"),
    address: z.string().min(1, "Required"),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    host: z.string().default(""),
    locationType: z.string().default(""),
    showDescription: z.string().default(""),
    photo: z.string().default(""),
    hostPhoto: z.string().default(""),
    socialInstagram: z.string().default(""),
    socialFacebook: z.string().default(""),
    socialWebsite: z.string().default(""),
    socialTiktok: z.string().default(""),
    hostInstagram: z.string().default(""),
    hostWebsite: z.string().default(""),
    tags: z.string().default(""),
  })
  .refine(
    (d) =>
      d.socialInstagram || d.socialFacebook || d.socialWebsite || d.socialTiktok,
    {
      message: "At least one venue social media URL is required",
      path: ["socialInstagram"],
    }
  );

type VenueFormValues = z.infer<typeof venueSchema>;

// ---------------------------------------------------------------------------
// CSV utilities
// ---------------------------------------------------------------------------

const CSV_HEADERS = [
  "id",
  "place",
  "neighborhood",
  "days",
  "host",
  "locationType",
  "showDescription",
  "lat",
  "lng",
  "address",
  "photo",
  "hostPhoto",
  "socialInstagram",
  "socialFacebook",
  "socialWebsite",
  "socialTiktok",
  "hostInstagram",
  "hostWebsite",
  "tags",
];

function csvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function venueToCsvRow(v: KaraokeVenue): string {
  return [
    v.id,
    v.place,
    v.neighborhood,
    v.days.join(", "),
    v.host,
    v.locationType,
    v.showDescription,
    String(v.lat),
    String(v.lng),
    v.address,
    v.photo,
    v.hostPhoto,
    v.socialMedia.instagram ?? "",
    v.socialMedia.facebook ?? "",
    v.socialMedia.website ?? "",
    v.socialMedia.tiktok ?? "",
    v.hostSocialMedia.instagram ?? "",
    v.hostSocialMedia.website ?? "",
    v.tags.join(", "),
  ]
    .map(csvCell)
    .join(",");
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

function csvRowToVenueData(
  row: string[]
): Omit<KaraokeVenue, "id"> & { id?: string } {
  const [
    id,
    place,
    neighborhood,
    days,
    host,
    locationType,
    showDescription,
    lat,
    lng,
    address,
    photo,
    hostPhoto,
    socialInstagram,
    socialFacebook,
    socialWebsite,
    socialTiktok,
    hostInstagram,
    hostWebsite,
    tags,
  ] = row;

  return {
    id: id || undefined,
    place,
    neighborhood,
    days: days ? days.split(",").map((d) => d.trim()).filter(Boolean) : [],
    host,
    locationType,
    showDescription,
    lat: parseFloat(lat) || 0,
    lng: parseFloat(lng) || 0,
    address,
    photo,
    hostPhoto,
    socialMedia: {
      ...(socialInstagram && { instagram: socialInstagram }),
      ...(socialFacebook && { facebook: socialFacebook }),
      ...(socialWebsite && { website: socialWebsite }),
      ...(socialTiktok && { tiktok: socialTiktok }),
    },
    hostSocialMedia: {
      ...(hostInstagram && { instagram: hostInstagram }),
      ...(hostWebsite && { website: hostWebsite }),
    },
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
}

// ---------------------------------------------------------------------------
// Geocoding (Nominatim / OpenStreetMap — no API key required)
// ---------------------------------------------------------------------------

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({ q: address, format: "json", limit: "1" });
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "User-Agent": "SingItOut/1.0 Seattle Karaoke Guide" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Page root — handles auth state
// ---------------------------------------------------------------------------

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  return <AdminDashboard user={user} />;
}

// ---------------------------------------------------------------------------
// Login screen
// ---------------------------------------------------------------------------

function LoginScreen() {
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border border-glow rounded-xl p-8 w-full max-w-sm shadow-disco text-center">
        <Mic2 className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-gradient-disco mb-2">
          Admin
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to manage venues
        </p>
        <Button onClick={handleGoogleSignIn} className="w-full">
          Sign in with Google
        </Button>
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

function AdminDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-foreground">
            Sing It Out · Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        <Tabs defaultValue="add">
          <TabsList className="mb-6">
            <TabsTrigger value="add">
              <Plus className="h-3 w-3 mr-1" />
              Add Venue
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-3 w-3 mr-1" />
              Export CSV
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="h-3 w-3 mr-1" />
              Import CSV
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Pencil className="h-3 w-3 mr-1" />
              Manage
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <AddVenueForm />
          </TabsContent>
          <TabsContent value="export">
            <ExportCSV />
          </TabsContent>
          <TabsContent value="import">
            <ImportCSV />
          </TabsContent>
          <TabsContent value="manage">
            <ManageVenues />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Venue form
// ---------------------------------------------------------------------------

function AddVenueForm() {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: { days: [] },
  });

  const address = watch("address");
  const lat = watch("lat");
  const lng = watch("lng");

  async function handleGeocode() {
    if (!address) return;
    setGeocoding(true);
    setGeocodeError("");
    const result = await geocodeAddress(address);
    setGeocoding(false);
    if (result) {
      setValue("lat", result.lat);
      setValue("lng", result.lng);
    } else {
      setGeocodeError("Could not geocode address. Enter coordinates manually.");
    }
  }

  async function onSubmit(data: VenueFormValues) {
    setStatus("saving");
    try {
      const venue: Omit<KaraokeVenue, "id"> = {
        place: data.place,
        neighborhood: data.neighborhood,
        days: data.days,
        address: data.address,
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        host: data.host || "",
        locationType: data.locationType || "",
        showDescription: data.showDescription || "",
        photo: data.photo || "",
        hostPhoto: data.hostPhoto || "",
        socialMedia: {
          ...(data.socialInstagram && { instagram: data.socialInstagram }),
          ...(data.socialFacebook && { facebook: data.socialFacebook }),
          ...(data.socialWebsite && { website: data.socialWebsite }),
          ...(data.socialTiktok && { tiktok: data.socialTiktok }),
        },
        hostSocialMedia: {
          ...(data.hostInstagram && { instagram: data.hostInstagram }),
          ...(data.hostWebsite && { website: data.hostWebsite }),
        },
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      await addDoc(collection(db, "venues"), venue);
      setStatus("success");
      reset();
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Core Info */}
      <FormSection title="Core Info">
        <Field label="Venue name *" error={errors.place?.message}>
          <Input {...register("place")} placeholder="e.g. Hula Hula" />
        </Field>
        <Field label="Neighborhood *" error={errors.neighborhood?.message}>
          <Input {...register("neighborhood")} placeholder="e.g. Capitol Hill" />
        </Field>
        <Field label="Days *" error={errors.days?.message}>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {DAY_OPTIONS.map((d) => (
              <label key={d} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={d}
                  {...register("days")}
                  className="accent-primary"
                />
                {d}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Address *" error={errors.address?.message}>
          <div className="flex gap-2">
            <Input
              {...register("address")}
              placeholder="123 Main St, Seattle, WA"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeocode}
              disabled={geocoding || !address}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {geocoding ? "…" : "Geocode"}
            </Button>
          </div>
          {geocodeError && (
            <p className="text-xs text-destructive mt-1">{geocodeError}</p>
          )}
          {lat !== undefined && lng !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </p>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lat (manual override)">
            <Input
              {...register("lat")}
              type="number"
              step="any"
              placeholder="47.6062"
            />
          </Field>
          <Field label="Lng (manual override)">
            <Input
              {...register("lng")}
              type="number"
              step="any"
              placeholder="-122.3321"
            />
          </Field>
        </div>
      </FormSection>

      {/* Show Info */}
      <FormSection title="Show Info">
        <Field label="Host">
          <Input {...register("host")} placeholder="e.g. DJ Sparkle Mike" />
        </Field>
        <Field label="Location type">
          <Input
            {...register("locationType")}
            placeholder="e.g. Bar / Music Venue"
          />
        </Field>
        <Field label="Show description">
          <Textarea
            {...register("showDescription")}
            placeholder="Describe the karaoke night…"
            rows={3}
          />
        </Field>
      </FormSection>

      {/* Venue Social Media */}
      <FormSection title="Venue Social Media (at least one required)">
        {errors.socialInstagram?.message && (
          <p className="text-xs text-destructive">{errors.socialInstagram.message}</p>
        )}
        <Field label="Instagram">
          <Input
            {...register("socialInstagram")}
            placeholder="https://instagram.com/…"
          />
        </Field>
        <Field label="Facebook">
          <Input
            {...register("socialFacebook")}
            placeholder="https://facebook.com/…"
          />
        </Field>
        <Field label="Website">
          <Input {...register("socialWebsite")} placeholder="https://…" />
        </Field>
        <Field label="TikTok">
          <Input
            {...register("socialTiktok")}
            placeholder="https://tiktok.com/…"
          />
        </Field>
      </FormSection>

      {/* Host Social Media */}
      <FormSection title="Host Social Media">
        <Field label="Instagram">
          <Input
            {...register("hostInstagram")}
            placeholder="https://instagram.com/…"
          />
        </Field>
        <Field label="Website">
          <Input {...register("hostWebsite")} placeholder="https://…" />
        </Field>
      </FormSection>

      {/* Media */}
      <FormSection title="Media">
        <Field label="Venue photo URL">
          <Input {...register("photo")} placeholder="https://…" />
        </Field>
        <Field label="Host photo URL">
          <Input {...register("hostPhoto")} placeholder="https://…" />
        </Field>
      </FormSection>

      {/* Tags */}
      <FormSection title="Tags">
        <Field label="Tags (comma-separated)">
          <Input
            {...register("tags")}
            placeholder="Live Band, Late Night, All Ages"
          />
        </Field>
      </FormSection>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          <Plus className="h-4 w-4 mr-1" />
          {status === "saving" ? "Saving…" : "Add Venue"}
        </Button>
        {status === "success" && (
          <p className="text-sm text-green-500">Venue added!</p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">
            Failed to save. Check console.
          </p>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Export CSV
// ---------------------------------------------------------------------------

function ExportCSV() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleExport() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "venues"));
      const venues = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as KaraokeVenue)
      );
      const csv = [CSV_HEADERS.join(","), ...venues.map(venueToCsvRow)].join(
        "\n"
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `singitout-venues-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setCount(venues.length);
    } catch (e) {
      console.error(e);
      setError("Export failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Download all venues from Firestore as a CSV. The{" "}
        <code className="text-xs bg-muted px-1 rounded">id</code> column is the
        Firestore document ID — keep it intact to enable batch updates on
        re-import. Tags are stored as a comma-separated quoted field.
      </p>
      <Button onClick={handleExport} disabled={loading}>
        <Download className="h-4 w-4 mr-1" />
        {loading ? "Exporting…" : "Download CSV"}
      </Button>
      {count !== null && (
        <p className="text-sm text-muted-foreground">Exported {count} venues.</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Import CSV
// ---------------------------------------------------------------------------

function ImportCSV() {
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const [header, ...rows] = lines;

    const headers = parseCSVLine(header);
    if (headers[0] !== "id") {
      setResult({
        created: 0,
        updated: 0,
        errors: [
          "CSV header must start with 'id'. Use the Export CSV tab to get the correct format.",
        ],
      });
      setLoading(false);
      return;
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const [i, row] of rows.entries()) {
      try {
        const cells = parseCSVLine(row);
        const { id, ...data } = csvRowToVenueData(cells);
        if (id) {
          await setDoc(doc(db, "venues", id), data, { merge: true });
          updated++;
        } else {
          await addDoc(collection(db, "venues"), data);
          created++;
        }
      } catch (err) {
        errors.push(`Row ${i + 2}: ${String(err)}`);
      }
    }

    setResult({ created, updated, errors });
    setLoading(false);
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload a CSV to create or update venues. Rows <strong>with</strong> an{" "}
        <code className="text-xs bg-muted px-1 rounded">id</code> will update
        the matching Firestore document (merge). Rows{" "}
        <strong>without</strong> an id will create new venues with an
        auto-generated Firestore ID.
      </p>
      <div className="space-y-1">
        <Label htmlFor="csv-upload">Choose CSV file</Label>
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={loading}
          className="cursor-pointer"
        />
      </div>
      {loading && (
        <p className="text-sm text-muted-foreground">Importing…</p>
      )}
      {result && (
        <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
          <p className="text-green-500">
            {result.created} created, {result.updated} updated
          </p>
          {result.errors.map((err, i) => (
            <p key={i} className="text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manage Venues — search, edit, delete
// ---------------------------------------------------------------------------

function ManageVenues() {
  const [venues, setVenues] = useState<KaraokeVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<KaraokeVenue | null>(null);

  async function loadVenues() {
    setLoading(true);
    const snap = await getDocs(collection(db, "venues"));
    setVenues(snap.docs.map((d) => ({ id: d.id, ...d.data() } as KaraokeVenue)));
    setLoading(false);
  }

  useEffect(() => { loadVenues(); }, []);

  if (editing) {
    return (
      <EditVenueForm
        venue={editing}
        onDone={() => { setEditing(null); loadVenues(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const filtered = venues.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.place.toLowerCase().includes(q) ||
      v.neighborhood.toLowerCase().includes(q) ||
      (v.host ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by venue, neighborhood, or host…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No venues found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => setEditing(v)}
              className="w-full text-left rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors"
            >
              <div className="font-medium text-foreground">{v.place}</div>
              <div className="text-xs text-muted-foreground">
                {v.neighborhood} · {v.days.join(" · ")}
                {v.host && ` · ${v.host}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditVenueForm({
  venue,
  onDone,
  onCancel,
}: {
  venue: KaraokeVenue;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      place: venue.place,
      neighborhood: venue.neighborhood,
      days: venue.days,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      host: venue.host,
      locationType: venue.locationType,
      showDescription: venue.showDescription,
      photo: venue.photo,
      hostPhoto: venue.hostPhoto,
      socialInstagram: venue.socialMedia.instagram ?? "",
      socialFacebook: venue.socialMedia.facebook ?? "",
      socialWebsite: venue.socialMedia.website ?? "",
      socialTiktok: venue.socialMedia.tiktok ?? "",
      hostInstagram: venue.hostSocialMedia.instagram ?? "",
      hostWebsite: venue.hostSocialMedia.website ?? "",
      tags: venue.tags.join(", "),
    },
  });

  const address = watch("address");
  const lat = watch("lat");
  const lng = watch("lng");

  async function handleGeocode() {
    if (!address) return;
    setGeocoding(true);
    setGeocodeError("");
    const result = await geocodeAddress(address);
    setGeocoding(false);
    if (result) {
      setValue("lat", result.lat);
      setValue("lng", result.lng);
    } else {
      setGeocodeError("Could not geocode address. Enter coordinates manually.");
    }
  }

  async function onSubmit(data: VenueFormValues) {
    setStatus("saving");
    try {
      const updated: Omit<KaraokeVenue, "id"> = {
        place: data.place,
        neighborhood: data.neighborhood,
        days: data.days,
        address: data.address,
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        host: data.host || "",
        locationType: data.locationType || "",
        showDescription: data.showDescription || "",
        photo: data.photo || "",
        hostPhoto: data.hostPhoto || "",
        socialMedia: {
          ...(data.socialInstagram && { instagram: data.socialInstagram }),
          ...(data.socialFacebook && { facebook: data.socialFacebook }),
          ...(data.socialWebsite && { website: data.socialWebsite }),
          ...(data.socialTiktok && { tiktok: data.socialTiktok }),
        },
        hostSocialMedia: {
          ...(data.hostInstagram && { instagram: data.hostInstagram }),
          ...(data.hostWebsite && { website: data.hostWebsite }),
        },
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      await setDoc(doc(db, "venues", venue.id), updated);
      onDone();
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  async function handleDelete() {
    setStatus("deleting");
    try {
      await deleteDoc(doc(db, "venues", venue.id));
      onDone();
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </button>
        <span className="text-xs text-muted-foreground font-mono">{venue.id}</span>
      </div>

      {/* Core Info */}
      <FormSection title="Core Info">
        <Field label="Venue name *" error={errors.place?.message}>
          <Input {...register("place")} />
        </Field>
        <Field label="Neighborhood *" error={errors.neighborhood?.message}>
          <Input {...register("neighborhood")} />
        </Field>
        <Field label="Days *" error={errors.days?.message}>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {DAY_OPTIONS.map((d) => (
              <label key={d} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={d}
                  {...register("days")}
                  className="accent-primary"
                />
                {d}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Address *" error={errors.address?.message}>
          <div className="flex gap-2">
            <Input {...register("address")} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeocode}
              disabled={geocoding || !address}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {geocoding ? "…" : "Geocode"}
            </Button>
          </div>
          {geocodeError && <p className="text-xs text-destructive mt-1">{geocodeError}</p>}
          {lat !== undefined && lng !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </p>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lat (manual override)">
            <Input {...register("lat")} type="number" step="any" />
          </Field>
          <Field label="Lng (manual override)">
            <Input {...register("lng")} type="number" step="any" />
          </Field>
        </div>
      </FormSection>

      {/* Show Info */}
      <FormSection title="Show Info">
        <Field label="Host">
          <Input {...register("host")} />
        </Field>
        <Field label="Location type">
          <Input {...register("locationType")} />
        </Field>
        <Field label="Show description">
          <Textarea {...register("showDescription")} rows={3} />
        </Field>
      </FormSection>

      {/* Venue Social Media */}
      <FormSection title="Venue Social Media (at least one required)">
        {errors.socialInstagram?.message && (
          <p className="text-xs text-destructive">{errors.socialInstagram.message}</p>
        )}
        <Field label="Instagram"><Input {...register("socialInstagram")} /></Field>
        <Field label="Facebook"><Input {...register("socialFacebook")} /></Field>
        <Field label="Website"><Input {...register("socialWebsite")} /></Field>
        <Field label="TikTok"><Input {...register("socialTiktok")} /></Field>
      </FormSection>

      {/* Host Social Media */}
      <FormSection title="Host Social Media">
        <Field label="Instagram"><Input {...register("hostInstagram")} /></Field>
        <Field label="Website"><Input {...register("hostWebsite")} /></Field>
      </FormSection>

      {/* Media */}
      <FormSection title="Media">
        <Field label="Venue photo URL"><Input {...register("photo")} /></Field>
        <Field label="Host photo URL"><Input {...register("hostPhoto")} /></Field>
      </FormSection>

      {/* Tags */}
      <FormSection title="Tags">
        <Field label="Tags (comma-separated)">
          <Input {...register("tags")} />
        </Field>
      </FormSection>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === "saving" || status === "deleting"}>
            {status === "saving" ? "Saving…" : "Save Changes"}
          </Button>
          {status === "error" && (
            <p className="text-sm text-destructive">Failed. Check console.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-destructive">Delete this venue?</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={status === "deleting"}
              >
                {status === "deleting" ? "Deleting…" : "Confirm"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
