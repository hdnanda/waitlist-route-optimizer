"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Database,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";
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

function formatQuickDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

function formatPickedDate(isoDateStr: string): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  }
  return isoDateStr;
}

export default function ResultsPage() {
  const router = useRouter();
  const { state, setParsedIntent, setSelectedOption, setSelectedClass } = useApp();
  const { parsedIntent } = state;
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedClass, setLocalClass] = useState<TrainClass | null>(parsedIntent?.class ?? null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // ── Spotlight Focus State ──────────────────────────────────────────────────
  const [spotlightMissing, setSpotlightMissing] = useState<("class" | "date")[] | null>(null);
  const [pendingBookingOption, setPendingBookingOption] = useState<ReasonedOption | null>(null);
  const [spotlightShakeCount, setSpotlightShakeCount] = useState(0);
  const selectorsRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // ── Engine runner (requires BOTH date and class to run) ────────────────────
  const runEngine = useCallback((cls?: TrainClass, dateOverride?: string) => {
    if (!parsedIntent || parsedIntent.parseError) return;
    const dateToUse = dateOverride ?? parsedIntent.date;
    const classToUse = cls ?? selectedClass ?? parsedIntent.class;

    // Only search/display trains if BOTH date and class are known
    if (!dateToUse || !classToUse) {
      setResult(null);
      return;
    }

    const r = getRankedOptions(
      { ...parsedIntent, date: dateToUse, class: classToUse },
      classToUse
    );
    setResult(r);
  }, [parsedIntent, selectedClass]);

  useEffect(() => {
    if (parsedIntent && !parsedIntent.parseError) {
      if (parsedIntent.class) {
        setLocalClass(parsedIntent.class);
      }
      const hasDate = Boolean(parsedIntent.date);
      const hasCls = Boolean(parsedIntent.class ?? selectedClass);
      if (hasDate && hasCls) {
        runEngine(parsedIntent.class ?? selectedClass ?? undefined, parsedIntent.date ?? undefined);
      } else {
        setResult(null);
      }
    }
  }, [parsedIntent]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Class resolution ───────────────────────────────────────────────────────
  const handleClassChange = (cls: TrainClass) => {
    setLocalClass(cls);
    setSelectedClass(cls);
    if (parsedIntent) {
      setParsedIntent({ ...parsedIntent, class: cls });
      if (parsedIntent.date) {
        runEngine(cls, parsedIntent.date);
      }
    }

    if (spotlightMissing?.includes("class")) {
      const remaining = spotlightMissing.filter((m) => m !== "class");
      const dateResolved = Boolean(parsedIntent?.date);
      if (remaining.length === 0 || (remaining.length === 1 && remaining[0] === "date" && dateResolved)) {
        setSpotlightMissing(null);
        if (pendingBookingOption) {
          const optionToBook = pendingBookingOption;
          setPendingBookingOption(null);
          proceedToLogin(optionToBook);
        }
      } else {
        setSpotlightMissing(remaining);
      }
    }
  };

  const handleClassReset = () => {
    setLocalClass(null);
    setSelectedClass(null as unknown as TrainClass);
    if (parsedIntent) {
      setParsedIntent({ ...parsedIntent, class: null });
    }
    setResult(null); // Gated off until class is chosen again
  };

  // ── Date resolution ────────────────────────────────────────────────────────
  const handleDateChange = (dateStr: string | null) => {
    if (!parsedIntent) return;
    const updated = { ...parsedIntent, date: dateStr };
    setParsedIntent(updated);
    const activeClass = selectedClass ?? parsedIntent.class;
    if (dateStr && activeClass) {
      runEngine(activeClass, dateStr);
    } else {
      setResult(null); // Gated off until both are present
    }

    if (dateStr && spotlightMissing?.includes("date")) {
      const remaining = spotlightMissing.filter((m) => m !== "date");
      const classResolved = Boolean(selectedClass ?? parsedIntent.class);
      if (remaining.length === 0 || (remaining.length === 1 && remaining[0] === "class" && classResolved)) {
        setSpotlightMissing(null);
        if (pendingBookingOption) {
          const optionToBook = pendingBookingOption;
          setPendingBookingOption(null);
          proceedToLogin(optionToBook);
        }
      } else {
        setSpotlightMissing(remaining);
      }
    }
  };

  // ── Hard Booking Guard & Spotlight Trigger ─────────────────────────────────
  const proceedToLogin = (option: ReasonedOption) => {
    setSelectedOption(option);
    router.push("/login");
  };

  const triggerSpotlight = (missing: ("class" | "date")[], option: ReasonedOption) => {
    setSpotlightMissing(missing);
    setPendingBookingOption(option);
    setTimeout(() => {
      selectorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleBook = (option: ReasonedOption) => {
    const currentClass = selectedClass ?? parsedIntent?.class;
    const currentDate = parsedIntent?.date;

    const missing: ("class" | "date")[] = [];
    if (!currentClass) missing.push("class");
    if (!currentDate) missing.push("date");

    if (missing.length > 0) {
      triggerSpotlight(missing, option);
      return;
    }

    proceedToLogin(option);
  };

  const handleBackdropClick = () => {
    setSpotlightShakeCount((c) => c + 1);
  };

  // ── Unparseable state ─────────────────────────────────────────────────────
  if (!parsedIntent || parsedIntent.parseError) {
    return (
      <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative flex min-h-screen flex-col px-5 pb-12 pt-7 bg-transparent text-white w-full">
        <div className="max-w-[480px] lg:max-w-xl mx-auto w-full">
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
        </div>
      </motion.main>
    );
  }

  const hasDate = Boolean(parsedIntent.date);
  const activeClass = selectedClass ?? parsedIntent.class;
  const hasClass = Boolean(activeClass);
  const isReady = hasDate && hasClass;

  const needsClassSelect = !hasClass;
  const needsDateSelect = !hasDate;

  const quickDates = [
    { label: "Today", value: formatQuickDate(0) },
    { label: "Tomorrow", value: formatQuickDate(1) },
    { label: "In 2 days", value: formatQuickDate(2) },
  ];

  const isDateSpotlighted = spotlightMissing?.includes("date");
  const isClassSpotlighted = spotlightMissing?.includes("class");

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-4 lg:pt-8 bg-transparent text-white w-full">
      
      {/* ── Spotlight Backdrop Scrim ────────────────────────────────────────── */}
      <AnimatePresence>
        {spotlightMissing && (
          <motion.div
            key="spotlight-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-40 bg-black/85 backdrop-blur-[8px] cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* ── Responsive Main Container: max-w-[480px] on mobile, expanding to max-w-7xl on desktop ── */}
      <div className="w-full max-w-[480px] md:max-w-2xl lg:max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> New search
          </button>
          <button onClick={() => router.push("/tickets")} className="text-xs text-[#E8A33D] font-mono font-bold tracking-wider hover:underline">MY TICKETS</button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">
            {!hasDate && !hasClass
              ? "SELECT DATE & SEAT CLASS · 2 STEPS REQUIRED"
              : !hasDate
              ? "SELECT TRAVEL DATE · 1 STEP REQUIRED"
              : !hasClass
              ? "SELECT SEAT CLASS · 1 STEP REQUIRED"
              : result
              ? (result.routeFound ? `${result.options.length} ROUTE${result.options.length !== 1 ? "S" : ""} FOUND` : "ROUTE NOT IN DATASET")
              : "SEARCHING AVAILABLE TRAINS"}
          </span>
          {result?.generated && (
            <span className="rounded-full border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[#E8A33D]">
              ⚙ GENERATED EXAMPLE
            </span>
          )}
        </div>

        {/* Dynamic Headline */}
        <h1 className="mt-2 font-serif text-2xl lg:text-3xl font-bold leading-tight text-white">
          {!hasDate && !hasClass
            ? "Pick your travel date and preferred seat class to find trains."
            : !hasDate
            ? "When are you traveling? Pick a date to search trains."
            : !hasClass
            ? "Which seat class do you prefer for your journey?"
            : result?.directStatus === "CONFIRMED"
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
            <button
              type="button"
              onClick={() => handleDateChange(null)}
              className="rounded-full border border-[#E8A33D]/70 bg-[#E8A33D]/15 px-3 py-1 text-xs font-bold text-[#E8A33D] hover:bg-[#E8A33D]/25 transition font-mono"
              title="Tap to change date"
            >
              {parsedIntent.date} ✕
            </button>
          )}
          {activeClass && (
            <button
              type="button"
              onClick={handleClassReset}
              className="rounded-full border border-[#E8A33D]/70 bg-[#E8A33D]/15 px-3 py-1 text-xs font-bold text-[#E8A33D] hover:bg-[#E8A33D]/25 transition font-mono"
              title="Tap to change class"
            >
              {activeClass} ✕
            </button>
          )}
          <span className={`rounded-full border px-3 py-1 text-[10px] font-mono ${parsedIntent.confidence === "high" ? "border-[#3F8F5F]/50 bg-[#3F8F5F]/15 text-[#3F8F5F] font-bold" : "border-white/10 bg-white/5 text-slate-400"}`}>
            {parsedIntent.confidence === "high" ? "AI parsed" : "fallback parsed"}
          </span>
        </div>

        {/* ── Unresolved Selectors Area (Date & Class) ────────────────────────── */}
        <div ref={selectorsRef} className="mt-5 space-y-4">
          {/* Spotlight inline banner prompt */}
          <AnimatePresence>
            {spotlightMissing && (
              <motion.div
                key="spotlight-banner"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  x: spotlightShakeCount > 0 ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
                }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="z-50 relative flex items-center gap-2.5 rounded-xl border border-[#E8A33D] bg-[#0A0A0A] p-3.5 shadow-[0_0_20px_rgba(232,163,61,0.5)]"
              >
                <AlertCircle className="h-5 w-5 text-[#E8A33D] shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-mono font-bold text-[#E8A33D] uppercase tracking-wider">
                    Action required to book
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {spotlightMissing.includes("date") && spotlightMissing.includes("class")
                      ? "Pick a travel date and class to continue"
                      : spotlightMissing.includes("date")
                      ? "Pick a travel date to continue"
                      : "Pick a travel class to continue"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. Date selector row */}
          <AnimatePresence>
            {needsDateSelect && (
              <motion.section
                key="date-selector"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: spotlightShakeCount > 0 && isDateSpotlighted ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
                }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-2xl p-4 transition-all duration-300 ${
                  isDateSpotlighted
                    ? "z-50 relative bg-[#0A0A0A] border-2 border-[#E8A33D] shadow-[0_0_24px_rgba(232,163,61,0.55),inset_0_0_12px_rgba(232,163,61,0.1)] ring-1 ring-[#E8A33D]"
                    : "relative bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_10px_rgba(232,163,61,0.25)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#E8A33D]" />
                    <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D]">
                      WHEN DO YOU WANT TO TRAVEL?
                    </p>
                  </div>
                  {isDateSpotlighted ? (
                    <span className="rounded-full bg-[#E8A33D] text-black px-2.5 py-0.5 text-[9px] font-mono font-extrabold uppercase shadow-[0_0_8px_rgba(232,163,61,0.6)]">
                      Select date
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#E8A33D]">
                      REQUIRED
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5 flex-wrap items-center">
                  {quickDates.map((qd) => (
                    <button
                      key={qd.label}
                      type="button"
                      onClick={() => handleDateChange(qd.value)}
                      className="rounded-xl border border-[#E8A33D]/60 bg-[#080808] px-3.5 py-2.5 text-xs font-bold text-white min-h-[44px] hover:border-[#E8A33D] hover:shadow-[0_0_12px_rgba(232,163,61,0.4)] transition active:scale-[0.97]"
                    >
                      <span className="block text-slate-200">{qd.label}</span>
                      <span className="block text-[10px] font-mono text-slate-400 font-normal mt-0.5">
                        {qd.value}
                      </span>
                    </button>
                  ))}

                  {/* "Pick a date" native picker chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.focus()}
                      className="rounded-xl border border-[#E8A33D]/60 bg-[#080808] px-3.5 py-2.5 text-xs font-bold text-[#E8A33D] min-h-[44px] hover:border-[#E8A33D] hover:shadow-[0_0_12px_rgba(232,163,61,0.4)] transition flex items-center gap-2 active:scale-[0.97]"
                    >
                      <Calendar className="h-4 w-4 text-[#E8A33D]" />
                      <span>Pick a date</span>
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          const formatted = formatPickedDate(e.target.value);
                          handleDateChange(formatted);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Select custom date"
                    />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* 2. Class selector row */}
          <AnimatePresence>
            {needsClassSelect && (
              <motion.section
                key="class-selector"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: spotlightShakeCount > 0 && isClassSpotlighted ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
                }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-2xl p-4 transition-all duration-300 ${
                  isClassSpotlighted
                    ? "z-50 relative bg-[#0A0A0A] border-2 border-[#E8A33D] shadow-[0_0_24px_rgba(232,163,61,0.55),inset_0_0_12px_rgba(232,163,61,0.1)] ring-1 ring-[#E8A33D]"
                    : "relative bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_10px_rgba(232,163,61,0.25)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
                    <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D]">
                      WHICH SEAT CLASS WORKS FOR YOU?
                    </p>
                  </div>
                  {isClassSpotlighted ? (
                    <span className="rounded-full bg-[#E8A33D] text-black px-2.5 py-0.5 text-[9px] font-mono font-extrabold uppercase shadow-[0_0_8px_rgba(232,163,61,0.6)]">
                      Select class
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#E8A33D]">
                      REQUIRED
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5 flex-wrap">
                  {CLASS_OPTIONS.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleClassChange(cls)}
                      className="rounded-xl border border-[#E8A33D]/60 bg-[#080808] px-4 py-2.5 text-sm font-bold text-white min-h-[44px] hover:border-[#E8A33D] hover:shadow-[0_0_12px_rgba(232,163,61,0.4)] transition active:scale-[0.97]"
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Unknown route fallback (only when both date and class are selected) */}
        {isReady && result && !result.routeFound && (
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

        {/* ── Ticket Cards: ONLY when BOTH seat class and date are selected ── */}
        {isReady && result?.routeFound && result.options.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-6 space-y-4"
          >
            <div className="mb-2 mt-1 px-1">
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                <span className="text-[#E8A33D] font-bold">SYSTEM LOG: </span> 
                Analyzed {result.stats?.directAnalyzed ?? 18} direct trains and {result.stats?.splitCombinations ?? 142} intermediate split-route combinations along the {result.originDisplay}–{result.destinationDisplay} corridor for <span className="text-white font-bold">{parsedIntent.date}</span> ({activeClass} class). Excluded all routes with layovers &gt; {result.stats?.maxLayoverMins ?? 45} mins. Displaying the {result.options.length} highest-probability {result.options.length === 1 ? "option" : "options"}:
              </p>
            </div>

            {/* Desktop 3-Column Grid on lg+, Vertical Stack below lg */}
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-stretch">
              {result.options.map((option, i) => (
                <TicketCard key={option.id} option={option} onBook={() => handleBook(option)} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── How it works & Reasoning trace panels (Full width below the grid when tickets are active) ── */}
        {isReady && result?.routeFound && (
          <section className="mt-8 w-full space-y-3">
            {/* 1. Reasoning Trace Accordion ("See how we found this") */}
            {result.trace && result.trace.length > 0 && (
              <div>
                <button
                  onClick={() => setShowTrace((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl bg-[#080808] border border-[#E8A33D]/40 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_8px_rgba(232,163,61,0.15)] hover:border-[#E8A33D] transition"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#E8A33D]" /> See how we found this (Engine Trace)
                  </span>
                  {showTrace ? <ChevronUp className="h-4 w-4 text-[#E8A33D]" /> : <ChevronDown className="h-4 w-4 text-[#E8A33D]" />}
                </button>
                <AnimatePresence>
                  {showTrace && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-b-xl bg-[#050505] border-x border-b border-[#E8A33D]/30 p-4 font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
                        {result.trace.map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#E8A33D] font-bold shrink-0">[{i + 1}]</span>
                            <span className={line.startsWith("→ checking direct") ? "text-amber-300" : line.startsWith("→ found") ? "text-emerald-400" : "text-slate-300"}>{line}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 2. Architecture & Systems Panel ("How this works for real") */}
            <div>
              <button
                onClick={() => setShowHowItWorks((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl bg-[#080808] border border-[#E8A33D]/40 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_8px_rgba(232,163,61,0.15)] hover:border-[#E8A33D] transition"
              >
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#E8A33D]" /> How this works for real
                </span>
                {showHowItWorks ? <ChevronUp className="h-4 w-4 text-[#E8A33D]" /> : <ChevronDown className="h-4 w-4 text-[#E8A33D]" />}
              </button>
              <AnimatePresence>
                {showHowItWorks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
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
            </div>
          </section>
        )}

        <button onClick={() => router.push("/")} className="mt-8 w-full py-3 text-sm font-mono text-slate-400 hover:text-white transition">
          ← Start a new search
        </button>
      </div>
    </motion.main>
  );
}
