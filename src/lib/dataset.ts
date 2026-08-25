import type { RouteData, TrainClass } from "./types";
import { generateRoute } from "./routeGenerator";

/**
 * Mock dataset — 6 route pairs, each with 2-3 classes.
 * All train numbers, timings, and fares are representative mock values.
 * No real PRS data; used only for hackathon demonstration.
 */
export const ROUTES: RouteData[] = [
  // ── Route 1: NDLS → PNBE (flagship) ─────────────────────────────────────
  {
    originCode: "NDLS",
    originName: "New Delhi",
    destinationCode: "PNBE",
    destinationName: "Patna Jn",
    aliases: {
      origin: ["delhi", "new delhi", "ndls", "dilli", "nai delhi", "old delhi", "hazrat nizamuddin"],
      destination: ["patna", "pnbe", "patna jn", "patna junction", "patna sahib"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12310",
            trainName: "Rajdhani Express",
            departure: "17:00",
            arrival: "06:30+1",
            duration: "13h 30m",
            fare: 2145,
            status: "WL",
            waitlistNumber: 47,
          },
          {
            type: "SPLIT",
            trainNumber: "12310",
            trainName: "Rajdhani Express",
            departure: "17:00",
            arrival: "06:30+1",
            duration: "13h 30m",
            fare: 2290,
            status: "CONFIRMED",
            splitStation: "Deen Dayal Upadhyaya Jn",
            splitLayoverMinutes: 0,
            leg1: {
              trainNumber: "12310",
              trainName: "Rajdhani Express",
              from: "New Delhi",
              to: "DDU Jn",
              departure: "17:00",
              arrival: "03:45+1",
            },
            leg2: {
              trainNumber: "12310",
              trainName: "Rajdhani Express",
              from: "DDU Jn",
              to: "Patna Jn",
              departure: "03:50+1",
              arrival: "06:30+1",
            },
          },
          {
            type: "NEARBY",
            trainNumber: "12802",
            trainName: "Purushottam Express",
            departure: "16:50",
            arrival: "07:20+1",
            duration: "14h 30m",
            fare: 1890,
            status: "CONFIRMED",
            nearbyStation: "Danapur",
            nearbyDistanceKm: 12,
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12310",
            trainName: "Rajdhani Express",
            departure: "17:00",
            arrival: "06:30+1",
            duration: "13h 30m",
            fare: 545,
            status: "WL",
            waitlistNumber: 12,
          },
          {
            type: "SPLIT",
            trainNumber: "12310",
            trainName: "Rajdhani Express",
            departure: "17:00",
            arrival: "06:30+1",
            duration: "13h 30m",
            fare: 590,
            status: "CONFIRMED",
            splitStation: "Deen Dayal Upadhyaya Jn",
            splitLayoverMinutes: 0,
            leg1: {
              trainNumber: "12310",
              trainName: "Rajdhani Express",
              from: "New Delhi",
              to: "DDU Jn",
              departure: "17:00",
              arrival: "03:45+1",
            },
            leg2: {
              trainNumber: "12310",
              trainName: "Rajdhani Express",
              from: "DDU Jn",
              to: "Patna Jn",
              departure: "03:50+1",
              arrival: "06:30+1",
            },
          },
        ],
      },
      {
        class: "2A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12310",
            trainName: "Rajdhani Express",
            departure: "17:00",
            arrival: "06:30+1",
            duration: "13h 30m",
            fare: 3245,
            status: "WL",
            waitlistNumber: 5,
          },
        ],
      },
    ],
  },

  // ── Route 2: CSMT/BCT → BSB (Mumbai → Varanasi) ──────────────────────────
  {
    originCode: "CSMT",
    originName: "Mumbai CSMT",
    destinationCode: "BSB",
    destinationName: "Varanasi Jn",
    aliases: {
      origin: ["mumbai", "csmt", "bct", "bombay", "dadar", "lokmanya tilak", "lt", "bandra", "vt"],
      destination: ["varanasi", "bsb", "banaras", "kashi", "varanasi jn"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12167",
            trainName: "Mumbai Banaras Express",
            departure: "23:30",
            arrival: "20:15+1",
            duration: "20h 45m",
            fare: 1875,
            status: "WL",
            waitlistNumber: 22,
          },
          {
            type: "SPLIT",
            trainNumber: "22127",
            trainName: "Anandwan SF Express",
            departure: "06:00",
            arrival: "22:40+1",
            duration: "16h 40m",
            fare: 1950,
            status: "CONFIRMED",
            splitStation: "Kalyan Jn",
            splitLayoverMinutes: 52,
            leg1: {
              trainNumber: "12167",
              trainName: "Mumbai Banaras Express",
              from: "Mumbai CSMT",
              to: "Kalyan Jn",
              departure: "23:30",
              arrival: "00:35+1",
            },
            leg2: {
              trainNumber: "22127",
              trainName: "Anandwan SF Express",
              from: "Kalyan Jn",
              to: "Varanasi Jn",
              departure: "01:27+1",
              arrival: "20:15+1",
            },
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "11093",
            trainName: "Mahanagari Express",
            departure: "11:05",
            arrival: "15:30+1",
            duration: "28h 25m",
            fare: 545,
            status: "CONFIRMED",
          },
        ],
      },
    ],
  },

  // ── Route 3: SBC → LKO (Bengaluru → Lucknow) ─────────────────────────────
  {
    originCode: "SBC",
    originName: "Bengaluru City",
    destinationCode: "LKO",
    destinationName: "Lucknow Charbagh",
    aliases: {
      origin: ["bengaluru", "bangalore", "sbc", "banglore", "yeshwanthpur", "ypr", "bengalore"],
      destination: ["lucknow", "lko", "lucknau", "lakhnaoo"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12591",
            trainName: "Gorakhpur Express",
            departure: "19:45",
            arrival: "18:30+2",
            duration: "46h 45m",
            fare: 2455,
            status: "WL",
            waitlistNumber: 31,
          },
          {
            type: "SPLIT",
            trainNumber: "12591",
            trainName: "Gorakhpur Express",
            departure: "19:45",
            arrival: "18:30+2",
            duration: "46h 45m",
            fare: 2610,
            status: "CONFIRMED",
            splitStation: "Nagpur",
            splitLayoverMinutes: 25,
            leg1: {
              trainNumber: "12591",
              trainName: "Gorakhpur Express",
              from: "Bengaluru City",
              to: "Nagpur",
              departure: "19:45",
              arrival: "08:20+1",
            },
            leg2: {
              trainNumber: "12591",
              trainName: "Gorakhpur Express",
              from: "Nagpur",
              to: "Lucknow",
              departure: "08:45+1",
              arrival: "18:30+2",
            },
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12591",
            trainName: "Gorakhpur Express",
            departure: "19:45",
            arrival: "18:30+2",
            duration: "46h 45m",
            fare: 785,
            status: "WL",
            waitlistNumber: 8,
          },
          {
            type: "SPLIT",
            trainNumber: "12591",
            trainName: "Gorakhpur Express",
            departure: "19:45",
            arrival: "18:30+2",
            duration: "46h 45m",
            fare: 840,
            status: "CONFIRMED",
            splitStation: "Nagpur",
            splitLayoverMinutes: 25,
            leg1: {
              trainNumber: "12591",
              trainName: "Gorakhpur Express",
              from: "Bengaluru City",
              to: "Nagpur",
              departure: "19:45",
              arrival: "08:20+1",
            },
            leg2: {
              trainNumber: "12591",
              trainName: "Gorakhpur Express",
              from: "Nagpur",
              to: "Lucknow",
              departure: "08:45+1",
              arrival: "18:30+2",
            },
          },
        ],
      },
      {
        class: "2A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12591",
            trainName: "Gorakhpur Express",
            departure: "19:45",
            arrival: "18:30+2",
            duration: "46h 45m",
            fare: 3590,
            status: "WL",
            waitlistNumber: 15,
          },
        ],
      },
    ],
  },

  // ── Route 4: MAS → PNBE (Chennai → Patna) ────────────────────────────────
  {
    originCode: "MAS",
    originName: "Chennai Central",
    destinationCode: "PNBE",
    destinationName: "Patna Jn",
    aliases: {
      origin: ["chennai", "mas", "madras", "chennai central", "egmore"],
      destination: ["patna", "pnbe", "patna jn", "patna junction"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "13351",
            trainName: "Dhanbad Express",
            departure: "11:10",
            arrival: "14:20+1",
            duration: "27h 10m",
            fare: 2185,
            status: "WL",
            waitlistNumber: 19,
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "13351",
            trainName: "Dhanbad Express",
            departure: "11:10",
            arrival: "14:20+1",
            duration: "27h 10m",
            fare: 645,
            status: "CONFIRMED",
          },
        ],
      },
    ],
  },

  // ── Route 5: HWH → NDLS (Kolkata → Delhi) ────────────────────────────────
  {
    originCode: "HWH",
    originName: "Howrah Jn",
    destinationCode: "NDLS",
    destinationName: "New Delhi",
    aliases: {
      origin: ["kolkata", "calcutta", "hwh", "howrah", "howrah jn", "sealdah", "sdah"],
      destination: ["delhi", "new delhi", "ndls", "dilli"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12301",
            trainName: "Howrah Rajdhani",
            departure: "14:05",
            arrival: "10:00+1",
            duration: "19h 55m",
            fare: 2340,
            status: "WL",
            waitlistNumber: 38,
          },
          {
            type: "SPLIT",
            trainNumber: "12301",
            trainName: "Howrah Rajdhani",
            departure: "14:05",
            arrival: "10:00+1",
            duration: "19h 55m",
            fare: 2490,
            status: "CONFIRMED",
            splitStation: "Asansol Jn",
            splitLayoverMinutes: 0,
            leg1: {
              trainNumber: "12301",
              trainName: "Howrah Rajdhani",
              from: "Howrah Jn",
              to: "Asansol Jn",
              departure: "14:05",
              arrival: "16:50",
            },
            leg2: {
              trainNumber: "12301",
              trainName: "Howrah Rajdhani",
              from: "Asansol Jn",
              to: "New Delhi",
              departure: "16:55",
              arrival: "10:00+1",
            },
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12311",
            trainName: "Kalka Mail",
            departure: "19:35",
            arrival: "10:15+1",
            duration: "14h 40m",
            fare: 590,
            status: "WL",
            waitlistNumber: 6,
          },
          {
            type: "SPLIT",
            trainNumber: "12311",
            trainName: "Kalka Mail",
            departure: "19:35",
            arrival: "10:15+1",
            duration: "14h 40m",
            fare: 640,
            status: "CONFIRMED",
            splitStation: "Asansol Jn",
            splitLayoverMinutes: 0,
            leg1: {
              trainNumber: "12311",
              trainName: "Kalka Mail",
              from: "Howrah Jn",
              to: "Asansol Jn",
              departure: "19:35",
              arrival: "22:05",
            },
            leg2: {
              trainNumber: "12311",
              trainName: "Kalka Mail",
              from: "Asansol Jn",
              to: "New Delhi",
              departure: "22:10",
              arrival: "10:15+1",
            },
          },
        ],
      },
      {
        class: "2A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "12301",
            trainName: "Howrah Rajdhani",
            departure: "14:05",
            arrival: "10:00+1",
            duration: "19h 55m",
            fare: 3480,
            status: "WL",
            waitlistNumber: 22,
          },
          {
            type: "SPLIT",
            trainNumber: "12301",
            trainName: "Howrah Rajdhani",
            departure: "14:05",
            arrival: "10:00+1",
            duration: "19h 55m",
            fare: 3640,
            status: "CONFIRMED",
            splitStation: "Asansol Jn",
            splitLayoverMinutes: 0,
            leg1: {
              trainNumber: "12301",
              trainName: "Howrah Rajdhani",
              from: "Howrah Jn",
              to: "Asansol Jn",
              departure: "14:05",
              arrival: "16:50",
            },
            leg2: {
              trainNumber: "12301",
              trainName: "Howrah Rajdhani",
              from: "Asansol Jn",
              to: "New Delhi",
              departure: "16:55",
              arrival: "10:00+1",
            },
          },
        ],
      },
    ],
  },

  // ── Route 6: ADI → GKP (Ahmedabad → Gorakhpur) ───────────────────────────
  {
    originCode: "ADI",
    originName: "Ahmedabad Jn",
    destinationCode: "GKP",
    destinationName: "Gorakhpur Jn",
    aliases: {
      origin: ["ahmedabad", "adi", "amdavad", "ahmadabad"],
      destination: ["gorakhpur", "gkp", "gorakhpur jn"],
    },
    classes: [
      {
        class: "3A",
        options: [
          {
            type: "DIRECT",
            trainNumber: "19409",
            trainName: "Gorakhpur Express",
            departure: "23:00",
            arrival: "18:30+1",
            duration: "19h 30m",
            fare: 1675,
            status: "WL",
            waitlistNumber: 14,
          },
        ],
      },
      {
        class: "SL",
        options: [
          {
            type: "DIRECT",
            trainNumber: "19409",
            trainName: "Gorakhpur Express",
            departure: "23:00",
            arrival: "18:30+1",
            duration: "19h 30m",
            fare: 475,
            status: "CONFIRMED",
          },
        ],
      },
    ],
  },
];

/** Find a route in the dataset by fuzzy city matching (curated first, then procedural generator) */
export function findRoute(origin: string, destination: string, requestedClass?: TrainClass): RouteData | null {
  const o = origin.toLowerCase().trim();
  const d = destination.toLowerCase().trim();

  const curated = ROUTES.find(
    (r) =>
      (r.aliases.origin.some((a) => o.includes(a) || a.includes(o)) ||
        r.originName.toLowerCase().includes(o) ||
        r.originCode.toLowerCase() === o) &&
      (r.aliases.destination.some((a) => d.includes(a) || a.includes(d)) ||
        r.destinationName.toLowerCase().includes(d) ||
        r.destinationCode.toLowerCase() === d)
  );

  if (curated) return curated;

  return generateRoute(origin, destination, requestedClass ?? "3A");
}

/** All classes available on a route */
export function getAvailableClasses(route: RouteData): string[] {
  return route.classes.map((c) => c.class);
}
