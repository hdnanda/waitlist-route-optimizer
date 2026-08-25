import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mic, ShieldCheck, TrainFront } from "lucide-react";

export function extractRouteIntent(userInput) {
  const text = userInput.trim();
  const match = text.match(/(?:from\s+)?([A-Za-z\s]+?)\s+(?:to|se|towards)\s+([A-Za-z\s]+?)(?:\s+(?:on|next|for|ko|during)\s+|$)/i);

  if (match && match[1] && match[2]) {
    const origin = match[1].trim().replace(/^(get|need|book|send|tickets?|from|maa\s+ko)\s+/i, "");
    const dest = match[2].trim().replace(/\s+(bhejna|jana|chahiye|tickets?|on|next|ke\s+liye).*$/i, "");
    return {
      origin: origin.charAt(0).toUpperCase() + origin.slice(1),
      destination: dest.charAt(0).toUpperCase() + dest.slice(1)
    };
  }
  return { origin: "New Delhi (NDLS)", destination: "Patna Jn (PNBE)" };
}

export function generateConfidenceLadder(origin, destination) {
  const isDefault = origin.includes("Delhi") || origin.includes("New Delhi");
  const hub = isDefault ? "Deen Dayal Upadhyaya Jn" : "Kanpur Central";
  return [
    { id: 1, type: "DIRECT", badge: "DIRECT · LOW CHANCE", badgeBg: "bg-[#C0432E]", badgeText: "text-white", route: `${origin} → ${destination}`, meta: "12310 Rajdhani Exp | 3A", statusPill: "WL 47", statusBg: "bg-[#C0432E]/20 text-[#C0432E]", prob: "~14% by charting", why: "Historical charting rarely clears past WL 30 during festival week.", btn: "Keep on hold" },
    { id: 2, type: "SPLIT", badge: "BEST · SPLIT TICKET", badgeBg: "bg-[#3F8F5F]", badgeText: "text-white", route: `${origin} → ${hub} → ${destination}`, meta: "12310 Rajdhani Exp (same train, same seat)", statusPill: "CONFIRMED", statusBg: "bg-[#3F8F5F]/20 text-[#3F8F5F]", prob: "Both legs confirmed", why: "Same physical train, same berth. Booked as two tickets using intermediate quota. No de-boarding.", btn: "Book both legs — 1 tap", isHero: true },
    { id: 3, type: "ALT", badge: "ALTERNATE STATION", badgeBg: "bg-[#E8A33D]", badgeText: "text-[#1C2B4A]", route: `${origin} → ${destination} Cantt`, meta: "12802 Purushottam Exp", statusPill: "CONFIRMED", statusBg: "bg-[#3F8F5F]/20 text-[#3F8F5F]", prob: "Confirmed now", why: "Train terminates a stop early. Fully different, less-booked train.", btn: "Book to alternate — 1 tap" }
  ];
}

const quickTests = ["Delhi to Patna, Nov 6", "Mumbai to Goa for tomorrow"];
const reasoningLines = [
  (data) => `→ parsing intent: origin=${data?.origin}, dest=${data?.destination}...`,
  () => "→ checking direct route... WL 47 found.",
  () => "→ scanning intermediate-station quotas...",
  () => "→ generating optimized split-routes..."
];

