"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, BellOff, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
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
  const { state } = useApp();
  const { currentBooking } = state;
  const [alertOn, setAlertOn] = useState(false);

  if (!currentBooking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 bg-black text-white">
        <p className="text-slate-400 mb-4 font-mono text-sm">No active journey found.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_14px_rgba(232,163,61,0.45)]">← Home</button>
      </div>
    );
  }

  const isSplit = currentBooking.isSplit;
  const isTwoDifferentTrains = Boolean(
    isSplit &&
    currentBooking.leg1 &&
    currentBooking.leg2 &&
    currentBooking.leg1.trainNumber !== currentBooking.leg2.trainNumber
  );

  const transferStation = currentBooking.leg1?.to ?? "Intermediate Junction";
  const layoverDuration = (currentBooking.leg1 && currentBooking.leg2)
    ? calculateLayover(currentBooking.leg1.arrival, currentBooking.leg2.departure)
    : null;

  const timelineSteps = [
    { label: "Booked", sublabel: `PNR: ${currentBooking.pnr}`, status: "done", icon: CheckCircle2 },
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

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-7 bg-black text-white">
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

      <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">JOURNEY DASHBOARD</span>
      <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-white">{currentBooking.route}</h1>
      <p className="mt-1 text-sm font-mono text-slate-400">{currentBooking.date} · {currentBooking.class}</p>

      {/* Transfer Connection Warning / Info Banner */}
      {isTwoDifferentTrains && currentBooking.leg1 && currentBooking.leg2 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/60 p-4 shadow-[0_0_12px_rgba(232,163,61,0.25)]">
          <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#E8A33D]">
              Connecting Transfer at {transferStation} {layoverDuration ? `(${layoverDuration} layover)` : ""}
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              De-boarding &amp; platform change required. Arrive <strong className="text-white">{currentBooking.leg1.arrival}</strong> on {currentBooking.leg1.trainName}, board <strong className="text-white">{currentBooking.leg2.departure}</strong> on {currentBooking.leg2.trainName}.
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
      {isSplit && currentBooking.leg1 && currentBooking.leg2 && (
        <section className="mt-6">
          <p className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D] mb-3">UNIFIED ITINERARY</p>
          <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_14px_rgba(232,163,61,0.25)] overflow-hidden">
            {[currentBooking.leg1, currentBooking.leg2].map((leg, i) => (
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

      <button onClick={() => router.push("/tickets")}
        className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#E8A33D]/60 bg-[#080808] text-sm font-bold text-white hover:bg-[#121212] transition shadow-[0_0_12px_rgba(232,163,61,0.25)]">
        View all my tickets
      </button>
      <button onClick={() => router.push("/")} className="mt-3 w-full py-2 text-sm font-mono text-slate-400 hover:text-white transition">
        ← Book another journey
      </button>
    </motion.main>
  );
}
