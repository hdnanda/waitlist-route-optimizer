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

// ── Sentiment & Comfort Intent Rules for Seat Class ─────────────────────────
export const SENTIMENT_CLASS_RULES: Array<{
  patterns: RegExp[];
  trainClass: TrainClass;
  reason: string;
}> = [
  // Sleep / Berth Need -> SL (or Sleeper)
  {
    patterns: [
      /\b(i want to sleep|want to sleep|need to sleep|to sleep|sleeping|sleep)\b/i,
      /\b(so ke jana|so ke jaana|sona hai|sone ke liye|neend leni|so kar)\b/i,
      /\b(सो के जाना|सोना है|सोने के लिए|नींद)\b/i,
      /\b(berth|sleeping berth|lie down|flat bed)\b/i,
    ],
    trainClass: "SL",
    reason: "Sleep / lying-down berth requested",
  },
  // Luxury / First Class / VIP -> 1A
  {
    patterns: [
      /\b(luxury|luxurious|vip|first class|private coupe|coupe|peaceful|shanti chahiye|best comfort|amir wali seat)\b/i,
      /\b(अमीर वाली सीट|लक्जरी|वीआईपी|फर्स्ट क्लास)\b/i,
    ],
    trainClass: "1A",
    reason: "Luxury / VIP comfort requested",
  },
  // Air Conditioning / Heat / Summer Weather -> 3A
  {
    patterns: [
      /\b(ac chahiye|need ac|air conditioned|air conditioning|too hot|garmi hai|garmi|thandi hawa|cool coach)\b/i,
      /\b(एसी चाहिए|गर्मी है|ठंडी हवा)\b/i,
    ],
    trainClass: "3A",
    reason: "Air conditioning / weather comfort requested",
  },
  // Executive / Upper AC Tier -> 2A
  {
    patterns: [
      /\b(executive|2 tier|2 tire|upper class|quiet coach)\b/i,
    ],
    trainClass: "2A",
    reason: "Executive AC coach requested",
  },
  // Budget / Cheap / Affordable -> SL
  {
    patterns: [
      /\b(budget|cheap|sasta|saste me|affordable|low cost|kam kharche me)\b/i,
      /\b(सस्ता|सस्ते में|बजट)\b/i,
    ],
    trainClass: "SL",
    reason: "Budget / affordable travel requested",
  },
];

export function extractSentimentClass(text: string): { trainClass: TrainClass | null; reason: string | null } {
  for (const rule of SENTIMENT_CLASS_RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(text)) {
        return { trainClass: rule.trainClass, reason: rule.reason };
      }
    }
  }
  return { trainClass: null, reason: null };
}

// ── Festival Calendar & Relative Date Resolution ────────────────────────────
interface FestivalDate {
  month: number; // 0-indexed (0 = Jan, 10 = Nov)
  day: number;
}

export const FESTIVAL_CALENDAR: Record<string, FestivalDate> = {
  // Diwali / Deepavali
  "diwali": { month: 10, day: 1 },       // 1 Nov
  "deepavali": { month: 10, day: 1 },
  "दीपावली": { month: 10, day: 1 },
  "दिवाली": { month: 10, day: 1 },
  
  // Chhath Puja
  "chhath": { month: 10, day: 6 },       // 6 Nov
  "chhath puja": { month: 10, day: 6 },
  "छठ": { month: 10, day: 6 },
  "छठ पूजा": { month: 10, day: 6 },

  // Holi
  "holi": { month: 2, day: 14 },        // 14 Mar
  "होली": { month: 2, day: 14 },

  // Dussehra / Durga Puja
  "dussehra": { month: 9, day: 20 },    // 20 Oct
  "durga puja": { month: 9, day: 20 },
  "दशहरा": { month: 9, day: 20 },
  "दुर्गा पूजा": { month: 9, day: 20 },

  // Eid
  "eid": { month: 2, day: 21 },         // 21 Mar
  "ईद": { month: 2, day: 21 },

  // New Year / Christmas
  "new year": { month: 0, day: 1 },     // 1 Jan
  "नया साल": { month: 0, day: 1 },
  "christmas": { month: 11, day: 25 },  // 25 Dec
  "क्रिसमस": { month: 11, day: 25 },

  // National
  "independence day": { month: 7, day: 15 }, // 15 Aug
  "15 august": { month: 7, day: 15 },
  "15 अगस्त": { month: 7, day: 15 },
  "republic day": { month: 0, day: 26 },     // 26 Jan
  "26 january": { month: 0, day: 26 },
  "26 जनवरी": { month: 0, day: 26 },
};