function TicketCard({ option, onCheckout }) {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={`mt-4 overflow-hidden rounded-xl bg-[#F7EFE0] text-[#1C2B4A] shadow-lg ${option.isHero ? "ring-2 ring-[#E8A33D]" : ""}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${option.badgeBg} ${option.badgeText}`}>{option.badge}</span>
          {option.isHero && <ShieldCheck className="h-5 w-5 shrink-0 text-[#3F8F5F]" aria-label="Recommended option" />}
        </div>
        <h2 className="mt-4 font-serif text-2xl font-semibold leading-7">{option.route}</h2>
        <p className="mt-2 font-mono text-[11px] leading-4 text-[#1C2B4A]/65">{option.meta}</p>
        <div className="mt-4 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${option.statusBg}`}>{option.statusPill}</span><span className="text-xs font-semibold text-[#1C2B4A]/70">{option.prob}</span></div>
      </div>
      <div className="relative h-0 w-full border-t-2 border-dashed border-[#94A3B8]"><div className="absolute -top-2.5 -left-3 h-5 w-5 rounded-full bg-[#151B2E]" /><div className="absolute -top-2.5 -right-3 h-5 w-5 rounded-full bg-[#151B2E]" /></div>
      <div className="bg-[#EDE3CE] p-4">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[#1C2B4A]/55">WHY THIS OPTION</p>
        <p className="mt-2 text-sm leading-5 text-[#1C2B4A]/85">{option.why}</p>
        <button type="button" onClick={option.type === "SPLIT" ? onCheckout : undefined} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C2B4A] py-3 text-sm font-bold text-[#F7EFE0] transition hover:bg-[#273b64] active:scale-[0.99]">{option.btn} <ArrowRight className="h-4 w-4" /></button>
      </div>
    </motion.article>
  );
}

export default function App() {
  const [appState, setAppState] = useState("INTAKE");
  const [input, setInput] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [inputError, setInputError] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (appState !== "REASONING") return undefined;
    const timer = window.setTimeout(() => setAppState("RESULTS"), 2500);
    return () => window.clearTimeout(timer);
  }, [appState]);

  const handleSearch = () => {
    if (!input.trim()) { setInputError("Enter a journey request to find routes."); return; }
    setInputError("");
    setRouteData(extractRouteIntent(input));
    setAppState("REASONING");
  };
  const resetApp = () => { setInput(""); setRouteData(null); setOtp(""); setInputError(""); setAppState("INTAKE"); };
  const ladder = routeData ? generateConfidenceLadder(routeData.origin, routeData.destination) : [];

  return (
    <div className="max-w-[390px] mx-auto min-h-screen relative overflow-hidden bg-[#151B2E] text-[#F3EDE0] font-sans">
      <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#E8A33D]/10 blur-3xl" /><div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#3F8F5F]/10 blur-3xl" />
      <AnimatePresence mode="wait">
        {appState === "INTAKE" && <motion.main key="intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-screen flex-col px-5 pb-7 pt-7">
          <span className="w-fit rounded-full border border-[#E8A33D]/35 bg-[#E8A33D]/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-[#E8A33D]">• PROTOTYPE · MOCK DATA</span>
          <header className="mt-6"><div className="flex items-center gap-2 text-[#E8A33D]"><TrainFront className="h-5 w-5" /><span className="font-mono text-[11px] tracking-wider">INDIAN RAIL ROUTES</span></div><h1 className="mt-3 font-serif text-3xl font-semibold">घर वापसी</h1><p className="mt-1 text-sm text-[#94A3B8]">Waitlist Route Optimizer</p></header>
          <section className="mt-10"><label htmlFor="route-input" className="text-sm font-semibold">Tell us the journey</label><div className="relative mt-3"><textarea id="route-input" value={input} onChange={(event) => { setInput(event.target.value); setInputError(""); }} placeholder="e.g. Maa ko Chhath ke liye Patna bhejna hai, 6 November ko" className="h-36 w-full resize-none rounded-xl border border-white/10 bg-[#1F2740] p-4 pr-12 text-sm leading-6 text-[#F3EDE0] placeholder:text-[#94A3B8] focus:border-[#E8A33D] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/20" /><Mic className="absolute right-4 top-4 h-5 w-5 text-[#94A3B8]" aria-hidden="true" /></div>{inputError && <p className="mt-2 text-xs text-[#E8A33D]">{inputError}</p>}<div className="mt-3 flex flex-wrap gap-2">{quickTests.map((test) => <button key={test} type="button" onClick={() => { setInput(test); setInputError(""); }} className="rounded-full border border-white/10 bg-[#1F2740] px-3 py-1.5 text-xs text-[#F3EDE0] transition hover:border-[#E8A33D]/70">{test}</button>)}</div></section>
          <div className="mt-auto pt-8"><button type="button" onClick={handleSearch} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-4 text-sm font-bold text-[#1C2B4A] shadow-lg shadow-black/20 transition hover:bg-[#f0b250] active:scale-[0.99]">Find confirmed journey <ArrowRight className="h-4 w-4" /></button><p className="mt-3 text-center text-[11px] text-[#94A3B8]">We look beyond direct waitlists to find the best route.</p></div>
        </motion.main>}
        {appState === "REASONING" && <motion.main key="reasoning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative min-h-screen px-5 pt-8"><span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">ROUTE ENGINE / LIVE SCAN</span><h1 className="mt-3 font-serif text-3xl font-semibold">Looking beyond the queue.</h1><p className="mt-2 text-sm text-[#94A3B8]">We’re matching quotas, stations and train continuity.</p><div className="m-4 mt-9 rounded-r-xl border-l-2 border-[#E8A33D] bg-black/50 p-4">{reasoningLines.map((line, index) => <motion.p key={index} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.48, duration: 0.3 }} className="mb-3 font-mono text-xs leading-5 text-[#94A3B8] last:mb-0">{line(routeData)}</motion.p>)}</div></motion.main>}
        {appState === "RESULTS" && routeData && <motion.main key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative min-h-screen px-5 pb-8 pt-7"><span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">3 ROUTES FOUND</span><h1 className="mt-3 font-serif text-2xl font-semibold leading-8">Direct train is WL 47. Here&apos;s the full ladder:</h1><p className="mt-2 text-sm text-[#94A3B8]">{routeData.origin} → {routeData.destination}</p><section className="mt-5">{ladder.map((option) => <TicketCard key={option.id} option={option} onCheckout={() => setAppState("CHECKOUT")} />)}</section><button type="button" onClick={resetApp} className="mt-5 w-full py-3 text-sm font-semibold text-[#94A3B8] hover:text-[#F3EDE0]">← Start a new search</button></motion.main>}
        {appState === "SUCCESS" && <motion.main key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3F8F5F]/20"><CheckCircle2 className="h-11 w-11 text-[#3F8F5F]" /></div><p className="mt-7 font-mono text-[11px] font-bold tracking-[0.16em] text-[#3F8F5F]">BOOKING CONFIRMED</p><h1 className="mt-3 font-serif text-3xl font-semibold">You&apos;re going home.</h1><p className="mt-3 text-sm text-[#94A3B8]">Your split-ticket journey is reserved.</p><div className="mt-8 w-full rounded-xl bg-[#1F2740] p-5"><p className="text-[10px] font-bold tracking-widest text-[#94A3B8]">MOCK PNR</p><p className="mt-2 font-mono text-xl font-bold tracking-wide text-[#F3EDE0]">MOCK-4827193056</p></div><button type="button" onClick={resetApp} className="mt-8 w-full rounded-xl bg-[#E8A33D] py-4 text-sm font-bold text-[#1C2B4A]">Done</button></motion.main>}
      </AnimatePresence>
      <AnimatePresence>{appState === "CHECKOUT" && <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="absolute bottom-0 z-50 w-full rounded-t-2xl bg-[#1F2740] p-6 shadow-2xl"><div className="mx-auto h-1.5 w-11 rounded-full bg-white/20" /><p className="mt-5 font-mono text-[10px] font-bold tracking-[0.14em] text-[#E8A33D]">SECURE CHECKOUT · MOCK</p><h2 className="mt-2 font-serif text-2xl font-semibold">Confirm your seats</h2><div className="mt-5 rounded-xl bg-black/20 p-4"><p className="text-sm text-[#94A3B8]">Journey</p><p className="mt-1 font-semibold">{routeData?.origin} → {routeData?.destination}</p><div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-sm text-[#94A3B8]">Total fare</span><span className="font-mono text-lg font-bold">₹2,145</span></div></div><label htmlFor="otp" className="mt-5 block text-xs font-bold text-[#94A3B8]">MOCK OTP</label><input id="otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter 6-digit OTP" className="mt-2 w-full rounded-lg border border-white/10 bg-[#151B2E] px-4 py-3 font-mono text-sm text-[#F3EDE0] placeholder:text-[#94A3B8] focus:border-[#E8A33D] focus:outline-none" /><button type="button" onClick={() => setAppState("SUCCESS")} className="mt-4 w-full rounded-xl bg-[#E8A33D] py-4 text-sm font-bold text-[#1C2B4A]">Pay & Confirm</button><button type="button" onClick={() => setAppState("RESULTS")} className="mt-3 w-full py-2 text-sm text-[#94A3B8]">Back to routes</button></motion.div>}</AnimatePresence>
    </div>
  );
}
