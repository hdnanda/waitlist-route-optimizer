/**
 * Client-side parser utilities.
 *
 * Attribution: The deterministicFallback below is derived from the original
 * Codex/OpenAI-built parser in App.jsx â€” specifically the extractRouteIntent()
 * regex and city-matching logic, preserved verbatim. The core regex pattern
 * is unchanged from the Codex build; only a pre-processing step is added to
 * strip class codes (3A, 2A, etc.) before the regex runs, which was the
 * integration bug causing the regex to fail on most inputs.
 *
 * The OpenAI API call lives in /api/parse (server-side) and is skipped when
 * no key is configured, falling through immediately to this function.
 */

import type { ParsedIntent, TrainClass } from "./types";

// â”€â”€ In-memory demo cache (keyed by exact input string) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const intentCache = new Map<string, ParsedIntent>();

export function getCachedIntent(input: string): ParsedIntent | null {
  return intentCache.get(input) ?? null;
}

export function setCachedIntent(input: string, intent: ParsedIntent): void {
  intentCache.set(input, { ...intent, fromCache: false });
}

// â”€â”€ Known city names (from original Codex parser, extended) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { CITIES } from "./cities";

// Class aliases — sorted longest-first so "sleeper class" matches before "sleeper"
const CLASS_ALIASES: [string, TrainClass][] = [
  ["sleeper class", "SL"], ["स्लीपर क्लास", "SL"], ["first class", "1A"], ["second ac", "2A"], ["third ac", "3A"],
  ["ac first", "1A"], ["ac 2", "2A"], ["ac 3", "3A"], ["2 tier", "2A"], ["3 tier", "3A"], ["2 tire", "2A"], ["3 tire", "3A"],
  ["फर्स्ट एसी", "1A"], ["सेकंड एसी", "2A"], ["थर्ड एसी", "3A"], ["स्लीपर", "SL"], ["slipar", "SL"], ["sleepar", "SL"],
  ["sleeper", "SL"], ["1a", "1A"], ["2a", "2A"], ["3a", "3A"], ["sl", "SL"],
];

