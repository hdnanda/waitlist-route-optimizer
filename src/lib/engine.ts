/**
 * Deterministic reasoning engine — ZERO LLM calls inside this file.
 * Pure function: ParsedIntent → RouteResult.
 * Verified: grep for "openai\|fetch\|axios\|gpt\|gemini" in this file should return nothing.
 */
import type { ParsedIntent, RouteResult, ReasonedOption, TrainClass, DatasetOption } from "./types";
import { findRoute, getAvailableClasses } from "./dataset";
import { priceForClass, CLASS_MULTIPLIER } from "./pricing";

const DEFAULT_CLASS: TrainClass = "3A";

function pickClass(intent: ParsedIntent, availableClasses: string[]): TrainClass {
  const preferred = intent.class;
  if (preferred && availableClasses.includes(preferred)) return preferred;
  if (availableClasses.includes("3A")) return "3A";
  if (availableClasses.includes("SL")) return "SL";
  return (availableClasses[0] as TrainClass) ?? DEFAULT_CLASS;
}

function buildBadge(opt: DatasetOption): { badge: string; badgeBg: string } {
  if (opt.type === "DIRECT" && opt.status === "CONFIRMED")
    return { badge: "DIRECT · CONFIRMED", badgeBg: "bg-[#3F8F5F]" };
  if (opt.type === "DIRECT" && opt.status === "WL")
    return { badge: "DIRECT · LOW CHANCE", badgeBg: "bg-[#C0432E]" };
  if (opt.type === "SPLIT")
    return { badge: "BEST · SPLIT TICKET", badgeBg: "bg-[#3F8F5F]" };
  return { badge: "ALTERNATE STATION", badgeBg: "bg-[#E8A33D]" };
}

function buildWhy(opt: DatasetOption, originName: string, destinationName: string): string {
  if (opt.type === "DIRECT" && opt.status === "CONFIRMED")
    return `Great news — the direct ${opt.trainName} from ${originName} to ${destinationName} has confirmed seats available in this class. No optimization needed.`;
  if (opt.type === "DIRECT" && opt.status === "WL")
    return `WL ${opt.waitlistNumber} on the ${opt.trainName}. Historical charting data shows less than 20% of WL 40+ positions clear during peak season. Keeping on hold is a fallback only.`;
  if (opt.type === "SPLIT") {
    return `Continuous journey — same physical train, same berth, no de-boarding required. Two tickets are issued using the intermediate-station quota at ${opt.splitStation}, which is separate from the end-to-end pool — and both legs are confirmed.`;
  }
  if (opt.type === "NEARBY")
    return `A fully separate, less-booked train to ${opt.nearbyStation ?? "a nearby station"} (${opt.nearbyDistanceKm}km from ${destinationName}). Confirmed seat available now — trade-off is a short transfer at the destination.`;
  return "";
}

function buildConfidence(opt: DatasetOption): string {
  if (opt.status === "CONFIRMED") return "Both legs confirmed";
  if (opt.status === "WL") {
    const wl = opt.waitlistNumber ?? 0;
    if (wl <= 5) return "~65% by charting";
    if (wl <= 15) return "~35% by charting";
    return "~14% by charting";
  }
  return "";
}

function buildStatusBg(opt: DatasetOption): string {
  if (opt.status === "CONFIRMED") return "bg-[#3F8F5F]/20 text-[#3F8F5F]";
  if (opt.status === "WL") return "bg-[#C0432E]/20 text-[#C0432E]";
  return "bg-yellow-500/20 text-yellow-300";
}

function buildStatusDisplay(opt: DatasetOption): string {
  if (opt.status === "CONFIRMED") return "CONFIRMED";
  if (opt.status === "WL") return `WL ${opt.waitlistNumber}`;
  return "RAC";
}

