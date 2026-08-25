import { CITIES, CityEntry } from "./cities";
import { seededRandom } from "./seededRandom";
import { RouteData } from "./types";

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
  if (!origin || !dest) return null; // truly unrecognized city — still show honest "unknown city" state, not a fabricated route

  const rand = seededRandom(`${origin.name}->${dest.name}`);
  const distanceKm = Math.round(haversineKm(origin, dest));
  const avgSpeedKmh = 52;
  const durationHours = Math.round((distanceKm / avgSpeedKmh) * 10) / 10;
  const junction = nearestJunctionToMidpoint(origin, dest);

  const isDirectConfirmed = rand() < 0.15; // ~15% of generated routes need no optimization at all
  const wlDepth = 20 + Math.floor(rand() * 70);
  const price3A = Math.max(250, Math.round(distanceKm * 1.3)); // ensure positive realistic prices

  return {
    originCity: origin.name,
    destinationCity: dest.name,
    defaultClass: "3A",
    generated: true, // IMPORTANT: UI must show this is a procedurally generated example, not curated
    options: [
      {
        id: `${origin.stationCode}-${dest.stationCode}-direct`,
        type: "DIRECT",
        legs: [
          {
            trainNumber: trainNumber(rand),
            trainName: `${dest.name} Express`,
            departureTime: "18:30",
            arrivalTime: "—",
            dateOffset: Math.ceil(durationHours / 24),
            fromStation: `${origin.name} (${origin.stationCode})`,
            toStation: `${dest.name} (${dest.stationCode})`,
            class: "3A",
            status: isDirectConfirmed ? "CONFIRMED" : `WL ${wlDepth}`,
            price: price3A,
          },
        ],
        totalPrice: price3A,
        totalDurationHours: durationHours,
        confidenceScore: isDirectConfirmed ? 95 : Math.max(5, 30 - wlDepth / 3),
      },
      ...(isDirectConfirmed
        ? []
        : [
            {
              id: `${origin.stationCode}-${dest.stationCode}-split`,
              type: "SPLIT" as const,
              splitCity: junction.name,
              layoverHours: 2 + Math.round(rand() * 2 * 10) / 10,
              legs: [
                {
                  trainNumber: trainNumber(rand),
                  trainName: `${junction.name} Express`,
                  departureTime: "19:00",
                  arrivalTime: "—",
                  dateOffset: 1,
                  fromStation: `${origin.name} (${origin.stationCode})`,
                  toStation: `${junction.name} (${junction.stationCode})`,
                  class: "3A",
                  status: "CONFIRMED",
                  price: Math.max(100, Math.round(haversineKm(origin, junction) * 1.3)),
                },
                {
                  trainNumber: trainNumber(rand),
                  trainName: `${dest.name} Superfast Express`,
                  departureTime: "—",
                  arrivalTime: "—",
                  dateOffset: 1,
                  fromStation: `${junction.name} (${junction.stationCode})`,
                  toStation: `${dest.name} (${dest.stationCode})`,
                  class: "3A",
                  status: "CONFIRMED",
                  price: Math.max(100, Math.round(haversineKm(junction, dest) * 1.3)),
                },
              ],
              totalPrice: price3A + 150,
              totalDurationHours: durationHours * 1.1,
              confidenceScore: 85 + Math.floor(rand() * 10),
            },
          ]),
    ],
  };
}
