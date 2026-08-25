/**
 * Client-side parser utilities.
 *
 * Attribution: The deterministic fallback below (deterministicFallback) is
 * derived from the original Codex/OpenAI-built parser in App.jsx —
 * specifically the extractRouteIntent() regex and city-matching logic.
 * It is preserved verbatim here as the fallback path, with bug fixes and
 * schema extensions. The OpenAI API call lives in /api/parse (server-side).
 * The underlying approach — OpenAI model call for NL intent extraction — is
 * the primary path and remains intact per hackathon compliance requirements.
 */

import type { ParsedIntent, TrainClass } from "./types";

// ── In-memory demo cache (keyed by exact input string) ────────────────────
const intentCache = new Map<string, ParsedIntent>();

export function getCachedIntent(input: string): ParsedIntent | null {
  return intentCache.get(input) ?? null;
}

export function setCachedIntent(input: string, intent: ParsedIntent): void {
  intentCache.set(input, { ...intent, fromCache: false }); // store clean
}

// ── Known city names for deterministic fallback ──────────────────────────
// (Preserved from the original Codex-built extractRouteIntent, extended)
const CITY_ALIASES: Record<string, string> = {
  // Hindi transliterations + English variants
  delhi: "Delhi", "new delhi": "Delhi", dilli: "Delhi", ndls: "Delhi",
  "nai delhi": "Delhi", "old delhi": "Delhi",
  mumbai: "Mumbai", bombay: "Mumbai", csmt: "Mumbai", bct: "Mumbai",
  dadar: "Mumbai",
  patna: "Patna", pnbe: "Patna", "patna jn": "Patna",
  varanasi: "Varanasi", banaras: "Varanasi", kashi: "Varanasi",
  bengaluru: "Bengaluru", bangalore: "Bengaluru", sbc: "Bengaluru",
  banglore: "Bengaluru", bengalore: "Bengaluru",
  lucknow: "Lucknow", lko: "Lucknow", lucknau: "Lucknow",
  chennai: "Chennai", madras: "Chennai", mas: "Chennai",
  kolkata: "Kolkata", calcutta: "Kolkata", howrah: "Kolkata",
  hwh: "Kolkata",
  ahmedabad: "Ahmedabad", amdavad: "Ahmedabad", adi: "Ahmedabad",
  gorakhpur: "Gorakhpur", gkp: "Gorakhpur",
  goa: "Goa", panaji: "Goa",
  pune: "Pune",
  hyderabad: "Hyderabad", secunderabad: "Hyderabad",
  jaipur: "Jaipur",
  agra: "Agra",
  kanpur: "Kanpur",
  nagpur: "Nagpur",
  bhopal: "Bhopal",
  indore: "Indore",
  surat: "Surat",
  amritsar: "Amritsar",
  chandigarh: "Chandigarh",
};

const CLASS_ALIASES: Record<string, TrainClass> = {
  "1a": "1A", "ac first": "1A", "first ac": "1A", "first class": "1A",
  "2a": "2A", "ac 2": "2A", "second ac": "2A", "2 tier": "2A",
  "3a": "3A", "ac 3": "3A", "third ac": "3A", "3 tier": "3A",
  sl: "SL", sleeper: "SL", "sleeper class": "SL",
};

const DATE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i, "$1 $2"],
  [/\b(tomorrow)\b/i, "tomorrow"],
  [/\b(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i, "$1"],
  [/\b(\d{1,2})[\/\-](\d{1,2})\b/, "$1/$2"],
];

function matchCity(text: string): string | null {
  const lower = text.toLowerCase().trim();
  // Exact match
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  // Partial match
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (lower.includes(alias)) return city;
  }
  // Fallback: capitalize first letter
  if (lower.length > 2) return lower.charAt(0).toUpperCase() + lower.slice(1);
  return null;
}

/**
 * deterministicFallback — derived from the original Codex-built
 * extractRouteIntent() regex in App.jsx. Bug-fixed and extended with
 * class extraction and date parsing. No API calls.
 */
export function deterministicFallback(userInput: string): ParsedIntent | null {
  const text = userInput.trim();

  // ── Original Codex regex (preserved verbatim, bug-fixed) ─────────────────
  // Bug in original: fallback returned hardcoded Delhi→Patna on any miss.
  // Fix: return null so the caller can handle the failure properly.
  const match = text.match(
    /(?:from\s+)?([A-Za-z\u0900-\u097F\s]+?)\s+(?:to|se|se\s+|towards|tak)\s+([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:on|next|for|ko|during|ke\s+liye)\s+|$)/i
  );

  let origin: string | null = null;
  let destination: string | null = null;

  if (match && match[1] && match[2]) {
    const rawOrigin = match[1]
      .trim()
      .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|mujhe|hamein)\s+/i, "");
    const rawDest = match[2]
      .trim()
      .replace(/\s+(bhejna|jana|chahiye|tickets?|on|next|ke\s+liye|wala|wali).*$/i, "");

    origin = matchCity(rawOrigin);
    destination = matchCity(rawDest);
  }

  // ── Class extraction ──────────────────────────────────────────────────────
  let trainClass: TrainClass | null = null;
  const textLower = text.toLowerCase();
  for (const [alias, cls] of Object.entries(CLASS_ALIASES)) {
    if (textLower.includes(alias)) { trainClass = cls; break; }
  }

  // ── Date extraction ───────────────────────────────────────────────────────
  let date: string | null = null;
  for (const [pattern, template] of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      date = template.replace("$1", m[1] ?? "").replace("$2", m[2] ?? "");
      break;
    }
  }

  if (!origin || !destination) return null;

  return {
    origin,
    destination,
    date,
    passengerNote: null,
    class: trainClass,
    confidence: "low",
  };
}

/**
 * parseIntent — primary entry point.
 * 1. Check in-memory demo cache.
 * 2. Call /api/parse (OpenAI structured output, 3s timeout, 1 retry).
 * 3. On API failure: deterministicFallback.
 * 4. On both failures: return parseError.
 */
export async function parseIntent(userInput: string): Promise<ParsedIntent> {
  const trimmed = userInput.trim();

  // ── Cache check ───────────────────────────────────────────────────────────
  const cached = getCachedIntent(trimmed);
  if (cached) {
    console.log("[Parser] Cache hit for:", trimmed);
    return { ...cached, fromCache: true };
  }

  // ── API call with timeout + 1 retry ──────────────────────────────────────
  const tryApiCall = async (): Promise<ParsedIntent | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const data = await res.json() as ParsedIntent;
      return data;
    } catch {
      return null;
    }
  };

  let result = await tryApiCall();
  if (!result) {
    console.warn("[Parser] First API attempt failed, retrying...");
    result = await tryApiCall();
  }

  if (result && !result.parseError) {
    setCachedIntent(trimmed, result);
    return result;
  }

  // ── Deterministic fallback ────────────────────────────────────────────────
  console.warn("[Parser] API failed twice — falling back to deterministic parser.");
  const fallback = deterministicFallback(trimmed);
  if (fallback) {
    setCachedIntent(trimmed, fallback);
    return fallback;
  }

  // ── Total failure ─────────────────────────────────────────────────────────
  return {
    origin: "",
    destination: "",
    date: null,
    passengerNote: null,
    class: null,
    confidence: "low",
    parseError: true,
  };
}