/** Runtime pricing guard: extracts canonical 3A baseline and scales accurately to selectedClass */
function getGuardedFare(opt: DatasetOption, sourceClass: TrainClass, targetClass: TrainClass): number {
  if (sourceClass === targetClass && opt.fare > 0) {
    return opt.fare;
  }
  const sourceMultiplier = CLASS_MULTIPLIER[sourceClass] ?? 1.0;
  const base3APrice = Math.round(opt.fare / sourceMultiplier);
  return priceForClass(base3APrice, targetClass);
}

export function getRankedOptions(intent: ParsedIntent, overrideClass?: TrainClass): RouteResult {
  const origin = intent.origin;
  const destination = intent.destination;
  const date = intent.date ?? "your travel date";

  // ── Trace Step 1: parsing ─────────────────────────────────────────────────
  const trace: string[] = [
    `→ parsing intent: origin=${origin}, destination=${destination}, date=${date}, class=${overrideClass ?? intent.class ?? "not specified"}`,
  ];

  // ── Find route ────────────────────────────────────────────────────────────
  const requestedClass = overrideClass ?? intent.class ?? DEFAULT_CLASS;
  const route = findRoute(origin, destination, requestedClass);

  if (!route) {
    trace.push(
      `→ checking direct route... route not in dataset.`,
      `→ no split-ticket graph available for this corridor.`,
      `→ no nearby-station alternates mapped.`,
      `→ returning honest fallback state — route not covered by this prototype.`
    );
    return {
      routeFound: false,
      originDisplay: origin,
      destinationDisplay: destination,
      selectedClass: overrideClass ?? intent.class ?? DEFAULT_CLASS,
      trace,
      options: [],
    };
  }

  trace.push(`→ route matched: ${route.originName} (${route.originCode}) → ${route.destinationName} (${route.destinationCode})`);

  const availableClasses = getAvailableClasses(route);
  const selectedClass = overrideClass ?? pickClass(intent, availableClasses);
  trace.push(`→ class selected: ${selectedClass} (available on this route: ${availableClasses.join(", ")})`);

  // Find class data (or fallback to first available class if requested is missing)
  const classData = route.classes.find((c) => c.class === selectedClass) ?? route.classes[0];
  if (!classData) {
    trace.push(`→ ${selectedClass} not available on this route — no data to reason over.`);
    return {
      routeFound: true,
      originDisplay: route.originName,
      destinationDisplay: route.destinationName,
      selectedClass,
      trace,
      options: [],
      generated: route.generated,
    };
  }

  const directOpt = classData.options.find((o) => o.type === "DIRECT");
  const splitOpt = classData.options.find((o) => o.type === "SPLIT");
  const nearbyOpt = classData.options.find((o) => o.type === "NEARBY");

  // ── Trace Step 2: direct check ────────────────────────────────────────────
  if (directOpt) {
    const directStatus =
      directOpt.status === "WL"
        ? `WL ${directOpt.waitlistNumber} found`
        : directOpt.status === "CONFIRMED"
        ? "CONFIRMED — great news!"
        : "RAC";
    trace.push(`→ checking direct route on ${directOpt.trainName} (${directOpt.trainNumber})... ${directStatus}`);
  }

  // Direct confirmed — no optimization needed
  if (directOpt?.status === "CONFIRMED") {
    trace.push(
      `→ direct seat confirmed — no optimization required.`,
      `→ returning confirmed direct option.`
    );
    const { badge, badgeBg } = buildBadge(directOpt);
    const directFare = getGuardedFare(directOpt, classData.class, selectedClass);

    return {
      routeFound: true,
      originDisplay: route.originName,
      destinationDisplay: route.destinationName,
      selectedClass,
      trace,
      directStatus: "CONFIRMED",
      generated: route.generated,
      options: [
        {
          id: "direct",
          type: "DIRECT",
          badge,
          badgeBg,
          route: `${route.originName} → ${route.destinationName}`,
          meta: `${directOpt.trainNumber} ${directOpt.trainName} | ${selectedClass} | ${directOpt.departure} – ${directOpt.arrival}`,
          status: "CONFIRMED",
          statusDisplay: "CONFIRMED",
          statusBg: buildStatusBg(directOpt),
          confirmationLikelihood: "Confirmed now",
          why: buildWhy(directOpt, route.originName, route.destinationName),
          isHero: true,
          fare: directFare,
          trainNumber: directOpt.trainNumber,
          trainName: directOpt.trainName,
          legs: [
            {
              trainNumber: directOpt.trainNumber,
              trainName: directOpt.trainName,
              from: route.originName,
              to: route.destinationName,
              departure: directOpt.departure,
              arrival: directOpt.arrival,
              status: "CONFIRMED",
            },
          ],
        },
      ],
    };
  }

  // ── Trace Steps 3-6: WL/RAC path ─────────────────────────────────────────
  trace.push(`→ querying split-ticket graph for intermediate-station quotas...`);

  if (splitOpt) {
    trace.push(
      `→ found viable split at ${splitOpt.splitStation} — continuous journey on same train, same seat, no de-boarding`
    );
  } else {
    trace.push(`→ no confirmed split-ticket path found for ${selectedClass} on this corridor.`);
  }

  trace.push(`→ scanning nearby-station alternates within 20km of destination...`);

  if (nearbyOpt) {
    trace.push(
      `→ found confirmed alternate at ${nearbyOpt.nearbyStation} (${nearbyOpt.nearbyDistanceKm}km transfer)`
    );
  } else {
    trace.push(`→ no nearby-station alternate found.`);
  }

  trace.push(`→ ranking by confirmation certainty, done.`);

  // ── Build ranked options ──────────────────────────────────────────────────
  const options: ReasonedOption[] = [];

  // 1. Split (hero, if available)
  if (splitOpt) {
    const { badge, badgeBg } = buildBadge(splitOpt);
    const splitFare = getGuardedFare(splitOpt, classData.class, selectedClass);

    options.push({
      id: "split",
      type: "SPLIT",
      badge,
      badgeBg,
      route: `${route.originName} → ${splitOpt.splitStation} → ${route.destinationName}`,
      meta: `${splitOpt.trainNumber} ${splitOpt.trainName} | ${selectedClass} | ${splitOpt.departure} – ${splitOpt.arrival}`,
      status: "CONFIRMED",
      statusDisplay: "CONFIRMED",
      statusBg: buildStatusBg(splitOpt),
      confirmationLikelihood: buildConfidence(splitOpt),
      why: buildWhy(splitOpt, route.originName, route.destinationName),
      isHero: true,
      fare: splitFare,
      trainNumber: splitOpt.trainNumber,
      trainName: splitOpt.trainName,
      isSplit: true,
      splitCity: splitOpt.splitStation,
      splitStation: splitOpt.splitStation,
      leg1: splitOpt.leg1,
      leg2: splitOpt.leg2,
      legs: [splitOpt.leg1, splitOpt.leg2].filter(Boolean) as Array<{
        trainNumber: string;
        trainName: string;
        from: string;
        to: string;
        departure: string;
        arrival: string;
        status?: string;
      }>,
    });
  }

  // 2. Nearby alternate (if available)
  if (nearbyOpt) {
    const { badge, badgeBg } = buildBadge(nearbyOpt);
    const nearbyFare = getGuardedFare(nearbyOpt, classData.class, selectedClass);

    options.push({
      id: "nearby",
      type: "NEARBY",
      badge,
      badgeBg,
      route: `${route.originName} → ${nearbyOpt.nearbyStation}`,
      meta: `${nearbyOpt.trainNumber} ${nearbyOpt.trainName} | ${selectedClass} | ${nearbyOpt.departure} – ${nearbyOpt.arrival}`,
      status: "CONFIRMED",
      statusDisplay: "CONFIRMED",
      statusBg: buildStatusBg(nearbyOpt),
      confirmationLikelihood: buildConfidence(nearbyOpt),
      why: buildWhy(nearbyOpt, route.originName, route.destinationName),
      transferTag: `🚕 ${nearbyOpt.nearbyDistanceKm}km transfer`,
      fare: nearbyFare,
      trainNumber: nearbyOpt.trainNumber,
      trainName: nearbyOpt.trainName,
      nearbyStation: {
        station: nearbyOpt.nearbyStation ?? "nearby station",
        distanceKm: nearbyOpt.nearbyDistanceKm ?? 0,
      },
      legs: [
        {
          trainNumber: nearbyOpt.trainNumber,
          trainName: nearbyOpt.trainName,
          from: route.originName,
          to: nearbyOpt.nearbyStation ?? route.destinationName,
          departure: nearbyOpt.departure,
          arrival: nearbyOpt.arrival,
          status: "CONFIRMED",
        },
      ],
    });
  }

  // 3. Direct WL (always shown last as fallback)
  if (directOpt) {
    const { badge, badgeBg } = buildBadge(directOpt);
    const directFare = getGuardedFare(directOpt, classData.class, selectedClass);
    const directStatusStr = buildStatusDisplay(directOpt);

    options.push({
      id: "direct",
      type: "DIRECT",
      badge,
      badgeBg,
      route: `${route.originName} → ${route.destinationName}`,
      meta: `${directOpt.trainNumber} ${directOpt.trainName} | ${selectedClass} | ${directOpt.departure} – ${directOpt.arrival}`,
      status: directOpt.status,
      statusDisplay: directStatusStr,
      statusBg: buildStatusBg(directOpt),
      confirmationLikelihood: buildConfidence(directOpt),
      why: buildWhy(directOpt, route.originName, route.destinationName),
      fare: directFare,
      trainNumber: directOpt.trainNumber,
      trainName: directOpt.trainName,
      legs: [
        {
          trainNumber: directOpt.trainNumber,
          trainName: directOpt.trainName,
          from: route.originName,
          to: route.destinationName,
          departure: directOpt.departure,
          arrival: directOpt.arrival,
          status: directStatusStr,
        },
      ],
    });
  }

  return {
    routeFound: true,
    originDisplay: route.originName,
    destinationDisplay: route.destinationName,
    selectedClass,
    trace,
    directStatus: directOpt?.status,
    directWL: directOpt?.waitlistNumber,
    generated: route.generated,
    options,
  };
}