export function extractSemanticDate(text: string): { date: string | null; matchedPhrase: string | null } {
  const lower = text.toLowerCase();
  const now = new Date();

  // 1. Festival relative: e.g. "day after diwali", "diwali ke agle din", "diwali ke baad", "after diwali"
  for (const [festKey, fest] of Object.entries(FESTIVAL_CALENDAR)) {
    // Offset +1: "day after <fest>", "after <fest>", "<fest> ke agle din", "<fest> ke baad", "<fest> ke next day"
    const nextDayPatterns = [
      new RegExp(`\\b(day after|after|the day after)\\s+${festKey}\\b`, "i"),
      new RegExp(`\\b${festKey}\\s+(ke\\s+agle\\s+din|ke\\s+baad|ke\\s+bad|ke\\s+next\\s+day|ke\\s+turant\\s+baad|के\\s+अगले\\s+दिन|के\\s+बाद)\\b`, "i"),
    ];
    for (const pat of nextDayPatterns) {
      if (pat.test(lower)) {
        const d = new Date(now.getFullYear(), fest.month, fest.day + 1);
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "short" });
        return { date: `${day} ${month}`, matchedPhrase: text.match(pat)?.[0] ?? festKey };
      }
    }

    // Offset -1: "day before <fest>", "before <fest>", "<fest> se pehle", "<fest> ke ek din pehle"
    const prevDayPatterns = [
      new RegExp(`\\b(day before|before)\\s+${festKey}\\b`, "i"),
      new RegExp(`\\b${festKey}\\s+(se\\s+pehle|ke\\s+pehle|ke\\s+ek\\s+din\\s+pehle|से\\s+पहले)\\b`, "i"),
    ];
    for (const pat of prevDayPatterns) {
      if (pat.test(lower)) {
        const d = new Date(now.getFullYear(), fest.month, fest.day - 1);
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "short" });
        return { date: `${day} ${month}`, matchedPhrase: text.match(pat)?.[0] ?? festKey };
      }
    }

    // Exact Festival Day: "on diwali", "for diwali", "diwali ke din", "diwali ke liye", "diwali par"
    const exactPatterns = [
      new RegExp(`\\b(on|for)\\s+${festKey}\\b`, "i"),
      new RegExp(`\\b${festKey}\\s+(ke\\s+din|ke\\s+liye|par|ko|में|के\\s+लिए|पर)\\b`, "i"),
      new RegExp(`\\b${festKey}\\b`, "i"),
    ];
    for (const pat of exactPatterns) {
      if (pat.test(lower)) {
        const d = new Date(now.getFullYear(), fest.month, fest.day);
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "short" });
        return { date: `${day} ${month}`, matchedPhrase: text.match(pat)?.[0] ?? festKey };
      }
    }
  }

  // 2. Relative Days: "parso", "day after tomorrow", "kal", "tomorrow", "today", "aaj"
  if (/\b(day after tomorrow|parso|parson|परसों)\b/i.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "day after tomorrow" };
  }
  if (/\b(tomorrow|kal|कल)\b/i.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "tomorrow" };
  }
  if (/\b(today|aaj|आज)\b/i.test(lower)) {
    const d = new Date();
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "today" };
  }
  if (/\b(in\s+2\s+days|2\s+din\s+baad)\b/i.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "in 2 days" };
  }
  if (/\b(in\s+3\s+days|3\s+din\s+baad)\b/i.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "in 3 days" };
  }

  // 3. Weekend: "this weekend", "weekend", "coming weekend", "next weekend"
  if (/\b(this\s+weekend|coming\s+weekend|weekend|is\s+weekend)\b/i.test(lower)) {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSat);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "this weekend" };
  }
  if (/\b(next\s+weekend)\b/i.test(lower)) {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSat + 7);
    return { date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`, matchedPhrase: "next weekend" };
  }

  return { date: null, matchedPhrase: null };
}

const DATE_PATTERNS: Array<[RegExp, string]> = [
  // 1. Day with optional ordinal suffix (st, nd, rd, th) + optional "of" + Month: "29th of November", "29 Nov", "the 29th of November"
  [/(?:the\s+)?\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i, "$1 $2"],
  // 2. Month + Day with optional ordinal suffix: "November 29th", "Nov 29", "November the 29th"
  [/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/i, "$2 $1"],
  // 3. Hindi Month: "29 नवंबर", "29th नवंबर"
  [/\b(\d{1,2})(?:st|nd|rd|th)?\s+(जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\b/i, "$1 $2"],
  // 4. Relative dates
  [/\b(day\s+after\s+tomorrow|parso|parson|परसों)\b/i, "parso"],
  [/\b(tomorrow|kal|कल)\b/i, "tomorrow"],
  [/\b(today|aaj|आज)\b/i, "today"],
  [/\b(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i, "$1"],
  // 5. Numeric formats: "29/11", "29-11", "29/11/2026"
  [/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?\b/, "$1/$2"],
];

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function normalizePhonetic(str: string): string {
  return str
    .toLowerCase()
    .replace(/ph/g, "f")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/aa/g, "a")
    .replace(/k/g, "c")
    .replace(/w/g, "v")
    .replace(/sh/g, "s")
    .replace(/z/g, "j");
}

function matchCity(text: string): string | null {
  if (!text || text.trim().length < 2) return null;
  const lower = text.toLowerCase().trim();
  const phonetic = normalizePhonetic(lower);

  // 1. Exact match
  const cityExact = CITIES.find(
    c => c.name.toLowerCase() === lower || c.aliases.some(a => a.toLowerCase() === lower)
  );
  if (cityExact) return cityExact.name;
  
  // 2. Substring exact match (e.g. "vasco da gama", "new delhi station")
  for (const c of CITIES) {
    if (lower.includes(c.name.toLowerCase())) return c.name;
    for (const a of c.aliases) {
      if (lower.includes(a.toLowerCase())) return c.name;
    }
  }

  // 3. Phonetic normalized exact / substring match
  for (const c of CITIES) {
    const cPhon = normalizePhonetic(c.name);
    if (phonetic === cPhon || phonetic.includes(cPhon)) return c.name;
    for (const a of c.aliases) {
      const aPhon = normalizePhonetic(a);
      if (phonetic === aPhon || phonetic.includes(aPhon)) return c.name;
    }
  }

  // 4. Fuzzy Levenshtein Distance match (for STT speech typos like "vasko", "bambay", "soorat", "dehli")
  let bestMatch: string | null = null;
  let highestScore = 0;

  for (const c of CITIES) {
    const allTerms = [c.name, ...c.aliases];
    for (const term of allTerms) {
      const termLower = term.toLowerCase();
      // Skip terms if character length difference is greater than 2
      if (Math.abs(lower.length - termLower.length) > 2) continue;

      const distRaw = levenshteinDistance(lower, termLower);
      const scoreRaw = 1 - distRaw / Math.max(lower.length, termLower.length);

      const distPhon = levenshteinDistance(phonetic, normalizePhonetic(termLower));
      const scorePhon = 1 - distPhon / Math.max(phonetic.length, normalizePhonetic(termLower).length);

      const score = Math.max(scoreRaw, scorePhon);
      const minDistance = Math.min(distRaw, distPhon);

      if (score > highestScore && score >= 0.72 && minDistance <= 2) {
        highestScore = score;
        bestMatch = c.name;
      }
    }
  }

  return bestMatch;
}

/**
 * Strip class codes, sentiment phrases, and date phrases from input before running the city regex.
 */
function stripClassFromText(text: string): { trainClass: TrainClass | null; cleaned: string } {
  let trainClass: TrainClass | null = null;
  let cleaned = text;

  // 1. Explicit class codes
  for (const [alias, cls] of CLASS_ALIASES) {
    const re = new RegExp(`(?<![a-z\u0900-\u097F])${alias}(?![a-z\u0900-\u097F])`, "gi");
    if (re.test(cleaned)) {
      if (!trainClass) trainClass = cls;
      cleaned = cleaned.replace(new RegExp(`(?<![a-z\u0900-\u097F])${alias}(?![a-z\u0900-\u097F])`, "gi"), " ");
    }
  }

  // 2. Sentiment / comfort intent rules (sleep, AC, luxury, budget)
  if (!trainClass) {
    const sentiment = extractSentimentClass(text);
    if (sentiment.trainClass) {
      trainClass = sentiment.trainClass;
      for (const rule of SENTIMENT_CLASS_RULES) {
        for (const pat of rule.patterns) {
          cleaned = cleaned.replace(pat, " ");
        }
      }
    }
  }

  // 3. Strip festival / relative date phrases from cleaned string for clean city matching
  for (const festKey of Object.keys(FESTIVAL_CALENDAR)) {
    cleaned = cleaned.replace(new RegExp(`\\b(day after|after|the day after|before|day before|on|for)?\\s*${festKey}\\s*(ke\\s+agle\\s+din|ke\\s+baad|ke\\s+bad|ke\\s+next\\s+day|ke\\s+turant\\s+baad|se\\s+pehle|ke\\s+pehle|ke\\s+din|ke\\s+liye|par|ko)?\\b`, "gi"), " ");
  }
  cleaned = cleaned.replace(/\b(day after tomorrow|parso|parson|tomorrow|kal|today|aaj|this weekend|next weekend|weekend)\b/gi, " ");

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

  // Remove sentiment phrases
  for (const rule of SENTIMENT_CLASS_RULES) {
    for (const pat of rule.patterns) {
      text = text.replace(pat, " ");
    }
  }

  // Remove common date patterns
  for (const [pat] of DATE_PATTERNS) {
    text = text.replace(pat, " ");
  }

  // Remove festival names and relative terms
  for (const festKey of Object.keys(FESTIVAL_CALENDAR)) {
    text = text.replace(new RegExp(`\\b${festKey}\\b`, "gi"), " ");
  }
  text = text.replace(/\b(diwali|deepavali|chhath|puja|holi|eid|dussehra|durga|christmas|weekend|parso|parson|tomorrow|today|kal|aaj|day|after|before)\b/gi, " ");

  // Remove standard conversational filler & relation terms
  const commonFillers = [
    "to", "from", "se", "tak", "ko", "ke", "liye", "par", "mein", "on", "for", "in", "the",
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

  // ── Step 1: Strip class codes & sentiments before city regex ─────────
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
        .replace(/^(get|need|book|send|tickets?|ticket|train|trains|from|maa\s+ko|papa\s+ko|papaji\s+ko|pitaji\s+ko|bhai\s+ko|bhaiya\s+ko|sister\s+ko|didi\s+ko|dost\s+ko|family\s+ko|wife\s+ko|husband\s+ko|mujhe|hamein|मां\s+को|माँ\s+को|पापा\s+को|पिताजी\s+को|भाई\s+को|भैया\s+को|दीदी\s+को|दोस्त\s+को|परिवार\s+को|मुझे|हमे)\s+/i, "");
      const rawDest = match[2]
        .trim()
        .replace(/\s+(bhejna|bhejna\s+hai|bhejo|jana|jana\s+hai|chahiye|tickets?|ticket|train|trains|gadi|gaadi|on|next|ke\s+liye|wala|wali|भेजना|भेजना\s+है|भेजो|जाना|जाना\s+है|चाहिए|के\s+लिए|ट्रेन|गाड़ी|गाड़ी).*$/i, "");

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

  // ── Step 3: Handle missing or identical stations ──
  if (!origin || !destination) return null;
  if (origin.toLowerCase() === destination.toLowerCase()) {
    return {
      origin,
      destination,
      date: null,
      passengerNote: null,
      class: trainClass,
      confidence: "high",
      parseError: true,
    };
  }

  // ── Step 4: Date extraction (Explicit patterns + Semantic / Festival / Relative resolution) ──
  let date: string | null = null;
  for (const [pattern, template] of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      date = template.replace("$1", m[1] ?? "").replace("$2", m[2] ?? "");
      break;
    }
  }

  // Fallback to semantic / festival / relative date
  if (!date) {
    const semanticDate = extractSemanticDate(text);
    if (semanticDate.date) {
      date = semanticDate.date;
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
    // If AI / API call returned origin and destination but missed date or class, backfill with deterministic patterns!
    let dateToUse = result.date;
    let classToUse = result.class;
    if (!dateToUse || !classToUse) {
      const fb = deterministicFallback(trimmed);
      if (!dateToUse && fb?.date) dateToUse = fb.date;
      if (!classToUse && fb?.class) classToUse = fb.class;
    }

    const enhancedResult = {
      ...result,
      date: dateToUse,
      class: classToUse,
    };

    logParserDiagnostics(trimmed, enhancedResult, "AI / OpenAI Engine");
    setCachedIntent(trimmed, enhancedResult);
    return enhancedResult;
  }

  // ── Client-side deterministic fallback (safety net) ─────────────────────────
  const fallback = deterministicFallback(trimmed);
  if (fallback) {
    if (
      fallback.origin &&
      fallback.destination &&
      fallback.origin.toLowerCase() !== fallback.destination.toLowerCase()
    ) {
      logParserDiagnostics(trimmed, fallback, "Deterministic Pattern Parser");
      setCachedIntent(trimmed, fallback);
      return fallback;
    }
    if (
      fallback.origin &&
      fallback.destination &&
      fallback.origin.toLowerCase() === fallback.destination.toLowerCase()
    ) {
      logParserDiagnostics(trimmed, fallback, "Same Station Guard");
      return fallback;
    }
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
