"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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
  Zap,
  Route,
  CheckCircle2,
} from "lucide-react";
import { parseIntent } from "@/lib/parser";
import { useApp } from "@/lib/context";
import FaqSection from "@/components/FaqSection";

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
    <div className="flex items-center my-6">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E8A33D]/30 to-[#E8A33D]/60" />
      <div className="flex items-center gap-1.5 px-3">
        <Sparkles className="h-2.5 w-2.5 text-[#E8A33D] animate-pulse" />
        <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#E8A33D] uppercase">
          {title}
        </span>
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E8A33D]/30 to-[#E8A33D]/60" />
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
  const [voiceLang, setVoiceLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [showSessionNotice, setShowSessionNotice] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  // ── Session reset notice detection from URL ───────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("notice") === "session-reset") {
      setShowSessionNotice(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("notice");
      window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
    }
  }, []);

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
        if (
          intent.parseError ||
          !intent.origin ||
          !intent.destination ||
          intent.origin.toLowerCase() === intent.destination.toLowerCase()
        ) {
          const isSameStation = Boolean(
            intent.origin &&
            intent.destination &&
            intent.origin.toLowerCase() === intent.destination.toLowerCase()
          );

          if (isSameStation) {
            console.warn(`%c⚠️ [Search Guard] Same station detected: ${intent.origin} -> ${intent.destination}`, "color: #f59e0b; font-weight: bold;");
            setInputError("You cannot keep the origin and the destination at the same location.");
            return;
          }

          const reason = !intent.origin && !intent.destination
            ? "Neither origin nor destination could be identified"
            : !intent.origin
            ? "Origin station missing/unrecognized"
            : "Destination station missing/unrecognized";

          console.warn(`%c⚠️ [Search Guard] Search not dispatched: ${reason}`, "color: #f59e0b; font-weight: bold;");
          setInputError("Could not identify both stations. Please specify both origin and destination (e.g. 'Goa to Jhansi').");
          return;
        }
        setParsedIntent(intent);
        router.push("/results");
      } catch (err) {
        console.error("%c❌ [Search Error]", "color: #ef4444; font-weight: bold;", err);
        setInputError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [input, router, setParsedIntent]
  );

  // ── Devanagari → Hinglish transliteration ────────────────────────────────
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
      "अं": "an", "अः": "ah", "ऑ": "o", "ऍ": "e"
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
      
      // Check nukta combinations
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
      .replace(/\baaee\b/gi, "I")
      .replace(/\bvant\b/gi, "want")
      .replace(/\btu\b/gi, "to")
      .replace(/\bphrom\b/gi, "from")
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
    // Default to en-IN for crystal-clear English + Indian accent/city recognition
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log(`%c🎙️ [Speech-to-Text] Microphone active. Listening in [${voiceLang}] mode...`, "color: #E8A33D; font-weight: bold;");
      setListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const rawTranscript = (e.results?.[0]?.[0]?.transcript ?? "") as string;
      const confidence = e.results?.[0]?.[0]?.confidence;

      // Only transliterate if the speech output contains Devanagari script characters
      const hasDevanagari = /[\u0900-\u097F]/.test(rawTranscript);
      const cleanPrompt = hasDevanagari ? devanagariToHinglish(rawTranscript) : rawTranscript.trim();

      console.group("%c🎙️ [Speech-to-Text] Voice Input Captured", "color: #E8A33D; font-size: 13px; font-weight: bold;");
      console.log("%cLanguage Mode:", "color: #a855f7; font-weight: bold;", voiceLang);
      console.log("%cRaw Speech-to-Text (STT) Transcript:", "color: #f59e0b; font-weight: bold;", rawTranscript);
      console.log("%cProcessed Prompt:", "color: #10b981; font-weight: bold;", cleanPrompt);
      if (confidence !== undefined) {
        console.log("Speech Confidence Score:", `${Math.round(confidence * 100)}%`);
      }
      console.log("%c🚀 Sending Prompt to Parser:", "color: #38bdf8; font-weight: bold;", cleanPrompt);
      console.groupEnd();

      setInput(cleanPrompt);
      setListening(false);
      void handleSearch(cleanPrompt);
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
      className="relative flex min-h-screen flex-col px-5 sm:px-6 pb-32 pt-5 lg:pt-8 bg-transparent w-full"
    >
      {/* ── Responsive Wrapper: Centered mobile max-w-[480px], expanding to max-w-6xl 2-column on desktop ── */}
      <div className="w-full max-w-[480px] lg:max-w-6xl mx-auto">
        
        {/* Mobile top pill (hidden on md+ where TopNav exists) */}
        <div className="flex md:hidden items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <TrainFront className="h-4 w-4 text-[#E8A33D] drop-shadow-[0_0_8px_rgba(232,163,61,0.6)]" />
            <span className="font-mono text-xs tracking-widest text-[#E8A33D] uppercase font-bold">
              INDIAN RAIL ROUTES
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/tickets")}
            aria-label="Menu"
            className="h-9 w-9 rounded-full border border-[#E8A33D]/70 shadow-[0_0_10px_rgba(232,163,61,0.3)] flex items-center justify-center bg-transparent hover:bg-[#0A0A0A] transition-all duration-200"
          >
            <Menu className="h-4 w-4 text-[#E8A33D]" />
          </button>
        </div>

        {/* ── Main Layout: Single column on mobile/tablet, 2-column grid at lg: ── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          
          {/* ── Left Column (lg:col-span-5): Branding & 3-Step Explainer ─────────── */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <header className="mt-1">
              <h1 className="font-serif text-[46px] sm:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_0_24px_rgba(232,163,61,0.35)]">
                घर वापसी
              </h1>
              <p className="mt-5 font-serif text-[27px] sm:text-[32px] font-bold text-[#DFCEAF] leading-[1.25] tracking-tight">
                Getting you home — even when the direct train won&apos;t
              </p>
              <p className="mt-3 text-xs lg:text-sm text-slate-400/90 leading-relaxed hidden lg:block">
                Stuck on a train waitlist? We look beyond the direct queue to discover confirmed split-ticket quotas and alternate station connections.
              </p>
            </header>

            {/* ── Desktop-Only "How it works" 3-step mini explainer ────────── */}
            <div className="hidden lg:flex flex-col gap-4 mt-8 pt-6 border-t border-white/10">
              <p className="text-xs font-mono font-bold tracking-[0.14em] text-[#E8A33D] uppercase flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
                How the Optimizer Works
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#080808]/80 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/10">
                    <Mic className="h-4 w-4 text-[#E8A33D]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">1. Speak or type naturally</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Enter in Hindi, English, or Hinglish via voice or text.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#080808]/80 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3F8F5F]/40 bg-[#3F8F5F]/10">
                    <Route className="h-4 w-4 text-[#3F8F5F]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">2. Multi-quota split search</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Explores intermediate PRS quotas, layover timing, and adjacent junctions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#080808]/80 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#818CF8]/40 bg-[#818CF8]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#818CF8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">3. Guaranteed confirmed booking</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Book confirmed split tickets across 2 PNRs with unified tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (lg:col-span-7): Intent Box & Quick Start Chips ───── */}
          <div className="lg:col-span-7 mt-2 lg:mt-0 lg:max-w-[560px]">
            {/* Non-alarming session reset banner */}
            <AnimatePresence>
              {showSessionNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 rounded-xl border border-[#E8A33D]/50 bg-[#E8A33D]/10 p-3.5 flex items-start justify-between gap-3 text-white shadow-[0_0_12px_rgba(232,163,61,0.2)]"
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#E8A33D] shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      Your previous search was reset — this prototype doesn&apos;t save progress across a page reload. Search again below.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSessionNotice(false)}
                    className="text-slate-400 hover:text-white p-0.5 text-xs font-mono"
                    aria-label="Dismiss notice"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* "Ask Anything" Search Input Area */}
            <section className="mt-1">
              <GlowingSectionDivider title="ASK ANYTHING" />
              <div className="bg-[#050505] rounded-[20px] p-5 border border-[#E8A33D]/70 shadow-[0_0_16px_rgba(232,163,61,0.25)] relative flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:shadow-[0_0_22px_rgba(232,163,61,0.45)]">
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
                  className="bg-transparent text-[15px] text-white placeholder:text-slate-500 outline-none w-full pr-14 resize-none leading-relaxed h-[75px]"
                />
                <div className="flex items-center justify-between pt-3.5 border-t border-white/5 mt-2">
                  {/* Language Mode Toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-slate-500 mr-1 hidden sm:inline">
                      SPEECH:
                    </span>
                    <div className="flex items-center rounded-lg bg-[#111111] p-0.5 border border-white/10 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setVoiceLang("en-IN")}
                        className={`px-2 py-1 rounded-md transition-all ${
                          voiceLang === "en-IN"
                            ? "bg-[#E8A33D] text-black font-bold shadow-[0_0_8px_rgba(232,163,61,0.5)]"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🇮🇳 EN (India)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceLang("hi-IN")}
                        className={`px-2 py-1 rounded-md transition-all ${
                          voiceLang === "hi-IN"
                            ? "bg-[#E8A33D] text-black font-bold shadow-[0_0_8px_rgba(232,163,61,0.5)]"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        हिंदी
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={listening ? "Stop voice" : "Start voice"}
                    className={`h-11 w-11 rounded-full border border-[#E8A33D]/80 shadow-[0_0_12px_rgba(232,163,61,0.35)] flex items-center justify-center transition-all ${
                      listening
                        ? "bg-[#C0432E] text-white animate-pulse"
                        : "bg-black text-[#E8A33D] hover:bg-[#121212] hover:scale-105"
                    }`}
                  >
                    {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {listening && (
                <p className="mt-2.5 text-xs text-[#E8A33D] animate-pulse font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E8A33D] animate-ping" />
                  {voiceLang === "en-IN"
                    ? "LISTENING IN ENGLISH (INDIA) — Speak now..."
                    : "LISTENING IN HINDI — बोलिए..."}
                </p>
              )}
              {inputError && <p className="mt-2.5 text-xs text-[#E8A33D] font-mono">{inputError}</p>}

              {/* Search CTA Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={loading || !input.trim()}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#E8A33D] py-4 text-[15px] font-extrabold text-black shadow-[0_0_20px_rgba(232,163,61,0.45)] transition-all hover:bg-[#F0B250] hover:shadow-[0_0_26px_rgba(232,163,61,0.65)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
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
                <p className="mt-3 text-center text-[11px] text-slate-500 font-mono tracking-wide">
                  We look beyond direct waitlists to find the best route.
                </p>
              </div>
            </section>

            {/* ── Quick Start 2x3 Grid (Below Search) ────────────────────────── */}
            <section className="mt-4">
              <GlowingSectionDivider title="QUICK START — TAP TO TRY" />
              <div className="grid grid-cols-2 gap-3.5 my-1">
                {EXAMPLE_CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => void handleSearch(chip.input)}
                      disabled={loading}
                      className="bg-[#050505] hover:bg-[#0A0A0A] rounded-[18px] p-4 border border-[#E8A33D]/65 shadow-[0_0_12px_rgba(232,163,61,0.2)] hover:border-[#E8A33D] hover:shadow-[0_0_18px_rgba(232,163,61,0.45),inset_0_0_10px_rgba(232,163,61,0.12)] flex flex-col justify-between cursor-pointer text-left transition-all duration-200 min-h-[96px] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className="h-4 w-4 text-[#E8A33D] drop-shadow-[0_0_6px_rgba(232,163,61,0.5)]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]/40" />
                      </div>
                      <div>
                        <p className="font-bold text-[13px] text-white leading-tight mt-2.5">
                          {chip.label}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
                          {chip.sublabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Frequently Asked Questions (Trust & Legality) ─────────────── */}
            <FaqSection />
          </div>

        </div>
      </div>

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
