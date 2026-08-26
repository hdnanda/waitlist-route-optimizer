import type { RouteData, TrainClass, RouteClassData, DatasetOption } from "./types";
import { generateRoute } from "./routeGenerator";
import { priceForClass } from "./pricing";

interface CuratedOptionTemplate {
  type: "DIRECT" | "SPLIT" | "NEARBY";
  trainNumber: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  fare3A: number;
  status: "CONFIRMED" | "WL" | "RAC";
  waitlistNumber?: number;
  splitStation?: string;
  splitLayoverMinutes?: number;
  nearbyStation?: string;
  nearbyDistanceKm?: number;
  leg1?: {
    trainNumber: string;
    trainName: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
  };
  leg2?: {
    trainNumber: string;
    trainName: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
  };
}

interface CuratedRouteTemplate {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  aliases: {
    origin: string[];
    destination: string[];
  };
  options: CuratedOptionTemplate[];
}

const CURATED_TEMPLATES: CuratedRouteTemplate[] = [
  // ── Route 1: NDLS → PNBE (New Delhi → Patna) ──────────────────────────────
  {
    originCode: "NDLS",
    originName: "New Delhi",
    destinationCode: "PNBE",
    destinationName: "Patna Jn",
    aliases: {
      origin: ["delhi", "new delhi", "ndls", "dilli", "nai delhi", "old delhi", "hazrat nizamuddin"],
      destination: ["patna", "pnbe", "patna jn", "patna junction", "patna sahib"],
    },
    options: [
      {
        type: "DIRECT",
        trainNumber: "12310",
        trainName: "Rajdhani Express",
        departure: "17:00",
        arrival: "06:30+1",
        duration: "13h 30m",
        fare3A: 2145,
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
        fare3A: 2290,
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
        fare3A: 1890,
        status: "CONFIRMED",
        nearbyStation: "Danapur",
        nearbyDistanceKm: 12,
      },
    ],
  },

  // ── Route 2: CSMT → BSB (Mumbai → Varanasi) ──────────────────────────────
  {
    originCode: "CSMT",
    originName: "Mumbai CSMT",
    destinationCode: "BSB",
    destinationName: "Varanasi Jn",
    aliases: {
      origin: ["mumbai", "csmt", "bct", "bombay", "dadar", "lokmanya tilak", "lt", "bandra", "vt"],
      destination: ["varanasi", "bsb", "banaras", "kashi", "varanasi jn"],
    },
    options: [
      {
        type: "DIRECT",
        trainNumber: "12167",
        trainName: "Mumbai Banaras Express",
        departure: "23:30",
        arrival: "20:15+1",
        duration: "20h 45m",
        fare3A: 1875,
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
        fare3A: 1950,
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
      {
        type: "NEARBY",
        trainNumber: "12562",
        trainName: "Swatantrata Sainik Express",
        departure: "21:10",
        arrival: "18:40+1",
        duration: "21h 30m",
        fare3A: 1725,
        status: "CONFIRMED",
        nearbyStation: "Manduadih (Banaras)",
        nearbyDistanceKm: 4,
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
    options: [
      {
        type: "DIRECT",
        trainNumber: "12591",
        trainName: "Gorakhpur Express",
        departure: "19:45",
        arrival: "18:30+2",
        duration: "46h 45m",
        fare3A: 2455,
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
        fare3A: 2610,
        status: "CONFIRMED",
        splitStation: "Nagpur",
        splitLayoverMinutes: 25,
        leg1: {
          trainNumber: "12591",
          trainName: "Gorakhpur Express",
          from: "Bengaluru City",
          to: "Nagpur Jn",
          departure: "19:45",
          arrival: "16:20+1",
        },
        leg2: {
          trainNumber: "12591",
          trainName: "Gorakhpur Express",
          from: "Nagpur Jn",
          to: "Lucknow Charbagh",
          departure: "16:45+1",
          arrival: "18:30+2",
        },
      },
      {
        type: "NEARBY",
        trainNumber: "22683",
        trainName: "Lucknow SF Express",
        departure: "23:40",
        arrival: "19:20+2",
        duration: "43h 40m",
        fare3A: 2260,
        status: "CONFIRMED",
        nearbyStation: "Lucknow City (LC)",
        nearbyDistanceKm: 6,
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
      origin: ["chennai", "mas", "madras", "chennai central"],
      destination: ["patna", "pnbe", "patna jn", "patna junction"],
    },
    options: [
      {
        type: "DIRECT",
        trainNumber: "12669",
        trainName: "Ganga Kaveri Express",
        departure: "17:40",
        arrival: "06:30+2",
        duration: "36h 50m",
        fare3A: 2310,
        status: "WL",
        waitlistNumber: 19,
      },
      {
        type: "SPLIT",
        trainNumber: "12669",
        trainName: "Ganga Kaveri Express",
        departure: "17:40",
        arrival: "06:30+2",
        duration: "36h 50m",
        fare3A: 2465,
        status: "CONFIRMED",
        splitStation: "Vijayawada Jn",
        splitLayoverMinutes: 15,
        leg1: {
          trainNumber: "12669",
          trainName: "Ganga Kaveri Express",
          from: "Chennai Central",
          to: "Vijayawada Jn",
          departure: "17:40",
          arrival: "23:55",
        },
        leg2: {
          trainNumber: "12669",
          trainName: "Ganga Kaveri Express",
          from: "Vijayawada Jn",
          to: "Patna Jn",
          departure: "00:10+1",
          arrival: "06:30+2",
        },
      },
      {
        type: "NEARBY",
        trainNumber: "12295",
        trainName: "Sanghamitra Express",
        departure: "15:40",
        arrival: "07:45+2",
        duration: "40h 05m",
        fare3A: 2125,
        status: "CONFIRMED",
        nearbyStation: "Patliputra Jn",
        nearbyDistanceKm: 10,
      },
    ],
  },

  // ── Route 5: HWH → NDLS (Howrah → New Delhi) ─────────────────────────────
  {
    originCode: "HWH",
    originName: "Howrah Jn",
    destinationCode: "NDLS",
    destinationName: "New Delhi",
    aliases: {
      origin: ["howrah", "hwh", "kolkata", "calcutta", "sealdah"],
      destination: ["delhi", "new delhi", "ndls", "dilli", "old delhi"],
    },
    options: [
      {
        type: "DIRECT",
        trainNumber: "12301",
        trainName: "Howrah Rajdhani",
        departure: "16:50",
        arrival: "10:00+1",
        duration: "17h 10m",
        fare3A: 2050,
        status: "WL",
        waitlistNumber: 38,
      },
      {
        type: "SPLIT",
        trainNumber: "12301",
        trainName: "Howrah Rajdhani",
        departure: "16:50",
        arrival: "10:00+1",
        duration: "17h 10m",
        fare3A: 2190,
        status: "CONFIRMED",
        splitStation: "Asansol Jn",
        splitLayoverMinutes: 5,
        leg1: {
          trainNumber: "12301",
          trainName: "Howrah Rajdhani",
          from: "Howrah Jn",
          to: "Asansol Jn",
          departure: "16:50",
          arrival: "19:10",
        },
        leg2: {
          trainNumber: "12301",
          trainName: "Howrah Rajdhani",
          from: "Asansol Jn",
          to: "New Delhi",
          departure: "19:15",
          arrival: "10:00+1",
        },
      },
      {
        type: "NEARBY",
        trainNumber: "12381",
        trainName: "Poorva Express",
        departure: "08:15",
        arrival: "06:05+1",
        duration: "21h 50m",
        fare3A: 1885,
        status: "CONFIRMED",
        nearbyStation: "Delhi Sarai Rohilla (DEE)",
        nearbyDistanceKm: 8,
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
    options: [
      {
        type: "DIRECT",
        trainNumber: "19409",
        trainName: "Gorakhpur Express",
        departure: "23:00",
        arrival: "18:30+1",
        duration: "19h 30m",
        fare3A: 1675,
        status: "WL",
        waitlistNumber: 14,
      },
      {
        type: "SPLIT",
        trainNumber: "19409",
        trainName: "Gorakhpur Express",
        departure: "23:00",
        arrival: "18:30+1",
        duration: "19h 30m",
        fare3A: 1795,
        status: "CONFIRMED",
        splitStation: "Kanpur Central",
        splitLayoverMinutes: 15,
        leg1: {
          trainNumber: "19409",
          trainName: "Gorakhpur Express",
          from: "Ahmedabad Jn",
          to: "Kanpur Central",
          departure: "23:00",
          arrival: "12:15+1",
        },
        leg2: {
          trainNumber: "19409",
          trainName: "Gorakhpur Express",
          from: "Kanpur Central",
          to: "Gorakhpur Jn",
          departure: "12:30+1",
          arrival: "18:30+1",
        },
      },
      {
        type: "NEARBY",
        trainNumber: "19037",
        trainName: "Avadh Express",
        departure: "23:15",
        arrival: "20:00+1",
        duration: "20h 45m",
        fare3A: 1540,
        status: "CONFIRMED",
        nearbyStation: "Deoria Sadar",
        nearbyDistanceKm: 50,
      },
    ],
  },
];

const SUPPORTED_CLASSES: TrainClass[] = ["SL", "3A", "2A", "1A"];

/** Build full RouteData with systematically derived prices across SL, 3A, 2A, 1A */
function buildCuratedRoute(template: CuratedRouteTemplate): RouteData {
  const classes: RouteClassData[] = SUPPORTED_CLASSES.map((cls) => {
    const options: DatasetOption[] = template.options.map((opt) => {
      const scaledFare = priceForClass(opt.fare3A, cls);
      return {
        type: opt.type,
        trainNumber: opt.trainNumber,
        trainName: opt.trainName,
        departure: opt.departure,
        arrival: opt.arrival,
        duration: opt.duration,
        fare: scaledFare,
        status: opt.status,
        waitlistNumber: opt.waitlistNumber,
        splitStation: opt.splitStation,
        splitLayoverMinutes: opt.splitLayoverMinutes,
        nearbyStation: opt.nearbyStation,
        nearbyDistanceKm: opt.nearbyDistanceKm,
        leg1: opt.leg1 ? { ...opt.leg1 } : undefined,
        leg2: opt.leg2 ? { ...opt.leg2 } : undefined,
      };
    });

    return {
      class: cls,
      options,
    };
  });

  return {
    originCode: template.originCode,
    originName: template.originName,
    destinationCode: template.destinationCode,
    destinationName: template.destinationName,
    aliases: template.aliases,
    classes,
  };
}

export const ROUTES: RouteData[] = CURATED_TEMPLATES.map(buildCuratedRoute);

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
