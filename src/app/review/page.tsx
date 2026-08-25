"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Train, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context";

export default function ReviewPage() {
  const router = useRouter();
  const { state } = useApp();
  const { selectedOption, parsedIntent, loggedInAccount } = state;
  const [passengerName, setPassengerName] = useState(loggedInAccount?.name ?? "");

  if (!selectedOption || !parsedIntent || !loggedInAccount) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 bg-black text-white">
        <p className="text-slate-400 mb-4 font-mono text-sm">Session expired. Please start again.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_14px_rgba(232,163,61,0.45)]">← Home</button>
      </div>
    );
  }

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-7 bg-black text-white">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
        <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
      </button>

      <div className="flex items-center gap-2 text-[#E8A33D] mb-2">
        <Train className="h-4 w-4 drop-shadow-[0_0_6px_rgba(232,163,61,0.6)]" />
        <span className="font-mono text-[10px] tracking-wider font-bold uppercase">BOOKING REVIEW · MOCK</span>
      </div>
      <h1 className="font-serif text-2xl font-bold mb-6 text-white">Confirm your journey</h1>

      {/* Journey summary card */}
      <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/80 shadow-[0_0_16px_rgba(232,163,61,0.35)] overflow-hidden">
        <div className="p-5 bg-[#080808]">
          <p className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D] mb-1">JOURNEY</p>
          <p className="font-serif text-lg font-bold text-white">{selectedOption.route}</p>
          <p className="mt-1 font-mono text-xs text-slate-400">{selectedOption.meta}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${selectedOption.statusBg}`}>
              {selectedOption.statusDisplay}
            </span>
            <span className="text-xs font-mono text-slate-400">{selectedOption.type === "SPLIT" ? "Split ticket · 2 PNRs" : "Single ticket"}</span>
          </div>

          {/* Leg breakdown for split */}
          {selectedOption.isSplit && selectedOption.leg1 && selectedOption.leg2 && (
            <div className="mt-3 rounded-xl bg-black/60 border border-white/10 p-3 space-y-2">
              {[selectedOption.leg1, selectedOption.leg2].map((leg, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                  <span className="rounded bg-[#E8A33D]/20 text-[#E8A33D] px-1 py-0.5 font-bold shrink-0">LEG {i + 1}</span>
                  <span className="truncate">{leg.from} → {leg.to}</span>
                  <span className="ml-auto shrink-0 text-slate-400">{leg.departure}–{leg.arrival}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative border-t border-dashed border-[#E8A33D]/40">
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-black border-r border-[#E8A33D]/40" />
          <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black border-l border-[#E8A33D]/40" />
        </div>

        <div className="bg-[#0E0E0E] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-400">TOTAL FARE</span>
            <span className="font-mono text-xl font-bold text-white">₹{selectedOption.fare.toLocaleString("en-IN")}</span>
          </div>

          <label className="text-xs font-mono font-bold tracking-[0.1em] text-[#E8A33D]">PASSENGER NAME</label>
          <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-[#E8A33D] focus:shadow-[0_0_10px_rgba(232,163,61,0.4)] focus:outline-none min-h-[48px]" />
          <p className="mt-1.5 text-[10px] font-mono text-slate-500">Logged in as {loggedInAccount.name}</p>
        </div>
      </div>

      {/* Proceed CTA */}
      <button onClick={() => router.push("/payment")}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250] active:scale-[0.99]">
        Pay &amp; Confirm <ArrowRight className="h-4 w-4 stroke-[2.5]" />
      </button>

      <p className="mt-3 text-center text-[11px] font-mono text-slate-600">
        Mock payment · No real transaction will occur
      </p>
    </motion.main>
  );
}
