"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrainFront,
  Mic,
  MicOff,
  ArrowRight,
  Loader2,
  Menu,
  Sparkles,
  MapPin,
  Star,
  Heart,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { parseIntent } from "@/lib/parser";
import { useApp } from "@/lib/context";

const EXAMPLE_CHIPS = [
  {
    label: "Delhi → Patna",
    sublabel: "Nov 6, 3A (WL scenario)",
    input: "Delhi to Patna on 6 November, 3A class",
    icon: MapPin,
  },
  {
    label: "Mumbai → Varanasi",
    sublabel: "SL direct confirmed",
    input: "Mumbai to Varanasi sleeper class",
    icon: Star,
  },
  {
    label: "Maa ko Patna bhejna",
    sublabel: "Hinglish · Chhath special",
    input: "Maa ko Chhath ke liye Patna bhejna hai, Delhi se, 6 November ko",
    icon: Heart,
  },
  {
    label: "Bengaluru → Lucknow",
    sublabel: "2A waitlisted",
    input: "Bangalore to Lucknow 2A",
    icon: Ticket,
  },
  {
    label: "Kolkata → Delhi",
    sublabel: "Split ticket available",
    input: "Kolkata to Delhi 3A",
    icon: ShieldCheck,
  },
  {
    label: "Ahmedabad → Gorakhpur",
    sublabel: "SL direct confirmed",
    input: "Ahmedabad to Gorakhpur sleeper",
    icon: Sparkles,
  },
];

function GlowingSectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center my-5">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E8A33D]/40 to-[#E8A33D]/80" />
      <div className="flex items-center gap-1.5 px-3">
        <Sparkles className="h-2.5 w-2.5 text-[#E8A33D] animate-pulse" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#E8A33D] uppercase">
          {title}
        </span>
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E8A33D]/40 to-[#E8A33D]/80" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { setParsedIntent } = useApp();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const handleSearch = useCallback(
    async (query?: string) => {
      const text = query ?? input;
      if (!text.trim()) {
        setInputError("Enter or speak a journey request.");
        return;
      }
      setInputError("");
      setLoading(true);
      try {
        const intent = await parseIntent(text.trim());
        setParsedIntent(intent);
        router.push("/results");
      } catch {
        setInputError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [input, router, setParsedIntent]
  );

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setInputError("Voice not supported on this browser.");
      return;
    }
    if (listening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = (e.results?.[0]?.[0]?.transcript ?? "") as string;
      setInput(transcript);
      setListening(false);
      void handleSearch(transcript);
    };
    recognition.onerror = () => {
      setInputError("Voice failed. Please type instead.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-screen flex-col px-5 pb-16 pt-6 bg-black"
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrainFront className="h-4 w-4 text-[#E8A33D] drop-shadow-[0_0_8px_rgba(232,163,61,0.6)]" />
          <span className="font-mono text-xs tracking-widest text-[#E8A33D] uppercase font-bold">
            INDIAN RAIL ROUTES
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/tickets")}
          aria-label="Menu"
          className="h-8 w-8 rounded-full border border-[#E8A33D]/80 shadow-[0_0_10px_rgba(232,163,61,0.35)] flex items-center justify-center bg-black hover:bg-[#0A0A0A] transition-all duration-200"
        >
          <Menu className="h-4 w-4 text-[#E8A33D]" />
        </button>
      </div>

      {/* ── Main Title Block ────────────────────────────────────────────────── */}
      <header className="mt-0.5">
        <h1 className="font-serif text-4xl font-extrabold text-white tracking-tight leading-tight">
          घर वापसी
        </h1>
        <div className="my-2 h-[1px] w-full bg-gradient-to-r from-[#E8A33D]/80 via-[#E8A33D]/30 to-transparent" />
        <p className="text-sm text-slate-200 font-medium">Waitlist Route Optimizer</p>
        <p className="mt-0.5 text-xs text-slate-400">
          बुक करें जब टिकट मिले — हम रास्ता निकालते हैं
        </p>
      </header>

      {/* ── "Ask Anything" Search Input Area (NOW PLACED ON TOP) ───────────── */}
      <section className="mt-1">
        <GlowingSectionDivider title="ASK ANYTHING" />
        <div className="bg-[#050505] rounded-2xl p-4 border border-[#E8A33D]/90 shadow-[0_0_14px_rgba(232,163,61,0.45)] relative flex flex-col justify-between min-h-[120px] transition-all duration-200 hover:shadow-[0_0_20px_rgba(232,163,61,0.65)]">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInputError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="e.g. Maa ko Chhath ke liye Patna bhejna hai, 6 November ko"
            className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none w-full pr-14 resize-none leading-relaxed h-20"
          />
          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
            <span className="text-[10px] font-mono text-slate-500">
              Hindi · English · Hinglish
            </span>
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={listening ? "Stop voice" : "Start voice"}
              className={`h-9 w-9 rounded-full border border-[#E8A33D]/90 shadow-[0_0_12px_rgba(232,163,61,0.5)] flex items-center justify-center transition-all ${
                listening
                  ? "bg-[#C0432E] text-white animate-pulse"
                  : "bg-black text-[#E8A33D] hover:bg-[#121212] hover:scale-105"
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {listening && (
          <p className="mt-2 text-xs text-[#E8A33D] animate-pulse font-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#E8A33D] animate-ping" />
            LISTENING — बोलिए...
          </p>
        )}
        {inputError && <p className="mt-2 text-xs text-[#E8A33D] font-mono">{inputError}</p>}

        {/* Search CTA Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading || !input.trim()}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.5)] transition-all hover:bg-[#F0B250] hover:shadow-[0_0_24px_rgba(232,163,61,0.7)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" /> Parsing...
              </>
            ) : (
              <>
                Find confirmed journey <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-500 font-mono">
            We look beyond direct waitlists to find the best route.
          </p>
        </div>
      </section>

      {/* ── Quick Start 2x3 Grid (NOW BELOW SEARCH) ────────────────────────── */}
      <section className="mt-2">
        <GlowingSectionDivider title="QUICK START — TAP TO TRY" />
        <div className="grid grid-cols-2 gap-3 my-1">
          {EXAMPLE_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => void handleSearch(chip.input)}
                disabled={loading}
                className="bg-[#050505] hover:bg-[#0A0A0A] rounded-2xl p-3.5 border border-[#E8A33D]/80 shadow-[0_0_10px_rgba(232,163,61,0.35)] hover:shadow-[0_0_18px_rgba(232,163,61,0.65),inset_0_0_10px_rgba(232,163,61,0.15)] flex flex-col justify-between cursor-pointer text-left transition-all duration-200 min-h-[92px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className="h-4 w-4 text-[#E8A33D] drop-shadow-[0_0_6px_rgba(232,163,61,0.5)]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]/40" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white leading-tight mt-1.5">
                    {chip.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                    {chip.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Loading Overlay ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4 bg-[#050505] p-6 rounded-2xl border border-[#E8A33D]/90 shadow-[0_0_25px_rgba(232,163,61,0.55)]">
              <Loader2 className="h-10 w-10 animate-spin text-[#E8A33D]" />
              <p className="font-mono text-sm text-slate-200">
                Reasoning through routes & quotas...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
