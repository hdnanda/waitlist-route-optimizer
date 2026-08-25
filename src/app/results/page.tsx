"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Info, Database } from "lucide-react";
import { getRankedOptions } from "@/lib/engine";
import { useApp } from "@/lib/context";
import TicketCard from "@/components/TicketCard";
import type { TrainClass, ReasonedOption, RouteResult } from "@/lib/types";

const CLASS_OPTIONS: TrainClass[] = ["SL", "3A", "2A", "1A"];
const EXAMPLE_CHIPS = [
  { label: "Delhi → Patna", input: "Delhi to Patna 3A" },
  { label: "Mumbai → Varanasi", input: "Mumbai to Varanasi sleeper" },
  { label: "Kolkata → Delhi", input: "Kolkata to Delhi 3A" },
];

function ReasoningTrace({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl border-l-2 border-[#E8A33D] bg-black/40 p-4">
      {lines.map((line, i) => (
        <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.22, duration: 0.3 }}
          className="mb-2 font-mono text-xs leading-5 text-[#94A3B8] last:mb-0">
          {line}
        </motion.p>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { state, setParsedIntent, setSelectedOption, setSelectedClass } = useApp();
  const { parsedIntent } = state;
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedClass, setLocalClass] = useState<TrainClass | null>(parsedIntent?.class ?? null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTrace, setShowTrace] = useState(true);

  const runEngine = useCallback((cls?: TrainClass) => {
    if (!parsedIntent || parsedIntent.parseError) return;
    const r = getRankedOptions(parsedIntent, cls ?? selectedClass ?? undefined);
    setResult(r);
  }, [parsedIntent, selectedClass]);

  useEffect(() => {
    if (parsedIntent && !parsedIntent.parseError) {
      if (parsedIntent.class) {
        setLocalClass(parsedIntent.class);
        runEngine(parsedIntent.class);
      } else {
        // No class in parse — show class selector first, run with default
        runEngine();
      }
    }
  }, [parsedIntent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClassChange = (cls: TrainClass) => {
    setLocalClass(cls);
    setSelectedClass(cls);
    const r = getRankedOptions(parsedIntent!, cls);
    setResult(r);
  };

  const handleBook = (option: ReasonedOption) => {
    setSelectedOption(option);
    router.push("/login");
  };

  // ── Unparseable state ─────────────────────────────────────────────────────
  if (!parsedIntent || parsedIntent.parseError) {
    return (
      <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative flex min-h-screen flex-col px-5 pb-8 pt-8">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-[#B9BDD1] mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-2xl bg-[#1F2740] p-6">
          <p className="font-mono text-xs text-[#E8A33D] mb-2">PARSE FAILED</p>
          <h1 className="font-serif text-2xl font-semibold">Couldn&apos;t quite catch that</h1>
          <p className="mt-2 text-sm text-[#B9BDD1]">Both the AI model and the fallback parser couldn&apos;t identify your origin and destination. Try one of these:</p>
        </div>
        <div className="mt-4 grid gap-3">
          {EXAMPLE_CHIPS.map((chip) => (
            <button key={chip.label} type="button"
              onClick={() => { setParsedIntent({ origin: "", destination: "", date: null, passengerNote: null, class: null, confidence: "low" }); router.push("/"); }}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1F2740] px-4 py-4 text-left hover:border-[#E8A33D]/50">
              <span className="font-semibold text-[#F3EDE0]">{chip.label}</span>
              <ArrowLeft className="h-4 w-4 rotate-180 text-[#B9BDD1]" />
            </button>
          ))}
        </div>
        <button onClick={() => router.push("/")} className="mt-6 text-sm text-[#B9BDD1] underline">← Start a new search</button>
      </motion.main>
    );
  }

  const needsClassSelect = !parsedIntent.class && !selectedClass;

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-8 pt-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-[#B9BDD1]">
          <ArrowLeft className="h-4 w-4" /> New search
        </button>
        <button onClick={() => router.push("/tickets")} className="text-xs text-[#B9BDD1] font-mono">MY TICKETS</button>
      </div>

      <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">
        {result ? (result.routeFound ? `${result.options.length} ROUTE${result.options.length !== 1 ? "S" : ""} FOUND` : "ROUTE NOT IN DATASET") : "ROUTE ENGINE / RUNNING"}
      </span>

      <h1 className="mt-2 font-serif text-2xl font-semibold leading-8">
        {result?.directStatus === "CONFIRMED"
          ? "Direct seat confirmed."
          : result?.routeFound && result.directWL
          ? `Direct train is WL ${result.directWL}. Here's the full ladder:`
          : result && !result.routeFound
          ? "Route not in this prototype yet."
          : "Looking beyond the queue."}
      </h1>

      {/* Cache indicator */}
      {parsedIntent.fromCache && (
        <div className="mt-2 flex items-center gap-1.5 rounded-full bg-[#E8A33D]/10 px-2.5 py-1 w-fit">
          <Database className="h-3 w-3 text-[#E8A33D]" />
          <span className="font-mono text-[10px] text-[#E8A33D]">DEMO CACHE HIT</span>
        </div>
      )}

      {/* Parsed intent chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {parsedIntent.origin && (
          <span className="rounded-full bg-[#1F2740] px-3 py-1 text-xs font-semibold text-[#F3EDE0]">
            {parsedIntent.origin} → {parsedIntent.destination}
          </span>
        )}
        {parsedIntent.date && (
          <span className="rounded-full bg-[#1F2740] px-3 py-1 text-xs text-[#B9BDD1]">{parsedIntent.date}</span>
        )}
        {(selectedClass ?? parsedIntent.class) && (
          <button onClick={() => { setLocalClass(null); setResult(null); }}
            className="rounded-full bg-[#E8A33D]/20 px-3 py-1 text-xs font-bold text-[#E8A33D] hover:bg-[#E8A33D]/30 transition"
            title="Tap to change class">
            {selectedClass ?? parsedIntent.class} ✕
          </button>
        )}
        <span className={`rounded-full px-3 py-1 text-[10px] font-mono ${parsedIntent.confidence === "high" ? "bg-[#3F8F5F]/20 text-[#3F8F5F]" : "bg-[#B9BDD1]/10 text-[#B9BDD1]/70"}`}>
          {parsedIntent.confidence === "high" ? "AI parsed" : "fallback parsed"}
        </span>
      </div>

      {/* Class selector (only when class missing) */}
      <AnimatePresence>
        {needsClassSelect && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
            <p className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-2">WHICH CLASS WORKS FOR YOU?</p>
            <div className="flex gap-2 flex-wrap">
              {CLASS_OPTIONS.map((cls) => (
                <button key={cls} type="button" onClick={() => handleClassChange(cls)}
                  className="rounded-xl border border-white/10 bg-[#1F2740] px-4 py-2.5 text-sm font-bold text-[#F3EDE0] min-h-[44px] hover:border-[#E8A33D]/50 hover:bg-[#2A3454] transition active:scale-[0.97]">
                  {cls}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Reasoning trace */}
      {result && (
        <section className="mt-5">
          <button onClick={() => setShowTrace((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-2">
            REASONING TRACE
            {showTrace ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <AnimatePresence>
            {showTrace && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <ReasoningTrace lines={result.trace} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* Unknown route fallback */}
      {result && !result.routeFound && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-[#1F2740] p-5">
          <p className="font-mono text-[10px] text-[#E8A33D] mb-2">ROUTE NOT IN PROTOTYPE</p>
          <p className="text-sm text-[#B9BDD1] leading-5">
            We don&apos;t have live data for <strong className="text-[#F3EDE0]">{parsedIntent.origin} → {parsedIntent.destination}</strong> in this prototype yet.
          </p>
          <p className="mt-3 text-sm text-[#B9BDD1] leading-5">
            Here&apos;s how the optimizer <em>would</em> reason about it: check direct status → scan intermediate quotas along the corridor → find nearby alternate stations within 20km → rank by confirmation certainty.
          </p>
          <p className="mt-3 text-xs font-mono text-[#B9BDD1]/50">
            Covered routes: NDLS–PNBE, CSMT–BSB, SBC–LKO, MAS–PNBE, HWH–NDLS, ADI–GKP
          </p>
          <button onClick={() => router.push("/")} className="mt-4 text-sm text-[#E8A33D] underline">← Try a covered route</button>
        </motion.div>
      )}

      {/* Ticket cards */}
      {result?.routeFound && result.options.length > 0 && (
        <section className="mt-5 space-y-4">
          {result.options.map((option, i) => (
            <TicketCard key={option.id} option={option} onBook={() => handleBook(option)} index={i} />
          ))}
        </section>
      )}

      {/* How it works panel */}
      {result?.routeFound && (
        <section className="mt-6">
          <button onClick={() => setShowHowItWorks((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl bg-[#1F2740] px-4 py-3.5 text-sm font-semibold text-[#F3EDE0]">
            <span className="flex items-center gap-2"><Info className="h-4 w-4 text-[#E8A33D]" /> How this works for real</span>
            {showHowItWorks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <AnimatePresence>
            {showHowItWorks && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="rounded-b-xl bg-[#1F2740]/70 px-4 pb-5 pt-2 text-xs text-[#B9BDD1] leading-5 space-y-3">
                  {[
                    ["MOCK", "Chart prep happens 4 hours before departure. We monitor both split legs independently."],
                    ["MOCK", "If Leg 1 of a split fails to confirm at charting, we auto-fall back to the direct waitlist or next available train."],
                    ["MOCK", "TDR/refund: a cancelled split leg is filed via TDR within 72 hrs automatically — no manual action needed."],
                    ["REAL PLAN", "The AI does not calculate routes or times. A deterministic backend computes split-ticket permutations, quota checks, and layovers. The OpenAI model is used only to (1) parse the user's natural-language request and (2) write the plain-language explanations."],
                    ["REAL PLAN", "Confidence percentages are static mock values standing in for what would be a historical clearance-rate calculation over real PRS chart data in production."],
                    ["REAL PLAN", "Payment deduction without ticket confirmation is IRCTC's most common real complaint. A production version would use idempotent payment intents with webhook-based reconciliation instead of IRCTC's current fire-and-forget flow."],
                  ].map(([tag, text], i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${tag === "MOCK" ? "bg-[#E8A33D]/20 text-[#E8A33D]" : "bg-[#3F8F5F]/20 text-[#3F8F5F]"}`}>
                        {tag}
                      </span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      <button onClick={() => router.push("/")} className="mt-6 w-full py-3 text-sm font-semibold text-[#B9BDD1] hover:text-[#F3EDE0]">
        ← Start a new search
      </button>
    </motion.main>
  );
}
