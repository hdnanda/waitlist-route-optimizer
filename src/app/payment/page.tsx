"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useApp } from "@/lib/context";
import type { StoredTicket } from "@/lib/types";

function genPNR() {
  return "MOCK-" + Math.random().toString().slice(2, 12);
}

export default function PaymentPage() {
  const router = useRouter();
  const { state, addTicket } = useApp();
  const { selectedOption, parsedIntent, loggedInAccount } = state;
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  const handleVerify = () => {
    if (otpDigits.some((d) => !d)) { setError("Enter all 4 digits."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      // Generate ticket and add to history
      const ticket: StoredTicket = {
        pnr: genPNR(),
        route: selectedOption?.route ?? "",
        train: selectedOption?.meta ?? "",
        date: parsedIntent?.date ?? new Date().toLocaleDateString("en-IN"),
        class: (state.selectedClass ?? "3A") as import("@/lib/types").TrainClass,
        status: selectedOption?.isSplit ? "SPLIT_CONFIRMED" : "CONFIRMED",
        isSplit: selectedOption?.isSplit,
        bookedAt: new Date().toISOString(),
        farePaid: selectedOption?.fare,
        passengerName: loggedInAccount?.name,
        leg1: selectedOption?.leg1,
        leg2: selectedOption?.leg2,
      };
      addTicket(ticket);
      setLoading(false);
      router.push("/confirmation");
    }, 1500);
  };

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-screen flex-col px-5 pb-8 pt-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#B9BDD1] mb-8">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3F8F5F]/20">
          <Lock className="h-6 w-6 text-[#3F8F5F]" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Secure Payment</h1>
          <p className="text-xs text-[#B9BDD1]">Mock OTP verification</p>
        </div>
      </div>

      {/* Fare summary */}
      <div className="rounded-2xl bg-[#1F2740] p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#B9BDD1]">Amount to pay</p>
            <p className="font-mono text-3xl font-bold text-[#F3EDE0] mt-1">
              ₹{selectedOption?.fare.toLocaleString("en-IN") ?? "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#B9BDD1]">Route</p>
            <p className="text-sm font-semibold text-[#F3EDE0] mt-1 max-w-[140px] text-right leading-tight">
              {selectedOption?.route ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* OTP */}
      <div className="rounded-2xl bg-[#1F2740] p-6">
        <label className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70">PAYMENT OTP</label>
        <p className="mt-1 text-xs text-[#B9BDD1] mb-4">Enter any 4-digit code to simulate payment</p>
        <div className="flex justify-center gap-3">
          {otpDigits.map((digit, idx) => (
            <input key={idx} ref={otpRefs[idx]} type="text" inputMode="numeric"
              value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !digit && idx > 0) otpRefs[idx - 1]?.current?.focus(); }}
              maxLength={1}
              className="w-14 h-14 shrink-0 rounded-xl border border-white/10 bg-[#151B2E] text-center font-mono text-2xl font-bold text-[#F3EDE0] focus:border-[#3F8F5F] focus:outline-none" />
          ))}
        </div>
        {error && <p className="mt-2 text-xs text-[#C0432E]">{error}</p>}
        <button onClick={handleVerify} disabled={loading || otpDigits.some((d) => !d)}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#3F8F5F] py-3.5 text-sm font-bold text-white transition hover:bg-[#4ca870] disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Verify & Book"}
        </button>
      </div>

      <p className="mt-6 text-center text-[11px] text-[#B9BDD1]/40">
        This is a simulated payment. No real money is deducted.
      </p>
    </motion.main>
  );
}
