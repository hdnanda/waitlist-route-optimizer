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
import { deterministicFallback } from "@/lib/parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are a train booking intent parser for Indian Railways. 
Extract the journey details from the user's input (which may be in English, Hindi, or Hinglish).

Return ONLY a JSON object with these fields:
- origin: string (city name in English, e.g. "Delhi", "Mumbai", "Patna")
- destination: string (city name in English)
- date: string or null (e.g. "6 November", "tomorrow", "next Monday", or null if not mentioned)
- passengerNote: string or null (any special passenger info, e.g. "for elderly mother")
- class: "1A" | "2A" | "3A" | "SL" | null (train class if mentioned)
- confidence: "high" | "low" (high if you clearly identified origin and destination, low otherwise)

Common Hindi/Hinglish phrases:
- "X se Y" or "X to Y" = from X to Y
- "Maa ko bhejna" = sending mother (passengerNote)
- "Chhath ke liye" = for the Chhath festival (passengerNote)
- "sleeper" or "SL" = Sleeper class
- "AC" = likely 3A unless specified
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

  // ── Attempt 1 ─────────────────────────────────────────────────────────────
  let parsed = await callOpenAI(input);

  // ── Attempt 2 (retry once) ────────────────────────────────────────────────
  if (!parsed) {
    parsed = await callOpenAI(input);
  }

  if (parsed && parsed.origin && parsed.destination) {
    const o = String(parsed.origin ?? "").trim();
    const d = String(parsed.destination ?? "").trim();
    if (o.toLowerCase() !== d.toLowerCase()) {
      const validClasses = ["1A", "2A", "3A", "SL"];
      return NextResponse.json({
        origin: o,
        destination: d,
        date: parsed.date ? String(parsed.date) : null,
        passengerNote: parsed.passengerNote ? String(parsed.passengerNote) : null,
        class: validClasses.includes(String(parsed.class ?? "")) ? parsed.class : null,
        confidence: "high",
        fromCache: false,
      });
    }
  }

  // ── Server-side deterministic fallback ────────────────────────────────────
  const fallback = deterministicFallback(input);
  if (fallback && fallback.origin && fallback.destination && fallback.origin.toLowerCase() !== fallback.destination.toLowerCase()) {
    return NextResponse.json(fallback);
  }

  return NextResponse.json({ parseError: true });
}
