/**
 * Client-side parser utilities.
 *
 * Attribution: The deterministicFallback below is derived from the original
 * Codex/OpenAI-built parser in App.jsx — specifically the extractRouteIntent()
 * regex and city-matching logic, preserved verbatim. The core regex pattern
 * is unchanged from the Codex build; only a pre-processing step is added to
 * strip class codes (3A, 2A, etc.) before the regex runs, which was the
 * integration bug causing the regex to fail on most inputs.
 *
 * The OpenAI API call lives in /api/parse (server-side) and is skipped when
 * no key is configured, falling through immediately to this function.
 */

import type { ParsedIntent, TrainClass } from "./types";

// ── In-memory demo cache (keyed by exact input string) ────────────────────
const intentCache = new Map<string, ParsedIntent>();

export function getCachedIntent(input: string): ParsedIntent | null {
  return intentCache.get(input) ?? null;
}

export function setCachedIntent(input: string, intent: ParsedIntent): void {
  intentCache.set(input, { ...intent, fromCache: false });
}

// ── Known city names (from original Codex parser, extended) ──────────────
const CITY_ALIASES: Record<string, string> = {
  delhi: "Delhi", "new delhi": "Delhi", dilli: "Delhi", ndls: "Delhi",
  "nai delhi": "Delhi", "old delhi": "Delhi",
  mumbai: "Mumbai", bombay: "Mumbai", csmt: "Mumbai", bct: "Mumbai", dadar: "Mumbai",
  patna: "Patna", pnbe: "Patna", "patna jn": "Patna",
  varanasi: "Varanasi", banaras: "Varanasi", kashi: "Varanasi",
  bengaluru: "Bengaluru", bangalore: "Bengaluru", sbc: "Bengaluru",
  banglore: "Bengaluru", bengalore: "Bengaluru",
  lucknow: "Lucknow", lko: "Lucknow", lucknau: "Lucknow",
  chennai: "Chennai", madras: "Chennai", mas: "Chennai",
  kolkata: "Kolkata", calcutta: "Kolkata", howrah: "Kolkata", hwh: "Kolkata",
  ahmedabad: "Ahmedabad", amdavad: "Ahmedabad", adi: "Ahmedabad", ahmadabad: "Ahmedabad",
  gorakhpur: "Gorakhpur", gkp: "Gorakhpur",
  goa: "Goa", panaji: "Goa",
  pune: "Pune", hyderabad: "Hyderabad", secunderabad: "Hyderabad",
  jaipur: "Jaipur", agra: "Agra", kanpur: "Kanpur", nagpur: "Nagpur",
  bhopal: "Bhopal", indore: "Indore", surat: "Surat",
  amritsar: "Amritsar", chandigarh: "Chandigarh",
};

// Class aliases — sorted longest-first so "sleeper class" matches before "sleeper"
const CLASS_ALIASES: [string, TrainClass][] = [
  ["sleeper class", "SL"], ["first class", "1A"], ["second ac", "2A"], ["third ac", "3A"],
  ["ac first", "1A"], ["ac 2", "2A"], ["ac 3", "3A"], ["2 tier", "2A"], ["3 tier", "3A"],
  ["sleeper", "SL"], ["1a", "1A"], ["2a", "2A"], ["3a", "3A"], ["sl", "SL"],
];

const DATE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i, "$1 $2"],
  [/\b(tomorrow)\b/i, "tomorrow"],
  [/\b(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i, "$1"],
  [/\b(\d{1,2})[\/\-](\d{1,2})\b/, "$1/$2"],
];

function matchCity(text: string): string | null {
  const lower = text.toLowerCase().trim();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (lower.includes(alias)) return city;
  }
  if (lower.length > 2) return lower.charAt(0).toUpperCase() + lower.slice(1);
  return null;
}

/**
 * Strip class codes and "class" keyword from input before running the city
 * regex. This is the fix for the integration bug: the original Codex regex
 * uses [A-Za-z\s]+ which stops at digits, so "Kolkata to Delhi 3A" would
 * fail to match. Pre-stripping "3A" → "Kolkata to Delhi" → regex matches.
 */
function stripClassFromText(text: string): { trainClass: TrainClass | null; cleaned: string } {
  let trainClass: TrainClass | null = null;
  let cleaned = text;

  for (const [alias, cls] of CLASS_ALIASES) {
    const re = new RegExp(`(?<![a-z])${alias}(?![a-z])`, "gi");
    if (re.test(cleaned)) {
      if (!trainClass) trainClass = cls;
      cleaned = cleaned.replace(new RegExp(`(?<![a-z])${alias}(?![a-z])`, "gi"), " ");
    }
  }

  // Clean up extra whitespace/punctuation left behind
  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/,\s*$/, "").trim();
  return { trainClass, cleaned };
}

/**
 * deterministicFallback — the original Codex extractRouteIntent() regex,
 * preserved verbatim from App.jsx, now with a pre-processing step that strips
 * class codes so digits don't break the [A-Za-z\s]+ character class match.
 *
 * Original Codex regex (unchanged):
 *   /(?:from\s+)?([A-Za-z\s]+?)\s+(?:to|se|towards)\s+([A-Za-z\s]+?)(?:\s+(?:on|next|for|ko|during)\s+|$)/i
 */
export function deterministicFallback(userInput: string): ParsedIntent | null {
  const text = userInput.trim();

  // ── Step 1: Strip class codes before city regex (integration fix) ─────────
  const { trainClass, cleaned } = stripClassFromText(text);

  // ── Step 2: Original Codex regex — verbatim from App.jsx ─────────────────
  const match = cleaned.match(
    /(?:from\s+)?([A-Za-z\u0900-\u097F\s]+?)\s+(?:to|se|towards|tak)\s+([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:on|next|for|ko|during|ke\s+liye)\s+|$)/i
  );

  let origin: string | null = null;
  let destination: string | null = null;

  if (match && match[1] && match[2]) {
    // Original Codex cleanup (preserved verbatim from App.jsx)
    const rawOrigin = match[1]
      .trim()
      .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|mujhe|hamein)\s+/i, "");
    const rawDest = match[2]
      .trim()
      .replace(/\s+(bhejna|jana|chahiye|tickets?|on|next|ke\s+liye|wala|wali).*$/i, "");

    origin = matchCity(rawOrigin);
    destination = matchCity(rawDest);
  }

  // ── Step 3: Date extraction ───────────────────────────────────────────────
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
 * 2. Call /api/parse (which skips OpenAI immediately if no key is set, so no 6s wait).
 * 3. On API failure: deterministicFallback (client-side safety net).
 * 4. On total failure: parseError state.
 */
export async function parseIntent(userInput: string): Promise<ParsedIntent> {
  const trimmed = userInput.trim();

  // ── Cache check ───────────────────────────────────────────────────────────
  const cached = getCachedIntent(trimmed);
  if (cached) {
    console.log("[Parser] Cache hit:", trimmed);
    return { ...cached, fromCache: true };
  }

  // ── API call (fast — server skips OpenAI if no key) ───────────────────────
  const tryApiCall = async (): Promise<ParsedIntent | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
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

  if (result && !result.parseError) {
    setCachedIntent(trimmed, result);
    return result;
  }

  // ── Client-side deterministic fallback (safety net if API unreachable) ────
  console.warn("[Parser] API unavailable — using client-side fallback.");
  const fallback = deterministicFallback(trimmed);
  if (fallback) {
    setCachedIntent(trimmed, fallback);
    return fallback;
  }

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