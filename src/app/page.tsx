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

  // ── Devanagari → Hinglish transliteration ────────────────────────────────
  // Converts Devanagari speech-to-text output phonetically to Roman Hinglish
  // so Hindi queries become clean Hinglish for the parser (e.g. "दिल्ली से पटना" → "dilli se patna").
  const devanagariToHinglish = (text: string): string => {
    const consonants: Record<string, string> = {
      "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
      "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
      "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
      "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
      "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
      "य": "y", "र": "r", "ल": "l", "व": "v",
      "श": "sh", "ष": "sh", "स": "s", "ह": "h",
      "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy",
      "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "d", "ढ़": "dh", "फ़": "f"
    };

    const independentVowels: Record<string, string> = {
      "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
      "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
      "अं": "an", "अः": "ah"
    };

    const matras: Record<string, string> = {
      "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
      "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri",
      "ॅ": "e", "ॉ": "o"
    };

    let out = "";
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      const nextCh = text[i + 1] || "";
      
      // Check nukta combinations (e.g. क + ़ = क़)
      if (nextCh === "़") {
        const combined = ch + nextCh;
        const base = consonants[combined] || consonants[ch] || ch;
        const afterNukta = text[i + 2] || "";
        if (matras[afterNukta]) {
          out += base + matras[afterNukta];
          i += 3;
        } else if (afterNukta === "्") {
          out += base;
          i += 3;
        } else {
          out += base + "a";
          i += 2;
        }
        continue;
      }

      if (independentVowels[ch]) {
        out += independentVowels[ch];
        i++;
      } else if (consonants[ch]) {
        const base = consonants[ch];
        if (matras[nextCh]) {
          out += base + matras[nextCh];
          i += 2;
        } else if (nextCh === "्") {
          out += base;
          i += 2;
        } else if (nextCh === "ं" || nextCh === "ँ") {
          out += base + "an";
          i += 2;
        } else if (nextCh === "ः") {
          out += base + "ah";
          i += 2;
        } else {
          // Word-final consonants in Hindi drop the inherent 'a'
          const afterConsonant = text[i + 1];
          const isWordEnd = !afterConsonant || /\s|[.,!?]/.test(afterConsonant);
          out += base + (isWordEnd ? "" : "a");
          i++;
        }
      } else if (matras[ch]) {
        out += matras[ch];
        i++;
      } else if (ch === "ं" || ch === "ँ") {
        out += "n";
        i++;
      } else if (ch === "ः") {
        out += "h";
        i++;
      } else if (ch === "्") {
        i++;
      } else {
        out += ch;
        i++;
      }
    }

    return out
      .replace(/\bse\b/gi, "se")
      .replace(/\bko\b/gi, "ko")
      .replace(/\btak\b/gi, "tak")
      .replace(/\bke\s+liye\b/gi, "ke liye")
      .replace(/\bnavanbar\b/gi, "November")
      .replace(/\bdisanbar\b/gi, "December")
      .replace(/\bjanavaree\b/gi, "January")
      .replace(/\bfaravaree\b/gi, "February")
      .replace(/\bmarch\b/gi, "March")
      .replace(/\baprail\b/gi, "April")
      .replace(/\bmaee\b/gi, "May")
      .replace(/\bjoon\b/gi, "June")
      .replace(/\bjulaaee\b/gi, "July")
      .replace(/\bagast\b/gi, "August")
      .replace(/\bsitanbar\b/gi, "September")
      .replace(/\baktoobar\b/gi, "October")
      .replace(/\bsleepar|slepar|slipar\b/gi, "sleeper")
      .replace(/\s+/g, " ")
      .trim();
  };

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setInputError("Voice not supported on this browser.");
      console.warn("[Speech-to-Text] SpeechRecognition API not supported on this browser.");
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

    recognition.onstart = () => {
      console.log("%c🎙️ [Speech-to-Text] Microphone active. Listening for Hindi/English speech...", "color: #E8A33D; font-weight: bold;");
      setListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const rawTranscript = (e.results?.[0]?.[0]?.transcript ?? "") as string;
      const confidence = e.results?.[0]?.[0]?.confidence;

      // Transliterate any Devanagari to Roman Hinglish
      const hinglish = devanagariToHinglish(rawTranscript);

      console.group("%c🎙️ [Speech-to-Text] Voice Input Captured", "color: #E8A33D; font-size: 13px; font-weight: bold;");
      console.log("%cRaw Speech-to-Text (STT) Transcript:", "color: #f59e0b; font-weight: bold;", rawTranscript);
      console.log("%cConverted Hinglish Prompt:", "color: #10b981; font-weight: bold;", hinglish);
      if (confidence !== undefined) {
        console.log("Speech Confidence Score:", `${Math.round(confidence * 100)}%`);
      }
      console.log("%c🚀 Sending Prompt to Parser:", "color: #38bdf8; font-weight: bold;", hinglish);
      console.groupEnd();

      setInput(hinglish);
      setListening(false);
      void handleSearch(hinglish);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      console.error("%c[Speech-to-Text] ⚠️ Recognition Error:", "color: #ef4444; font-weight: bold;", e?.error || e);
      setInputError("Voice recognition error: " + (e?.error ?? "Please type instead."));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
