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
import { CITIES } from "./cities";

// ── In-memory demo cache (keyed by exact input string) ────────────────────────
const intentCache = new Map<string, ParsedIntent>();

export function getCachedIntent(input: string): ParsedIntent | null {
  return intentCache.get(input) ?? null;
}

export function setCachedIntent(input: string, intent: ParsedIntent): void {
  intentCache.set(input, { ...intent, fromCache: false });
}

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
 * regex.
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

  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/,\s*$/, "").trim();
  return { trainClass, cleaned };
}

/**
 * Extract unrecognized tokens from input sentence after stripping recognized keywords.
 */
function extractUnrecognizedWords(userInput: string, parsed: ParsedIntent): string[] {
  let text = userInput.toLowerCase();
  
  // Remove known matched cities and their aliases
  if (parsed.origin) {
    const origObj = CITIES.find(c => c.name.toLowerCase() === parsed.origin.toLowerCase());
    const terms = origObj ? [origObj.name, ...origObj.aliases] : [parsed.origin];
    for (const t of terms) {
      text = text.replace(new RegExp(`\\b${t.toLowerCase()}\\b`, "gi"), " ");
    }
  }
  if (parsed.destination) {
    const destObj = CITIES.find(c => c.name.toLowerCase() === parsed.destination.toLowerCase());
    const terms = destObj ? [destObj.name, ...destObj.aliases] : [parsed.destination];
    for (const t of terms) {
      text = text.replace(new RegExp(`\\b${t.toLowerCase()}\\b`, "gi"), " ");
    }
  }

  // Remove known class aliases
  for (const [alias] of CLASS_ALIASES) {
    text = text.replace(new RegExp(`\\b${alias.toLowerCase()}\\b`, "gi"), " ");
  }

  // Remove common date patterns
  for (const [pat] of DATE_PATTERNS) {
    text = text.replace(pat, " ");
  }

  // Remove standard conversational filler & relation terms
  const commonFillers = [
    "to", "from", "se", "tak", "ko", "ke", "liye", "par", "mein", "on", "for", "in",
    "i", "want", "travel", "need", "go", "book", "tickets", "ticket", "looking", "search", "find", "train", "trains",
    "bhejna", "hai", "bhejo", "jana", "jaana", "chahiye", "karo", "karwana",
    "maa", "mother", "papa", "pitaji", "father", "bhai", "bhaiya", "sister", "didi", "dost", "friend", "family", "wife", "husband",
    "mujhe", "hume", "hamein", "humko", "kripya", "please", "urgent", "tatkal", "seat", "seats", "berth"
  ];

  for (const filler of commonFillers) {
    text = text.replace(new RegExp(`\\b${filler}\\b`, "gi"), " ");
  }

  const leftovers = text.split(/\s+/).map(w => w.replace(/[^a-z0-9\u0900-\u097F]/gi, "").trim()).filter(w => w.length > 2);
  return [...new Set(leftovers)];
}

/**
 * Diagnostic logger that prints what the parser understood vs what it did not understand.
 */
function logParserDiagnostics(userInput: string, parsed: ParsedIntent, source: string) {
  const isComplete = Boolean(parsed.origin && parsed.destination && parsed.origin.toLowerCase() !== parsed.destination.toLowerCase());
  const unrecognizedTokens = extractUnrecognizedWords(userInput, parsed);

  console.group(`%c🚆 [Parser Diagnostic Report] (${source})`, isComplete ? "color: #10b981; font-size: 13px; font-weight: bold;" : "color: #ef4444; font-size: 13px; font-weight: bold;");
  console.log("%cInput Prompt:", "color: #f59e0b; font-weight: bold;", `"${userInput}"`);

  // ── 1. WHAT WAS UNDERSTOOD ───────────────────────────────────────────────
  console.group("%c✅ What the Parser UNDERSTOOD:", "color: #10b981; font-weight: bold;");
  console.log("  • Origin Station :", parsed.origin ? `"${parsed.origin}"` : "❌ Not found");
  console.log("  • Destination    :", parsed.destination ? `"${parsed.destination}"` : "❌ Not found");
  console.log("  • Travel Date    :", parsed.date ? `"${parsed.date}"` : "— Not in prompt (will be prompted on results)");
  console.log("  • Seat Class     :", parsed.class ? `"${parsed.class}"` : "— Not in prompt (will be prompted on results)");
  console.log("  • Passenger Note :", parsed.passengerNote ? `"${parsed.passengerNote}"` : "— None");
  console.log("  • Confidence     :", parsed.confidence.toUpperCase());
  console.groupEnd();

  // ── 2. WHAT WAS NOT UNDERSTOOD / MISSING ─────────────────────────────────
  console.group("%c❓ What the Parser DID NOT UNDERSTAND / Needs Resolution:", isComplete ? "color: #64748b; font-weight: bold;" : "color: #f43f5e; font-weight: bold;");
  
  const issues: string[] = [];
  if (!parsed.origin && !parsed.destination) {
    issues.push("Neither origin nor destination could be identified from this sentence.");
  } else if (!parsed.origin) {
    issues.push("Origin station is missing or unrecognized (e.g. unknown station/city name or spelling).");
  } else if (!parsed.destination) {
    issues.push("Destination station is missing or unrecognized (e.g. unknown station/city name or spelling).");
  } else if (parsed.origin.toLowerCase() === parsed.destination.toLowerCase()) {
    issues.push(`Origin and Destination both resolved to the same location ("${parsed.origin}"). Two distinct stations are required.`);
  }

  if (unrecognizedTokens.length > 0) {
    issues.push(`Unmatched words/phrases not in train directory: [ ${unrecognizedTokens.map(w => `"${w}"`).join(", ")} ]`);
  }

  if (issues.length === 0) {
    console.log("  • Everything required was understood cleanly! No missing stations.");
  } else {
    for (const issue of issues) {
      console.warn("  •", issue);
    }
  }
  console.groupEnd();

  // ── 3. OUTCOME STATUS ───────────────────────────────────────────────────
  if (isComplete) {
    console.log("%c🎯 Status: READY → Routing from " + parsed.origin + " to " + parsed.destination, "color: #38bdf8; font-weight: bold;");
  } else {
    console.warn("%c🛑 Status: INCOMPLETE → Search will ask user to clarify stations", "color: #ef4444; font-weight: bold;");
  }

  console.groupEnd();
}

