/**
 * One-time script to seed Firestore with existing venue data.
 * Run with: npx tsx scripts/seed-firestore.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQwZT5rMDmfeNMwhoz6q0VXJxF8ergYCU",
  authDomain: "seattle-karaoke.firebaseapp.com",
  projectId: "seattle-karaoke",
  storageBucket: "seattle-karaoke.firebasestorage.app",
  messagingSenderId: "843928576225",
  appId: "1:843928576225:web:fa135821f4391099a597a0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const venues = [
  {
    id: "1",
    place: "The Crocodile",
    neighborhood: "Belltown",
    day: "Friday",
    host: "DJ Sparkle Mike",
    locationType: "Bar / Music Venue",
    showDescription: "High-energy open mic karaoke with a live band backing. Song catalog of 10,000+ tracks. Sign up starts at 8pm, first singer at 9pm.",
    lat: 47.6133,
    lng: -122.3467,
    address: "2505 1st Ave, Seattle, WA 98121",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/thecrocodile",
      facebook: "https://facebook.com/thecrocodile",
      website: "https://thecrocodile.com",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/djsparklemike",
    },
    tags: ["Live Band", "Open Mic", "Late Night"],
  },
  {
    id: "2",
    place: "Hula Hula",
    neighborhood: "Capitol Hill",
    day: "Wednesday",
    host: "Karaoke Karen",
    locationType: "Tiki Bar",
    showDescription: "Tropical-themed karaoke night with themed cocktails. Costume contest every first Wednesday. Intimate stage with great sound system.",
    lat: 47.6143,
    lng: -122.3213,
    address: "106 Broadway E, Seattle, WA 98102",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/hulahulaseattle",
      website: "https://hulahulaseattle.com",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/karaokekarenpdx",
      website: "https://karaokekarenpdx.com",
    },
    tags: ["Themed Night", "Cocktails", "Costume Contest"],
  },
  {
    id: "3",
    place: "ReBar",
    neighborhood: "Capitol Hill",
    day: "Saturday",
    host: "Sylvia O'Stayformore",
    locationType: "Nightclub",
    showDescription: "Drag-hosted karaoke extravaganza! Duets encouraged, group songs welcome. Prizes for best performance every week.",
    lat: 47.6155,
    lng: -122.3178,
    address: "1114 Howell St, Seattle, WA 98101",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/rebarseattle",
      facebook: "https://facebook.com/rebarseattle",
      website: "https://rebarseattle.com",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/sylviaostayformore",
    },
    tags: ["Drag Host", "Duets", "Prizes"],
  },
  {
    id: "4",
    place: "Ozzie's",
    neighborhood: "Queen Anne",
    day: "Thursday",
    host: "Tommy Tune",
    locationType: "Sports Bar",
    showDescription: "Chill karaoke with a sports bar vibe. Great wings, cheap pitchers, and a surprisingly deep song catalog. No judgment zone!",
    lat: 47.6237,
    lng: -122.3571,
    address: "105 W Mercer St, Seattle, WA 98119",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/ozziesseattle",
      website: "https://ozziesseattle.com",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/tommytunekaraoke",
    },
    tags: ["Casual", "Sports Bar", "No Judgment"],
  },
  {
    id: "5",
    place: "Rock Box",
    neighborhood: "International District",
    day: "Every Day",
    host: "Self-Service",
    locationType: "Private Room Karaoke",
    showDescription: "Japanese-style private karaoke rooms. Book by the hour. Full food and drink menu delivered to your room. 20+ rooms available.",
    lat: 47.5985,
    lng: -122.3275,
    address: "1603 Nagle Pl, Seattle, WA 98122",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/rockboxkaraoke",
      facebook: "https://facebook.com/rockboxkaraoke",
      website: "https://rockboxkaraoke.com",
      tiktok: "https://tiktok.com/@rockboxkaraoke",
    },
    hostSocialMedia: {},
    tags: ["Private Rooms", "Japanese Style", "Food & Drinks"],
  },
  {
    id: "6",
    place: "Nega Karaoke",
    neighborhood: "International District",
    day: "Every Day",
    host: "Self-Service",
    locationType: "Private Room Karaoke",
    showDescription: "K-pop focused karaoke with an incredible Korean song selection. Modern rooms with disco lights, tambourines provided!",
    lat: 47.5975,
    lng: -122.3255,
    address: "621 S King St, Seattle, WA 98104",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/negakaraoke",
    },
    hostSocialMedia: {},
    tags: ["K-Pop", "Private Rooms", "Korean Songs"],
  },
  {
    id: "7",
    place: "Dunagan's",
    neighborhood: "Fremont",
    day: "Tuesday",
    host: "Melody Martinez",
    locationType: "Irish Pub",
    showDescription: "Karaoke in a cozy Irish pub setting. Strong pours, warm vibes. Tuesday is the hidden gem night — locals only know about this one.",
    lat: 47.651,
    lng: -122.3505,
    address: "3501 Fremont Ave N, Seattle, WA 98103",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      facebook: "https://facebook.com/dunagansfremont",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/melodymartinezmusic",
    },
    tags: ["Cozy", "Local Gem", "Irish Pub"],
  },
  {
    id: "8",
    place: "Garage",
    neighborhood: "Capitol Hill",
    day: "Monday",
    host: "Reverb Rachel",
    locationType: "Bar & Bowling",
    showDescription: "Monday night karaoke + bowling! Sing between frames. Two floors of fun. The most unique karaoke experience in Seattle.",
    lat: 47.6145,
    lng: -122.3188,
    address: "1130 Broadway, Seattle, WA 98122",
    photo: "",
    hostPhoto: "",
    socialMedia: {
      instagram: "https://instagram.com/garagebilliards",
      website: "https://garagebilliards.com",
    },
    hostSocialMedia: {
      instagram: "https://instagram.com/reverbrachel",
    },
    tags: ["Bowling", "Unique Venue", "Monday Fun"],
  },
];

async function seed() {
  console.log("Seeding Firestore with", venues.length, "venues...");
  for (const venue of venues) {
    const { id, ...data } = venue;
    await setDoc(doc(db, "venues", id), data);
    console.log(`  ✓ ${venue.place}`);
  }
  console.log("Done!");
}

seed().catch(console.error);
