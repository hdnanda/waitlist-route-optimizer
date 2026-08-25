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

export default function ResultsPage() {
  const router = useRouter();
  const { state, setParsedIntent, setSelectedOption, setSelectedClass } = useApp();
  const { parsedIntent } = state;
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedClass, setLocalClass] = useState<TrainClass | null>(parsedIntent?.class ?? null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
        className="relative flex min-h-screen flex-col px-5 pb-12 pt-7 bg-black text-white">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back to search
        </button>
        <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/80 shadow-[0_0_14px_rgba(232,163,61,0.35)] p-6">
          <p className="font-mono text-xs font-bold text-[#E8A33D] mb-2">PARSE FAILED</p>
          <h1 className="font-serif text-2xl font-bold text-white">Couldn&apos;t quite catch that</h1>
          <p className="mt-2 text-sm text-slate-300">Both the AI model and the fallback parser couldn&apos;t identify your origin and destination. Try one of these:</p>
        </div>
        <div className="mt-4 grid gap-3">
          {EXAMPLE_CHIPS.map((chip) => (
            <button key={chip.label} type="button"
              onClick={() => { setParsedIntent({ origin: "", destination: "", date: null, passengerNote: null, class: null, confidence: "low" }); router.push("/"); }}
              className="flex items-center justify-between rounded-xl border border-[#E8A33D]/40 bg-[#080808] hover:border-[#E8A33D] p-4 text-left transition shadow-[0_0_8px_rgba(232,163,61,0.2)]">
              <span className="font-semibold text-white">{chip.label}</span>
              <ArrowLeft className="h-4 w-4 rotate-180 text-[#E8A33D]" />
            </button>
          ))}
        </div>
        <button onClick={() => router.push("/")} className="mt-6 text-sm text-[#E8A33D] hover:underline font-mono">← Start a new search</button>
      </motion.main>
    );
  }

  const needsClassSelect = !parsedIntent.class && !selectedClass;

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-6 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> New search
        </button>
        <button onClick={() => router.push("/tickets")} className="text-xs text-[#E8A33D] font-mono font-bold tracking-wider hover:underline">MY TICKETS</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">
          {result ? (result.routeFound ? `${result.options.length} ROUTE${result.options.length !== 1 ? "S" : ""} FOUND` : "ROUTE NOT IN DATASET") : "ROUTE ENGINE / RUNNING"}
        </span>
        {result?.generated && (
          <span className="rounded-full border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[#E8A33D]">
            ⚙ GENERATED EXAMPLE
          </span>
        )}
      </div>

      <h1 className="mt-2 font-serif text-2xl font-bold leading-8 text-white">
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
        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-2.5 py-1 w-fit">
          <Database className="h-3 w-3 text-[#E8A33D]" />
          <span className="font-mono text-[10px] text-[#E8A33D] font-bold">DEMO CACHE HIT</span>
        </div>
      )}

      {/* Parsed intent chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {parsedIntent.origin && (
          <span className="rounded-full border border-white/10 bg-[#080808] px-3 py-1 text-xs font-semibold text-white shadow-[0_0_8px_rgba(255,255,255,0.05)]">
            {parsedIntent.origin} → {parsedIntent.destination}
          </span>
        )}
        {parsedIntent.date && (
          <span className="rounded-full border border-white/10 bg-[#080808] px-3 py-1 text-xs font-mono text-slate-400">{parsedIntent.date}</span>
        )}
        {(selectedClass ?? parsedIntent.class) && (
          <button onClick={() => { setLocalClass(null); setResult(null); }}
            className="rounded-full border border-[#E8A33D]/70 bg-[#E8A33D]/15 px-3 py-1 text-xs font-bold text-[#E8A33D] hover:bg-[#E8A33D]/25 transition font-mono"
            title="Tap to change class">
            {selectedClass ?? parsedIntent.class} ✕
          </button>
        )}
        <span className={`rounded-full border px-3 py-1 text-[10px] font-mono ${parsedIntent.confidence === "high" ? "border-[#3F8F5F]/50 bg-[#3F8F5F]/15 text-[#3F8F5F] font-bold" : "border-white/10 bg-white/5 text-slate-400"}`}>
          {parsedIntent.confidence === "high" ? "AI parsed" : "fallback parsed"}
        </span>
      </div>

      {/* Class selector (only when class missing) */}
      <AnimatePresence>
        {needsClassSelect && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
            <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D] mb-2">WHICH CLASS WORKS FOR YOU?</p>
            <div className="flex gap-2.5 flex-wrap">
              {CLASS_OPTIONS.map((cls) => (
                <button key={cls} type="button" onClick={() => handleClassChange(cls)}
                  className="rounded-xl border border-[#E8A33D]/60 bg-[#080808] px-4 py-2.5 text-sm font-bold text-white min-h-[44px] hover:border-[#E8A33D] hover:shadow-[0_0_12px_rgba(232,163,61,0.4)] transition active:scale-[0.97]">
                  {cls}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Unknown route fallback */}
      {result && !result.routeFound && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_12px_rgba(232,163,61,0.3)] p-5">
          <p className="font-mono text-[10px] font-bold text-[#E8A33D] mb-2">ROUTE NOT IN PROTOTYPE</p>
          <p className="text-sm text-slate-300 leading-5">
            We don&apos;t have live data for <strong className="text-white">{parsedIntent.origin} → {parsedIntent.destination}</strong> in this prototype yet.
          </p>
          <p className="mt-3 text-sm text-slate-400 leading-5">
            Here&apos;s how the optimizer <em>would</em> reason about it: check direct status → scan intermediate quotas along the corridor → find nearby alternate stations within 20km → rank by confirmation certainty.
          </p>
          <p className="mt-3 text-xs font-mono text-slate-500">
            Covered routes: NDLS–PNBE, CSMT–BSB, SBC–LKO, MAS–PNBE, HWH–NDLS, ADI–GKP
          </p>
          <button onClick={() => router.push("/")} className="mt-4 text-sm text-[#E8A33D] font-mono underline">← Try a covered route</button>
        </motion.div>
      )}

      {/* Ticket cards */}
      {result?.routeFound && result.options.length > 0 && (
        <section className="mt-5 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2 mt-1 px-1"
          >
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              <span className="text-[#E8A33D] font-bold">SYSTEM LOG: </span> 
              Analyzed {result.stats?.directAnalyzed ?? 18} direct trains and {result.stats?.splitCombinations ?? 142} intermediate split-route combinations along the {result.originDisplay}–{result.destinationDisplay} corridor. Excluded all routes with layovers &gt; {result.stats?.maxLayoverMins ?? 45} mins. Displaying the {result.options.length} highest-probability {result.options.length === 1 ? "option" : "options"}:
            </p>
          </motion.div>
          {result.options.map((option, i) => (
            <TicketCard key={option.id} option={option} onBook={() => handleBook(option)} index={i} />
          ))}
        </section>
      )}

      {/* How it works panel */}
      {result?.routeFound && (
        <section className="mt-6">
          <button onClick={() => setShowHowItWorks((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl bg-[#080808] border border-[#E8A33D]/40 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_8px_rgba(232,163,61,0.15)] hover:border-[#E8A33D]">
            <span className="flex items-center gap-2"><Info className="h-4 w-4 text-[#E8A33D]" /> How this works for real</span>
            {showHowItWorks ? <ChevronUp className="h-4 w-4 text-[#E8A33D]" /> : <ChevronDown className="h-4 w-4 text-[#E8A33D]" />}
          </button>
          <AnimatePresence>
            {showHowItWorks && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="rounded-b-xl bg-[#050505] border-x border-b border-[#E8A33D]/30 px-4 pb-5 pt-3 text-xs text-slate-300 leading-5 space-y-3">
                  {[
                    ["MOCK", "Chart prep happens 4 hours before departure. We monitor both split legs independently."],
                    ["MOCK", "If Leg 1 of a split fails to confirm at charting, we auto-fall back to the direct waitlist or next available train."],
                    ["MOCK", "TDR/refund: a cancelled split leg is filed via TDR within 72 hrs automatically — no manual action needed."],
                    ["REAL PLAN", "The AI does not calculate routes or times. A deterministic backend computes split-ticket permutations, quota checks, and layovers. The OpenAI model is used only to (1) parse the user's natural-language request and (2) write the plain-language explanations."],
                    ["REAL PLAN", "Confidence percentages are static mock values standing in for what would be a historical clearance-rate calculation over real PRS chart data in production."],
                    ["REAL PLAN", "Payment deduction without ticket confirmation is IRCTC's most common real complaint. A production version would use idempotent payment intents with webhook-based reconciliation instead of IRCTC's current fire-and-forget flow."],
                    ["REAL PLAN", "Our 16 hand-modeled routes reflect realistic current train patterns. Any other route is generated on the spot using real geographic distance and known junction data — in production this layer would be replaced by live PRS queries, but the app never simply says no."],
                  ].map(([tag, text], i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${tag === "MOCK" ? "border border-[#E8A33D]/50 bg-[#E8A33D]/15 text-[#E8A33D]" : "border border-[#3F8F5F]/50 bg-[#3F8F5F]/15 text-[#3F8F5F]"}`}>
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

      <button onClick={() => router.push("/")} className="mt-6 w-full py-3 text-sm font-mono text-slate-400 hover:text-white transition">
        ← Start a new search
      </button>
    </motion.main>
  );
}