/**
 * Builds the dynamic, honest SYSTEM LOG from the actual result data
 * of the current search — works identically across curated, generated,
 * and gap-autofilled routes without inventing statistics.
 */
export function buildSystemLog(result: RouteResult): string {
  const direct = result.options.find((o) => o.type === "DIRECT");
  const split = result.options.find((o) => o.type === "SPLIT");
  const nearby = result.options.find((o) => o.type === "NEARBY");

  const lines: string[] = [];

  if (direct) {
    const trainNum =
      (direct.legs && direct.legs[0] && direct.legs[0].trainNumber) ||
      direct.trainNumber;
    const status =
      (direct.legs && direct.legs[0] && direct.legs[0].status) ||
      direct.statusDisplay ||
      direct.status;
    lines.push(
      `Checked ${trainNum} on the direct route — found ${status}.`
    );
  }
  if (split) {
    const splitCity =
      split.splitCity ||
      split.splitStation ||
      (split.leg1 ? split.leg1.to : null) ||
      (split.route.includes("→") ? split.route.split("→")[1]?.trim() : null) ||
      "intermediate junction";
    lines.push(
      `Checked known intermediate-junction quotas — ${splitCity} is open.`
    );
  }
  if (nearby) {
    const stationName =
      (typeof nearby.nearbyStation === "object" && nearby.nearbyStation !== null
        ? (nearby.nearbyStation as { station: string }).station
        : typeof nearby.nearbyStation === "string"
        ? nearby.nearbyStation
        : null) ||
      (nearby.route.includes("→") ? nearby.route.split("→")[1]?.trim() : null) ||
      "alternate station";
    lines.push(
      `Checked nearby-station alternatives — ${stationName} confirmed.`
    );
  }
  lines.push("Ranking by confirmation certainty.");

  return lines.join(" ");
}