/**
 * deterministicFallback — extractRouteIntent() regex and city-matching logic.
 */
export function deterministicFallback(userInput: string): ParsedIntent | null {
  const text = userInput.trim();

  // ── Step 0: Strip conversational filler ──────
  let preCleaned = text.replace(/^(?:i want to go|i want to travel|i need to go|please book|book tickets?|looking for|search for|find trains?|मुझे|हमे|हमको|कृपया|टिकट|ट्रेन)\s+(?:from\s+|से\s+)?/i, "");

  // ── Step 1: Strip class codes before city regex ─────────
  const { trainClass, cleaned } = stripClassFromText(preCleaned);

  // ── Step 2: Check for inverted Hindi syntax: "[Dest] bhejna hai [Origin] se" ──
  const invertedMatch = cleaned.match(
    /([A-Za-z\u0900-\u097F\s]+?)\s+(?:bhejna|jana|jaana|chahiye|भेजना|जाना|चाहिए).*?\s+([A-Za-z\u0900-\u097F\s]+?)\s+(?:se|से)\b/i
  );

  let origin: string | null = null;
  let destination: string | null = null;

  if (invertedMatch && invertedMatch[1] && invertedMatch[2]) {
    const rawDest = invertedMatch[1]
      .trim()
      .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|papa\s+ko|papaji\s+ko|pitaji\s+ko|bhai\s+ko|bhaiya\s+ko|sister\s+ko|didi\s+ko|dost\s+ko|family\s+ko|wife\s+ko|husband\s+ko|mujhe|hamein|मां\s+को|माँ\s+को|पापा\s+को|पिताजी\s+को|भाई\s+को|भैया\s+को|दीदी\s+को|दोस्त\s+को|परिवार\s+को|मुझे|हमे)\s+/i, "")
      .replace(/\s+(ke\s+liye|के\s+लिए).*$/i, "");
    const rawOrigin = invertedMatch[2]
      .trim()
      .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|papa\s+ko|papaji\s+ko|pitaji\s+ko|bhai\s+ko|bhaiya\s+ko|sister\s+ko|didi\s+ko|dost\s+ko|family\s+ko|wife\s+ko|husband\s+ko|mujhe|hamein|मां\s+को|माँ\s+को|पापा\s+को|पिताजी\s+को|भाई\s+को|भैया\s+को|दीदी\s+को|दोस्त\s+को|परिवार\s+को|मुझे|हमे)\s+/i, "");

    const o = matchCity(rawOrigin);
    const d = matchCity(rawDest);
    if (o && d && o.toLowerCase() !== d.toLowerCase()) {
      origin = o;
      destination = d;
    }
  }

  // ── Step 2b: Standard "Origin to/se Destination" regex ─────────────────────
  if (!origin || !destination) {
    const match = cleaned.match(
      /(?:from\s+|से\s+)?([A-Za-z\u0900-\u097F\s]+?)\s+(?:to|se|towards|tak|से|तक)\s+([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:on|next|for|ko|during|ke\s+liye|को|के\s+लिए|पर)\s+|$)/i
    );

    if (match && match[1] && match[2]) {
      const rawOrigin = match[1]
        .trim()
        .replace(/^(get|need|book|send|tickets?|from|maa\s+ko|papa\s+ko|papaji\s+ko|pitaji\s+ko|bhai\s+ko|bhaiya\s+ko|sister\s+ko|didi\s+ko|dost\s+ko|family\s+ko|wife\s+ko|husband\s+ko|mujhe|hamein|मां\s+को|माँ\s+को|पापा\s+को|पिताजी\s+को|भाई\s+को|भैया\s+को|दीदी\s+को|दोस्त\s+को|परिवार\s+को|मुझे|हमे)\s+/i, "");
      const rawDest = match[2]
        .trim()
        .replace(/\s+(bhejna|bhejna\s+hai|bhejo|jana|jana\s+hai|chahiye|tickets?|on|next|ke\s+liye|wala|wali|भेजना|भेजना\s+है|भेजो|जाना|जाना\s+है|चाहिए|के\s+लिए).*$/i, "");

      origin = matchCity(rawOrigin);
      destination = matchCity(rawDest);
    }
  }

  // ── Step 2.5: Dictionary Scan (Using Unified CITIES list) ──
  const isCleanLocation = (loc: string | null) => {
    if (!loc) return false;
    const l = loc.toLowerCase().trim();
    return CITIES.some(c => c.name.toLowerCase() === l || c.aliases.some(a => a.toLowerCase() === l));
  };

  if (!isCleanLocation(origin) || !isCleanLocation(destination) || (origin && destination && origin.toLowerCase() === destination.toLowerCase())) {
    const allNames = CITIES.flatMap(c => [c.name, ...c.aliases]).map(n => n.toLowerCase());
    const locationRegex = new RegExp(`\\b(${allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    const matches = Array.from(cleaned.matchAll(locationRegex)).map(m => m[1].toLowerCase());
    const matchedCanonical = matches.map(m => matchCity(m) || m).filter(Boolean) as string[];
    const uniqueLocations = [...new Set(matchedCanonical)];
    
    if (uniqueLocations.length >= 2) {
      origin = uniqueLocations[0];
      destination = uniqueLocations[1];
    } else if (uniqueLocations.length === 1) {
      if (isCleanLocation(origin) && origin!.toLowerCase() !== uniqueLocations[0].toLowerCase()) {
        destination = uniqueLocations[0];
      } else if (isCleanLocation(destination) && destination!.toLowerCase() !== uniqueLocations[0].toLowerCase()) {
        origin = uniqueLocations[0];
      }
    }
  }

  if (origin && !isCleanLocation(origin)) origin = origin.charAt(0).toUpperCase() + origin.slice(1);
  if (destination && !isCleanLocation(destination)) destination = destination.charAt(0).toUpperCase() + destination.slice(1);

  // ── Step 3: Reject missing or identical stations ──
  if (!origin || !destination) return null;
  if (origin.toLowerCase() === destination.toLowerCase()) return null;

  // ── Step 4: Date extraction ──
  let date: string | null = null;
  for (const [pattern, template] of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      date = template.replace("$1", m[1] ?? "").replace("$2", m[2] ?? "");
      break;
    }
  }

  return {
    origin,
    destination,
    date,
    passengerNote: /मां|माँ|mother|maa|papa|पिताजी|पापा|father/i.test(text)
      ? /papa|पापा|पिताजी|father/i.test(text) ? "For father" : "For mother"
      : null,
    class: trainClass,
    confidence: "high",
  };
}

/**
 * parseIntent — primary entry point with enhanced diagnostics.
 */
export async function parseIntent(userInput: string): Promise<ParsedIntent> {
  const trimmed = userInput.trim();

  // ── Cache check ─────────────────────────────────────────────────────────────
  const cached = getCachedIntent(trimmed);
  if (cached && !cached.parseError && cached.origin && cached.destination && cached.origin.toLowerCase() !== cached.destination.toLowerCase()) {
    logParserDiagnostics(trimmed, cached, "In-Memory Cache");
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
      const data = (await res.json()) as ParsedIntent;
      return data;
    } catch {
      return null;
    }
  };

  const result = await tryApiCall();

  if (
    result &&
    !result.parseError &&
    result.origin &&
    result.destination &&
    result.origin.toLowerCase() !== result.destination.toLowerCase()
  ) {
    logParserDiagnostics(trimmed, result, "AI / OpenAI Engine");
    setCachedIntent(trimmed, result);
    return result;
  }

  // ── Client-side deterministic fallback (safety net) ─────────────────────────
  const fallback = deterministicFallback(trimmed);
  if (
    fallback &&
    fallback.origin &&
    fallback.destination &&
    fallback.origin.toLowerCase() !== fallback.destination.toLowerCase()
  ) {
    logParserDiagnostics(trimmed, fallback, "Deterministic Pattern Parser");
    setCachedIntent(trimmed, fallback);
    return fallback;
  }

  // ── Failure breakdown ───────────────────────────────────────────────────────
  const failedIntent: ParsedIntent = {
    origin: "",
    destination: "",
    date: null,
    passengerNote: null,
    class: null,
    confidence: "low",
    parseError: true,
  };

  logParserDiagnostics(trimmed, failedIntent, "Unresolved / Error");
  return failedIntent;
}
