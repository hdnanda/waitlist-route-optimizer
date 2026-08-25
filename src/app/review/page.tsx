"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Train } from "lucide-react";
import { useApp } from "@/lib/context";

export default function ReviewPage() {
  const router = useRouter();
  const { state } = useApp();
  const { selectedOption, parsedIntent, loggedInAccount } = state;
  const [passengerName, setPassengerName] = useState(loggedInAccount?.name ?? "");

  if (!selectedOption || !parsedIntent || !loggedInAccount) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="text-[#B9BDD1] mb-4">Session expired. Please start again.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#1C2B4A]">← Home</button>
      </div>
    );
  }

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-8 pt-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#B9BDD1] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 text-[#E8A33D] mb-2">
        <Train className="h-4 w-4" />
        <span className="font-mono text-[10px] tracking-wider">BOOKING REVIEW · MOCK</span>
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Confirm your journey</h1>

      {/* Journey summary card */}
      <div className="rounded-2xl bg-[#F7EFE0] text-[#1C2B4A] overflow-hidden">
        <div className="p-5">
          <p className="font-mono text-[10px] font-bold tracking-widest text-[#1C2B4A]/50 mb-1">JOURNEY</p>
          <p className="font-serif text-lg font-semibold">{selectedOption.route}</p>
          <p className="mt-1 font-mono text-xs text-[#1C2B4A]/60">{selectedOption.meta}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedOption.statusBg}`}>
              {selectedOption.statusDisplay}
            </span>
            <span className="text-xs text-[#1C2B4A]/60">{selectedOption.type === "SPLIT" ? "Split ticket · 2 PNRs" : "Single ticket"}</span>
          </div>

          {/* Leg breakdown for split */}
          {selectedOption.isSplit && selectedOption.leg1 && selectedOption.leg2 && (
            <div className="mt-3 rounded-xl bg-[#1C2B4A]/5 p-3 space-y-2">
              {[selectedOption.leg1, selectedOption.leg2].map((leg, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]/70">
                  <span className="rounded bg-[#1C2B4A]/10 px-1 py-0.5 font-bold shrink-0">LEG {i + 1}</span>
                  <span className="truncate">{leg.from} → {leg.to}</span>
                  <span className="ml-auto shrink-0">{leg.departure}–{leg.arrival}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative border-t-2 border-dashed border-[#94A3B8]/50">
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#151B2E]" />
          <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#151B2E]" />
        </div>

        <div className="bg-[#EDE3CE] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#1C2B4A]/50">TOTAL FARE</span>
            <span className="font-mono text-xl font-bold text-[#1C2B4A]">₹{selectedOption.fare.toLocaleString("en-IN")}</span>
          </div>

          <label className="text-xs font-bold tracking-[0.1em] text-[#1C2B4A]/60">PASSENGER NAME</label>
          <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#1C2B4A]/20 bg-white px-4 py-3 text-sm text-[#1C2B4A] focus:border-[#E8A33D] focus:outline-none min-h-[48px]" />
          <p className="mt-1 text-[10px] text-[#1C2B4A]/40">Logged in as {loggedInAccount.name}</p>
        </div>
      </div>

      {/* Proceed CTA */}
      <button onClick={() => router.push("/payment")}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#E8A33D] text-sm font-bold text-[#1C2B4A] transition hover:bg-[#f0b250] active:scale-[0.99]">
        Pay &amp; Confirm →
      </button>

      <p className="mt-3 text-center text-[11px] text-[#B9BDD1]/50">
        Mock payment · No real transaction will occur
      </p>
    </motion.main>
  );
}
