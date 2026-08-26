import { CITIES, CityEntry } from "./cities";
import { seededRandom } from "./seededRandom";
import { RouteData, TrainClass, DatasetOption } from "./types";
import { priceForClass, CLASS_MULTIPLIER } from "./pricing";

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

function nearestOtherCity(target: CityEntry, exclude: string[]): { city: CityEntry; distanceKm: number } {
  const candidates = CITIES.filter((c) => !exclude.includes(c.name));
  let best = candidates[0];
  let bestDist = haversineKm(target, best);
  for (const c of candidates) {
    const d = haversineKm(target, c);
    if (d < bestDist && d > 0) {
      best = c;
      bestDist = d;
    }
  }
  return { city: best, distanceKm: Math.round(bestDist) };
}

function trainNumber(rand: () => number): string {
  const ranges = [12000, 15000, 16000, 19000, 22000];
  const base = ranges[Math.floor(rand() * ranges.length)];
  return String(base + Math.floor(rand() * 900) + 10);
}

export function generateRoute(
  originName: string,
  destName: string,
  requestedClass: TrainClass = "3A"
): RouteData | null {
  const origin = findCity(originName);
  const dest = findCity(destName);
  if (!origin || !dest) return null; // genuinely unrecognized city — honest "unknown city" state

  const rand = seededRandom(`${origin.name}->${dest.name}->${requestedClass}`);
  const distanceKm = Math.round(haversineKm(origin, dest));
  const avgSpeedKmh = 52;
  const durationHours = Math.round((distanceKm / avgSpeedKmh) * 10) / 10;
  const junction = nearestJunctionToMidpoint(origin, dest);

  const isDirectConfirmed = rand() < 0.15;
  const wlDepth = 20 + Math.floor(rand() * 70);
  const price3ABase = Math.max(250, Math.round(distanceKm * 1.3));
  const durationStr = `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`;
  const splitDurationStr = `${Math.floor(durationHours * 1.1)}h ${Math.round(((durationHours * 1.1) % 1) * 60)}m`;

  const leg1Km = Math.round(haversineKm(origin, junction));
  const leg2Km = Math.round(haversineKm(junction, dest));

  // NEARBY station calculation
  const { city: nearbyCity, distanceKm: nearbyDist } = nearestOtherCity(dest, [origin.name, dest.name, junction.name]);
  const useSynthetic = nearbyDist > 80;
  const nearbyStationName = useSynthetic ? `${dest.name} Outer` : nearbyCity.name;
  const nearbyStationCode = useSynthetic ? `${dest.stationCode}O` : nearbyCity.stationCode;
  const nearbyDistanceKm = useSynthetic ? 15 + Math.floor(rand() * 20) : nearbyDist;

  const supportedClasses: TrainClass[] = ["SL", "3A", "2A", "1A"];

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
    classes: supportedClasses.map((cls) => {
      const directPrice = priceForClass(price3ABase, cls);
      const splitPrice = priceForClass(Math.round((leg1Km + leg2Km) * 1.3), cls) + 150;
      const nearbyPrice = directPrice - Math.round(directPrice * 0.08);

      const options: DatasetOption[] = [
        {
          type: "DIRECT",
          trainNumber: trainNumber(rand),
          trainName: `${dest.name} Express`,
          departure: "18:30",
          arrival: "08:30+1",
          duration: durationStr,
          fare: directPrice,
          status: isDirectConfirmed ? "CONFIRMED" : "WL",
          waitlistNumber: isDirectConfirmed ? undefined : wlDepth,
        },
      ];

      if (!isDirectConfirmed) {
        // SPLIT — always generated & confirmed when direct is WL
        options.push({
          type: "SPLIT",
          trainNumber: trainNumber(rand),
          trainName: `${junction.name} Express`,
          departure: "19:00",
          arrival: "10:30+1",
          duration: splitDurationStr,
          fare: splitPrice,
          status: "CONFIRMED",
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
        });

        // NEARBY — always generated & confirmed when direct is WL
        options.push({
          type: "NEARBY",
          trainNumber: trainNumber(rand),
          trainName: `${origin.name} ${nearbyStationName} Express`,
          departure: "20:15",
          arrival: "09:00+1",
          duration: durationStr,
          fare: nearbyPrice,
          status: "CONFIRMED",
          nearbyStation: `${nearbyStationName} (${nearbyStationCode})`,
          nearbyDistanceKm: nearbyDistanceKm,
        });
      }

      return {
        class: cls,
        options,
      };
    }),
  };
}
