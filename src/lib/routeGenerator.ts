import { CITIES, CityEntry } from "./cities";
import { seededRandom } from "./seededRandom";
import { RouteData, TrainClass } from "./types";

function haversineKm(a: CityEntry, b: CityEntry): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function findCity(name: string): CityEntry | null {
  const n = name.trim().toLowerCase();
  return (
    CITIES.find(
      (c) =>
        c.name.toLowerCase() === n ||
        c.aliases.some((a) => a.toLowerCase() === n)
    ) ?? null
  );
}

function nearestJunctionToMidpoint(a: CityEntry, b: CityEntry): CityEntry {
  const mid = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 } as CityEntry;
  const candidates = CITIES.filter(
    (c) => c.isJunction && c.name !== a.name && c.name !== b.name
  );
  return candidates.reduce((closest, c) => {
    const d = haversineKm(mid, c);
    const dClosest = haversineKm(mid, closest);
    return d < dClosest ? c : closest;
  }, candidates[0]);
}

function trainNumber(rand: () => number): string {
  const ranges = [12000, 15000, 16000, 19000, 22000];
  const base = ranges[Math.floor(rand() * ranges.length)];
  return String(base + Math.floor(rand() * 900) + 10);
}

export function generateRoute(originName: string, destName: string): RouteData | null {
  const origin = findCity(originName);
  const dest = findCity(destName);
  if (!origin || !dest) return null; // truly unrecognized city

  const rand = seededRandom(`${origin.name}->${dest.name}`);
  const distanceKm = Math.round(haversineKm(origin, dest));
  const avgSpeedKmh = 52;
  const durationHours = Math.round((distanceKm / avgSpeedKmh) * 10) / 10;
  const junction = nearestJunctionToMidpoint(origin, dest);

  const isDirectConfirmed = rand() < 0.15; // ~15% of generated routes need no optimization
  const wlDepth = 20 + Math.floor(rand() * 70);
  const price3A = Math.max(250, Math.round(distanceKm * 1.3));
  const durationStr = `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`;
  const splitDurationStr = `${Math.floor(durationHours * 1.1)}h ${Math.round(((durationHours * 1.1) % 1) * 60)}m`;

  const classes: TrainClass[] = ["3A", "SL", "2A", "1A"];

  return {
    originCode: origin.stationCode,
    originName: origin.name,
    destinationCode: dest.stationCode,
    destinationName: dest.name,
    generated: true,
    aliases: {
      origin: [origin.name.toLowerCase(), ...origin.aliases.map((a) => a.toLowerCase())],
      destination: [dest.name.toLowerCase(), ...dest.aliases.map((a) => a.toLowerCase())],
    },
    classes: classes.map((cls) => {
      const classMultiplier = cls === "1A" ? 3.0 : cls === "2A" ? 1.8 : cls === "3A" ? 1.0 : 0.35;
      const fare = Math.round(price3A * classMultiplier);
      const splitFare = fare + Math.round(150 * classMultiplier);

      return {
        class: cls,
        options: [
          {
            type: "DIRECT" as const,
            trainNumber: trainNumber(rand),
            trainName: `${dest.name} Express`,
            departure: "18:30",
            arrival: "08:30+1",
            duration: durationStr,
            fare,
            status: (isDirectConfirmed ? "CONFIRMED" : "WL") as "CONFIRMED" | "WL",
            waitlistNumber: isDirectConfirmed ? undefined : wlDepth,
          },
          ...(isDirectConfirmed
            ? []
            : [
                {
                  type: "SPLIT" as const,
                  trainNumber: trainNumber(rand),
                  trainName: `${junction.name} Express`,
                  departure: "19:00",
                  arrival: "10:30+1",
                  duration: splitDurationStr,
                  fare: splitFare,
                  status: "CONFIRMED" as const,
                  splitStation: `${junction.name} Jn`,
                  splitLayoverMinutes: Math.round((2 + rand() * 2) * 60),
                  leg1: {
                    trainNumber: trainNumber(rand),
                    trainName: `${junction.name} Express`,
                    from: `${origin.name} (${origin.stationCode})`,
                    to: `${junction.name} (${junction.stationCode})`,
                    departure: "19:00",
                    arrival: "02:30+1",
                  },
                  leg2: {
                    trainNumber: trainNumber(rand),
                    trainName: `${dest.name} Superfast Express`,
                    from: `${junction.name} (${junction.stationCode})`,
                    to: `${dest.name} (${dest.stationCode})`,
                    departure: "04:30+1",
                    arrival: "10:30+1",
                  },
                },
              ]),
        ],
      };
    }),
  };
}