const DATE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i, "$1 $2"],
  [/\b(\d{1,2})\s+(जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\b/i, "$1 $2"],
  [/\b(tomorrow|कल)\b/i, "tomorrow"],
  [/\b(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i, "$1"],
  [/\b(\d{1,2})[\/\-](\d{1,2})\b/, "$1/$2"],
];

function matchCity(text: string): string | null {
  const lower = text.toLowerCase().trim();
  const city = CITIES.find(
    c => c.name.toLowerCase() === lower || c.aliases.some(a => a.toLowerCase() === lower)
  );
  if (city) return city.name;
  
  for (const c of CITIES) {
    if (lower.includes(c.name.toLowerCase())) return c.name;
    for (const a of c.aliases) {
      if (lower.includes(a.toLowerCase())) return c.name;
    }
  }
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
    const re = new RegExp(`(?<![a-z\u0900-\u097F])${alias}(?![a-z\u0900-\u097F])`, "gi");
    if (re.test(cleaned)) {
      if (!trainClass) trainClass = cls;
      cleaned = cleaned.replace(new RegExp(`(?<![a-z\u0900-\u097F])${alias}(?![a-z\u0900-\u097F])`, "gi"), " ");
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
 */
export function deterministicFallback(userInput: string): ParsedIntent | null {
  const text = userInput.trim();

  // ── Step 0: Strip conversational filler that breaks the greedy regex ──────
  let preCleaned = text.replace(/^(?:i want to go|i want to travel|i need to go|please book|book tickets?|looking for|search for|find trains?|मुझे|हमे|हमको|कृपया|टिकट|ट्रेन)\s+(?:from\s+|से\s+)?/i, "");

  // ── Step 1: Strip class codes before city regex (integration fix) ─────────
  const { trainClass, cleaned } = stripClassFromText(preCleaned);

  // ── Step 2: Original Codex regex with Hindi preposition support ─────────
  const match = cleaned.match(
    /(?:from\s+|से\s+)?([A-Za-z\u0900-\u097F\s]+?)\s+(?:to|se|towards|tak|से|तक)\s+([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:on|next|for|ko|during|ke\s+liye|को|के\s+लिए|पर)\s+|$)/i
  );

  let origin: string | null = null;
  let destination: string | null = null;

  if (match && match[1] && match[2]) {
    const rawOrigin = match[1]
      .trim()
      .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|mujhe|hamein|मां\s+को|माँ\s+को|मुझे)\s+/i, "");
    const rawDest = match[2]
      .trim()
      .replace(/\s+(bhejna|jana|chahiye|tickets?|on|next|ke\s+liye|wala|wali|भेजना|जाना|चाहिए|के\s+लिए).*$/i, "");

    origin = matchCity(rawOrigin);
    destination = matchCity(rawDest);
  }

  // ── Step 2.5: Dictionary Scan (Using Unified CITIES list) ──
  const isCleanLocation = (loc: string | null) => {
    if (!loc) return false;
    const l = loc.toLowerCase().trim();
    return CITIES.some(c => c.name.toLowerCase() === l || c.aliases.some(a => a.toLowerCase() === l));
  };

  if (!isCleanLocation(origin) || !isCleanLocation(destination)) {
    const allNames = CITIES.flatMap(c => [c.name, ...c.aliases]).map(n => n.toLowerCase());
    // Match whole words or Hindi words
    const locationRegex = new RegExp(`\\b(${allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    const matches = Array.from(cleaned.matchAll(locationRegex)).map(m => m[1].toLowerCase());
    const uniqueLocations = [...new Set(matches)];
    
    if (uniqueLocations.length >= 2) {
      origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      destination = matchCity(uniqueLocations[1]) || uniqueLocations[1];
    } else if (uniqueLocations.length === 1) {
      if (!isCleanLocation(origin)) origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      else if (!isCleanLocation(destination)) destination = matchCity(uniqueLocations[0]) || uniqueLocations[0];
    }
  }

  if (origin && !isCleanLocation(origin)) origin = origin.charAt(0).toUpperCase() + origin.slice(1);
  if (destination && !isCleanLocation(destination)) destination = destination.charAt(0).toUpperCase() + destination.slice(1);

  // ── Step 3: Date extraction ──
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
    passengerNote: /मां|माँ|mother|maa/i.test(text) ? "For mother" : null,
    class: trainClass,
    confidence: "high",
  };
}

/**
 * parseIntent — primary entry point.
 */
export async function parseIntent(userInput: string): Promise<ParsedIntent> {
  const trimmed = userInput.trim();

  console.group(`%c🚆 [Parser] Processing query: "${trimmed}"`, "color: #E8A33D; font-size: 13px; font-weight: bold;");
  console.log("Input text received by Parser:", trimmed);

  // ── Cache check ─────────────────────────────────────────────────────────────
  const cached = getCachedIntent(trimmed);
  if (cached) {
    console.log("%c⚡ [Parser] Cache Hit:", "color: #38bdf8; font-weight: bold;", cached);
    console.groupEnd();
    return { ...cached, fromCache: true };
  }

  // ── API call (server skips OpenAI if no key) ────────────────────────────────
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

  if (result && !result.parseError && result.origin && result.destination) {
    console.log("%c🤖 [Parser] API/OpenAI Model Result:", "color: #10b981; font-weight: bold;", result);
    console.groupEnd();
    setCachedIntent(trimmed, result);
    return result;
  }

  // ── Client-side deterministic fallback (safety net) ─────────────────────────
  console.log("%c⚙️ [Parser] Running deterministic fallback parser...", "color: #f59e0b;");
  const fallback = deterministicFallback(trimmed);
  if (fallback) {
    console.log("%c✅ [Parser] Fallback Extracted Intent:", "color: #10b981; font-weight: bold;", fallback);
    console.groupEnd();
    setCachedIntent(trimmed, fallback);
    return fallback;
  }

  console.warn("%c⚠️ [Parser] Could not extract valid origin and destination from:", "color: #ef4444; font-weight: bold;", trimmed);
  console.groupEnd();

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

