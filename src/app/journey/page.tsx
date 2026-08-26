"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, BellOff, AlertTriangle, CheckCircle2, Clock, Ticket, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context";

function calculateLayover(arr: string, dep: string): string | null {
  const parseMins = (t: string) => {
    const clean = t.replace(/\+\d+$/, "").trim();
    const [h, m] = clean.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? null : h * 60 + m;
  };
  const mArr = parseMins(arr);
  const mDep = parseMins(dep);
  if (mArr !== null && mDep !== null) {
    let diff = mDep - mArr;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }
  return null;
}

export default function JourneyPage() {
  const router = useRouter();
  const { state, setCurrentBooking } = useApp();
  const { currentBooking, loggedInAccount } = state;
  const [alertOn, setAlertOn] = useState(false);

  const activeBooking = currentBooking ?? loggedInAccount?.tickets[0] ?? null;

  useEffect(() => {
    if (!activeBooking) {
      router.replace("/?notice=session-reset");
    }
  }, [activeBooking, router]);

  if (!activeBooking) {
    return null;
  }

  const isSplit = activeBooking.isSplit;
  const isTwoDifferentTrains = Boolean(
    isSplit &&
    activeBooking.leg1 &&
    activeBooking.leg2 &&
    activeBooking.leg1.trainNumber !== activeBooking.leg2.trainNumber
  );

  const transferStation = activeBooking.leg1?.to ?? "Intermediate Junction";
  const layoverDuration = (activeBooking.leg1 && activeBooking.leg2)
    ? calculateLayover(activeBooking.leg1.arrival, activeBooking.leg2.departure)
    : null;

  const timelineSteps = [
    { label: "Booked", sublabel: `PNR: ${activeBooking.pnr}`, status: "done", icon: CheckCircle2 },
    { label: "Chart Preparation", sublabel: "Approx 4 hrs before departure", status: "pending", icon: Clock },
    {
      label: "Final Status",
      sublabel: isTwoDifferentTrains
        ? `2 connecting trains monitored independently (${transferStation})`
        : isSplit
        ? "Both legs monitored independently"
        : "Direct booking",
      status: "pending",
      icon: CheckCircle2,
    },
  ];

  const allTickets = loggedInAccount?.tickets ?? [];

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-4 lg:pt-8 bg-transparent text-white w-full">
      
      {/* ── Responsive Wrapper: max-w-[480px] on mobile, max-w-6xl 2-column on desktop ── */}
      <div className="w-full max-w-[480px] md:max-w-xl lg:max-w-6xl mx-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
          </button>
          <button onClick={() => setAlertOn((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold font-mono transition border ${
              alertOn
                ? "border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D] shadow-[0_0_10px_rgba(232,163,61,0.4)]"
                : "border-white/10 bg-[#080808] text-slate-400"
            }`}>
            {alertOn ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
            {alertOn ? "PNR Alert ON" : "Set PNR Alert"}
          </button>
        </div>

        {/* ── Desktop 2-Column Grid on lg+, Single Column below lg ── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          
          {/* ── Left Column (lg:col-span-7): Timeline & Itinerary ── */}
          <div className="lg:col-span-7">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">JOURNEY DASHBOARD</span>
            <h1 className="mt-2 font-serif text-2xl lg:text-3xl font-bold leading-tight text-white">{activeBooking.route}</h1>
            <p className="mt-1 text-sm font-mono text-slate-400">{activeBooking.date} · {activeBooking.class}</p>

            {/* Transfer Connection Warning / Info Banner */}
            {isTwoDifferentTrains && activeBooking.leg1 && activeBooking.leg2 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-3 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/60 p-4 shadow-[0_0_12px_rgba(232,163,61,0.25)]">
                <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#E8A33D]">
                    Connecting Transfer at {transferStation} {layoverDuration ? `(${layoverDuration} layover)` : ""}
                  </p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    De-boarding &amp; platform change required. Arrive <strong className="text-white">{activeBooking.leg1.arrival}</strong> on {activeBooking.leg1.trainName}, board <strong className="text-white">{activeBooking.leg2.departure}</strong> on {activeBooking.leg2.trainName}.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Status timeline */}
            <section className="mt-6">
              <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D] mb-4">JOURNEY TIMELINE</p>
              <div className="relative rounded-2xl bg-[#080808] border border-[#E8A33D]/40 p-5 shadow-[0_0_12px_rgba(232,163,61,0.15)]">
                {/* Vertical line */}
                <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-white/10" />
                <div className="space-y-6">
                  {timelineSteps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex items-start gap-4 relative">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full z-10 border ${
                          step.status === "done"
                            ? "border-[#3F8F5F] bg-[#3F8F5F]/20 text-[#3F8F5F] shadow-[0_0_8px_rgba(63,143,95,0.6)]"
                            : "border-white/10 bg-black text-slate-600"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-semibold ${step.status === "done" ? "text-white" : "text-slate-400"}`}>{step.label}</p>
                          <p className="text-xs font-mono text-slate-500 mt-0.5">{step.sublabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Split itinerary */}
            {isSplit && activeBooking.leg1 && activeBooking.leg2 && (
              <section className="mt-6">
                <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D] mb-3">UNIFIED ITINERARY</p>
                <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_14px_rgba(232,163,61,0.25)] overflow-hidden">
                  {[activeBooking.leg1, activeBooking.leg2].map((leg, i) => (
                    <div key={i} className={`p-4 ${i > 0 ? "border-t border-white/10" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded border border-[#E8A33D]/50 bg-[#E8A33D]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[#E8A33D]">LEG {i + 1}</span>
                        <span className="font-mono text-[10px] text-slate-400">{leg.trainNumber} {leg.trainName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold text-white">{leg.departure}</p>
                          <p className="text-[10px] font-mono text-slate-400">{leg.from}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <div className="flex-1 border-t border-dashed border-[#E8A33D]/30" />
                          <span className="text-[10px] text-[#E8A33D]">→</span>
                          <div className="flex-1 border-t border-dashed border-[#E8A33D]/30" />
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold text-white">{leg.arrival}</p>
                          <p className="text-[10px] font-mono text-slate-400">{leg.to}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Layover / Transfer Status Bar */}
                  <div className="border-t border-white/10 bg-[#0E0E0E] px-4 py-3 flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-[#E8A33D] shrink-0" />
                    <span className="text-xs font-mono text-slate-300">
                      {isTwoDifferentTrains
                        ? `${layoverDuration ? `${layoverDuration} transfer layover` : "Transfer"} at ${transferStation} — de-boarding & platform change required`
                        : "Continuous journey — same train, same berth, no de-boarding required"}
                    </span>
                  </div>
                </div>
              </section>
            )}

            <div className="lg:hidden mt-6 space-y-3">
              <button onClick={() => router.push("/tickets")}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#E8A33D]/60 bg-[#080808] text-sm font-bold text-white hover:bg-[#121212] transition shadow-[0_0_12px_rgba(232,163,61,0.25)]">
                View all my tickets
              </button>
              <button onClick={() => router.push("/")} className="w-full py-2 text-sm font-mono text-slate-400 hover:text-white transition">
                ← Book another journey
              </button>
            </div>
          </div>

          {/* ── Right Column (lg:col-span-5): Persistent "My Tickets" Sidebar on Desktop ── */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <div className="rounded-2xl border border-[#E8A33D]/40 bg-[#080808] p-5 shadow-[0_0_16px_rgba(232,163,61,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#E8A33D]" />
                  <span className="text-xs font-mono font-bold tracking-wider text-[#E8A33D] uppercase">
                    My Tickets ({allTickets.length})
                  </span>
                </div>
                <button
                  onClick={() => router.push("/tickets")}
                  className="text-xs font-mono text-[#E8A33D] hover:underline"
                >
                  Manage →
                </button>
              </div>

              {allTickets.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/50 p-4 text-center">
                  <p className="text-xs text-slate-400">Current ticket active above.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {allTickets.map((t) => {
                    const isSelected = t.pnr === activeBooking.pnr;
                    return (
                      <div
                        key={t.pnr}
                        onClick={() => setCurrentBooking(t)}
                        className={`rounded-xl p-3.5 border transition cursor-pointer ${
                          isSelected
                            ? "border-[#E8A33D] bg-[#E8A33D]/10 shadow-[0_0_10px_rgba(232,163,61,0.3)]"
                            : "border-white/10 bg-[#050505] hover:border-[#E8A33D]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold text-[#E8A33D]">{t.pnr}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            t.isSplit ? "bg-[#3F8F5F]/20 text-[#3F8F5F]" : "bg-white/10 text-white"
                          }`}>
                            {t.isSplit ? "SPLIT CONFIRMED" : "CONFIRMED"}
                          </span>
                        </div>
                        <p className="font-serif text-sm font-bold text-white">{t.route}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{t.date} · {t.class}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => router.push("/")}
                className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] text-xs font-bold text-black shadow-[0_0_12px_rgba(232,163,61,0.4)] transition hover:bg-[#F0B250]"
              >
                Book another journey <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.main>
  );
}
