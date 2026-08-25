"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, BellOff, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useApp } from "@/lib/context";

export default function JourneyPage() {
  const router = useRouter();
  const { state } = useApp();
  const { currentBooking } = state;
  const [alertOn, setAlertOn] = useState(false);

  if (!currentBooking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="text-[#B9BDD1] mb-4">No active journey.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#1C2B4A]">← Home</button>
      </div>
    );
  }

  const isSplit = currentBooking.isSplit;
  const hasShortLayover = isSplit && currentBooking.leg1 && currentBooking.leg2; // mock: always 0 or 52 min
  // For demo, mark short layover if the split station layover is stored in route name
  const layoverWarn = isSplit && currentBooking.route.includes("Kalyan"); // Kalyan split has 52 min

  const timelineSteps = [
    { label: "Booked", sublabel: `PNR: ${currentBooking.pnr}`, status: "done", icon: CheckCircle2 },
    { label: "Chart Preparation", sublabel: "Approx 4 hrs before departure", status: "pending", icon: Clock },
    { label: "Final Status", sublabel: isSplit ? "Both legs monitored independently" : "Direct booking", status: "pending", icon: CheckCircle2 },
  ];

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-8 pt-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#B9BDD1]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={() => setAlertOn((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${alertOn ? "bg-[#E8A33D]/20 text-[#E8A33D]" : "bg-[#1F2740] text-[#B9BDD1]"}`}>
          {alertOn ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          {alertOn ? "PNR Alert ON" : "Set PNR Alert"}
        </button>
      </div>

      <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">JOURNEY DASHBOARD</span>
      <h1 className="mt-2 font-serif text-2xl font-semibold leading-tight">{currentBooking.route}</h1>
      <p className="mt-1 text-sm text-[#B9BDD1]">{currentBooking.date} · {currentBooking.class}</p>

      {/* Short layover warning */}
      {layoverWarn && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/30 p-4">
          <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#E8A33D]">Short layover at Kalyan Jn</p>
            <p className="text-xs text-[#B9BDD1] mt-1">52-minute connection — within safe range. Recommended: keep hand luggage only for easy platform transfer.</p>
          </div>
        </motion.div>
      )}

      {/* Status timeline */}
      <section className="mt-6">
        <p className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-4">JOURNEY TIMELINE</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-white/10" />
          <div className="space-y-5">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 ${step.status === "done" ? "bg-[#3F8F5F]/20" : "bg-[#1F2740]"}`}>
                    <Icon className={`h-5 w-5 ${step.status === "done" ? "text-[#3F8F5F]" : "text-[#B9BDD1]/40"}`} />
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm font-semibold ${step.status === "done" ? "text-[#F3EDE0]" : "text-[#B9BDD1]"}`}>{step.label}</p>
                    <p className="text-xs text-[#B9BDD1]/60 mt-0.5">{step.sublabel}</p>
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
          <p className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70 mb-3">UNIFIED ITINERARY</p>
          <div className="rounded-2xl bg-[#1F2740] overflow-hidden">
            {[currentBooking.leg1, currentBooking.leg2].map((leg, i) => (
              <div key={i} className={`p-4 ${i > 0 ? "border-t border-white/10" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-[#E8A33D]/20 px-2 py-0.5 text-[10px] font-bold text-[#E8A33D]">LEG {i + 1}</span>
                  <span className="font-mono text-[10px] text-[#B9BDD1]/60">{leg.trainNumber} {leg.trainName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[#F3EDE0]">{leg.departure}</p>
                    <p className="text-[10px] text-[#B9BDD1]/60">{leg.from}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 border-t border-dashed border-white/20" />
                    <span className="text-[10px] text-[#B9BDD1]/40">→</span>
                    <div className="flex-1 border-t border-dashed border-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[#F3EDE0]">{leg.arrival}</p>
                    <p className="text-[10px] text-[#B9BDD1]/60">{leg.to}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Layover between legs */}
            <div className="border-t border-white/10 bg-[#2A3454] px-4 py-2.5 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#B9BDD1]/40" />
              <span className="text-xs text-[#B9BDD1]/60">
                {layoverWarn ? "52 min layover at Kalyan Jn" : "Continuous journey — no de-boarding required"}
              </span>
            </div>
          </div>
        </section>
      )}

      <button onClick={() => router.push("/tickets")}
        className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F2740] text-sm font-semibold text-[#F3EDE0] hover:bg-[#2A3454] transition">
        View all my tickets
      </button>
      <button onClick={() => router.push("/")} className="mt-3 w-full py-2 text-sm text-[#B9BDD1] hover:text-[#F3EDE0]">
        ← Book another journey
      </button>
    </motion.main>
  );
}
