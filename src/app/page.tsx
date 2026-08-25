"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrainFront, Mic, MicOff, ArrowRight, Loader2 } from "lucide-react";
import { parseIntent } from "@/lib/parser";
import { useApp } from "@/lib/context";

const EXAMPLE_CHIPS = [
  { label: "Delhi → Patna", sublabel: "Nov 6, 3A (WL scenario)", input: "Delhi to Patna on 6 November, 3A class" },
  { label: "Mumbai → Varanasi", sublabel: "SL direct confirmed", input: "Mumbai to Varanasi sleeper class" },
  { label: "Maa ko Patna bhejna", sublabel: "Hinglish · Chhath special", input: "Maa ko Chhath ke liye Patna bhejna hai, Delhi se, 6 November ko" },
  { label: "Bengaluru → Lucknow", sublabel: "2A waitlisted", input: "Bangalore to Lucknow 2A" },
  { label: "Kolkata → Delhi", sublabel: "Split ticket available", input: "Kolkata to Delhi 3A" },
  { label: "Ahmedabad → Gorakhpur", sublabel: "SL direct confirmed", input: "Ahmedabad to Gorakhpur sleeper" },
];

export default function HomePage() {
  const router = useRouter();
  const { setParsedIntent } = useApp();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const handleSearch = useCallback(async (query?: string) => {
    const text = query ?? input;
    if (!text.trim()) { setInputError("Enter or speak a journey request."); return; }
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
  }, [input, router, setParsedIntent]);

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setInputError("Voice not supported on this browser."); return; }
    if (listening) { (recognitionRef.current as { stop: () => void } | null)?.stop(); setListening(false); return; }
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
    recognition.onerror = () => { setInputError("Voice failed. Please type instead."); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex min-h-screen flex-col px-5 pb-8 pt-8">
      <span className="w-fit rounded-full border border-[#E8A33D]/35 bg-[#E8A33D]/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-[#E8A33D]">
        • PROTOTYPE · MOCK DATA
      </span>
      <header className="mt-6">
        <div className="flex items-center gap-2 text-[#E8A33D]">
          <TrainFront className="h-5 w-5" />
          <span className="font-mono text-[11px] tracking-wider">INDIAN RAIL ROUTES</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">घर वापसी</h1>
        <p className="mt-1 text-sm text-[#B9BDD1]">Waitlist Route Optimizer</p>
        <p className="mt-1 text-xs text-[#B9BDD1]/60">बुक करें जब टिकट मिले — हम रास्ता निकालते हैं</p>
      </header>

      <section className="mt-10">
        <p className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-3">QUICK START — TAP TO TRY</p>
        <div className="grid grid-cols-2 gap-2.5">
          {EXAMPLE_CHIPS.map((chip) => (
            <button key={chip.label} type="button" onClick={() => void handleSearch(chip.input)} disabled={loading}
              className="flex flex-col items-start rounded-xl border border-[#E8A33D]/30 bg-[#1F2740] p-3.5 text-left transition hover:border-[#E8A33D]/70 hover:bg-[#2A3454] active:scale-[0.97] min-h-[72px]">
              <span className="font-semibold text-sm text-[#F3EDE0] leading-tight">{chip.label}</span>
              <span className="mt-1 text-[10px] text-[#B9BDD1]/70 leading-tight">{chip.sublabel}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-3">OR ASK ANYTHING</p>
        <div className="relative">
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setInputError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSearch(); } }}
            placeholder="e.g. Maa ko Chhath ke liye Patna bhejna hai, 6 November ko"
            className="h-28 w-full resize-none rounded-xl border border-white/10 bg-[#1F2740] p-4 pr-14 text-sm leading-6 text-[#F3EDE0] placeholder:text-[#94A3B8]/60 focus:border-[#E8A33D] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/20" />
          <button type="button" onClick={toggleVoice} aria-label={listening ? "Stop voice" : "Start voice"}
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl transition ${listening ? "bg-[#C0432E] text-white animate-pulse" : "bg-[#2A3454] text-[#B9BDD1] hover:text-[#E8A33D]"}`}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>
        {listening && <p className="mt-2 text-xs text-[#C0432E] animate-pulse font-mono">● LISTENING — बोलिए...</p>}
        {inputError && <p className="mt-2 text-xs text-[#E8A33D]">{inputError}</p>}
      </section>

      <div className="mt-auto pt-8">
        <button type="button" onClick={() => void handleSearch()} disabled={loading || !input.trim()}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-4 text-sm font-bold text-[#1C2B4A] shadow-lg transition hover:bg-[#f0b250] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing...</> : <>Find confirmed journey <ArrowRight className="h-4 w-4" /></>}
        </button>
        <p className="mt-3 text-center text-[11px] text-[#B9BDD1]/60">We look beyond direct waitlists to find the best route.</p>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#151B2E]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#E8A33D]" />
              <p className="font-mono text-sm text-[#B9BDD1]">Parsing your request...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
