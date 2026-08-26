/**
 * /api/parse — OpenAI structured-output call for natural-language intent extraction.
 *
 * Attribution: This server-side API route implements the primary parsing path
 * for the Waitlist Route Optimizer. The underlying approach — an OpenAI model
 * call for natural-language intent extraction — was established in the original
 * Codex/OpenAI-built language_parser project. This file extends that approach
 * with structured outputs, timeout, and retry logic as required by Part 1 of
 * the hackathon specification. The deterministic fallback lives in lib/parser.ts.
 *
 * This function must remain an OpenAI call; do NOT substitute a Gemini call.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { deterministicFallback, stripLocationPreamble, stripStuttersAndCorrections } from "@/lib/parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are a precision train booking intent parser for Indian Railways. 
Extract the journey details from the user's input (which may be in English, Hindi, or Hinglish).

Return ONLY a JSON object with these fields:
- origin: string (city name in English, e.g. "Delhi", "Mumbai", "Patna", "Ahmedabad", "Agra")
- destination: string (city name in English)
- date: string or null (e.g. "6 November", "29 November", "tomorrow", "next Monday", or null if not mentioned)
- passengerNote: string or null (any special passenger info, e.g. "for elderly mother", "for grandfather")
- class: "1A" | "2A" | "3A" | "SL" | null (train class if mentioned)
- confidence: "high" | "low" (high if you clearly identified origin and destination, low otherwise)

CRITICAL RULES:
1. Multi-City / Location Context: Never confuse the user's current location with the journey origin.
   - "I am currently in Bangalore and I want a ticket from Ahmedabad to Agra" -> origin: "Ahmedabad", destination: "Agra"
   - "I am in Chennai, but book a ticket from Hyderabad to Mumbai" -> origin: "Hyderabad", destination: "Mumbai"
   - "Currently in Delhi, please find trains from Pune to Goa" -> origin: "Pune", destination: "Goa"
2. Self-Corrections & Stutters: Always take the corrected city.
   - "from Delhi no wait from Agra to Patna" -> origin: "Agra", destination: "Patna"
3. Inverted Syntax:
   - "to Kolkata from Pune" -> origin: "Pune", destination: "Kolkata"
   - "to Patna departing from Delhi" -> origin: "Delhi", destination: "Patna"
4. Common Class Names:
   - "2A", "2am", "2 ac", "second coach", "2 tier" -> 2A
   - "3A", "3am", "3 ac", "third coach", "3 tier" -> 3A
   - "1A", "1am", "1 ac", "first coach", "first class" -> 1A
   - "sleeper", "sl", "non ac" -> SL
`;

async function callOpenAI(input: string): Promise<Record<string, unknown> | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null; // Skip OpenAI immediately if no key, fall back to deterministic regex
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
        max_tokens: 200,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { input?: string };
  const input = (body.input ?? "").trim();

  if (!input) {
    return NextResponse.json({ parseError: true }, { status: 400 });
  }

  // Pre-process stutters and location context preambles
  const sanitizedInput = stripLocationPreamble(stripStuttersAndCorrections(input));
  const deterministicRes = deterministicFallback(input);

  // ── Attempt 1 ─────────────────────────────────────────────────────────────
  let parsed = await callOpenAI(sanitizedInput);

  // ── Attempt 2 (retry once) ────────────────────────────────────────────────
  if (!parsed) {
    parsed = await callOpenAI(sanitizedInput);
  }

  if (parsed && parsed.origin && parsed.destination) {
    let o = String(parsed.origin ?? "").trim();
    let d = String(parsed.destination ?? "").trim();

    // If deterministic parser found a clear journey (e.g. from Ahmedabad to Agra),
    // and OpenAI mistakenly grabbed a stripped current-location preamble (e.g. Bangalore),
    // override with the true deterministic origin/destination!
    if (deterministicRes && deterministicRes.origin && deterministicRes.destination) {
      if (deterministicRes.origin.toLowerCase() !== deterministicRes.destination.toLowerCase()) {
        o = deterministicRes.origin;
        d = deterministicRes.destination;
      }
    }

    if (o.toLowerCase() !== d.toLowerCase()) {
      const validClasses = ["1A", "2A", "3A", "SL"];
      return NextResponse.json({
        origin: o,
        destination: d,
        date: parsed.date ? String(parsed.date) : deterministicRes?.date ?? null,
        passengerNote: parsed.passengerNote ? String(parsed.passengerNote) : deterministicRes?.passengerNote ?? null,
        class: validClasses.includes(String(parsed.class ?? "")) ? parsed.class : deterministicRes?.class ?? null,
        confidence: "high",
        fromCache: false,
      });
    }
  }

  // ── Server-side deterministic fallback ────────────────────────────────────
  const fallback = deterministicRes ?? deterministicFallback(sanitizedInput);
  if (fallback && fallback.origin && fallback.destination && fallback.origin.toLowerCase() !== fallback.destination.toLowerCase()) {
    return NextResponse.json(fallback);
  }

  return NextResponse.json({ parseError: true });
}
