"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2, RotateCw } from "lucide-react";
import { useApp } from "@/lib/context";
import OtpNotification from "@/components/OtpNotification";
import type { StoredTicket } from "@/lib/types";

function genPNR() {
  return "MOCK-" + Math.random().toString().slice(2, 12);
}

function generatePaymentOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function PaymentPage() {
  const router = useRouter();
  const { state, addTicket } = useApp();
  const { selectedOption, parsedIntent, loggedInAccount } = state;
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── OTP State & Notification ───────────────────────────────────────────────
  const [expectedOtp, setExpectedOtp] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ── Send Payment OTP routine ───────────────────────────────────────────────
  const triggerSendOtp = useCallback(() => {
    const code = generatePaymentOtp();
    setExpectedOtp(code);
    setOtpDigits(["", "", "", ""]);
    setError("");
    setShowNotification(true);
    setResendCountdown(30);

    // Auto-fill ~1.2s after notification appears
    setTimeout(() => {
      setIsAutoFilling(true);
      setOtpDigits(code.split(""));
      setTimeout(() => setIsAutoFilling(false), 800);
    }, 1200);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Trigger OTP on page load & auto-focus
  useEffect(() => {
    triggerSendOtp();
    setTimeout(() => otpRefs[0]?.current?.focus(), 150);
  }, [triggerSendOtp]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  const handleVerify = () => {
    if (otpDigits.some((d) => !d)) {
      setError("Enter all 4 digits.");
      return;
    }
    const entered = otpDigits.join("");
    // Strict validation check against the generated payment OTP
    if (entered !== expectedOtp) {
      setError("Invalid authorization code. Please enter the 4-digit code sent to your phone.");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
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
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-screen flex-col px-5 pb-16 pt-4 lg:pt-8 bg-transparent text-white w-full"
    >
      {/* ── Real Phone SMS Notification (Mobile top banner / Desktop bottom-right widget) ── */}
      <OtpNotification
        code={expectedOtp}
        sender="IRCTC-AI"
        title="Payment authorization"
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <div className="w-full max-w-[480px] mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_12px_rgba(232,163,61,0.3)]">
            <Lock className="h-6 w-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Payment Authorization</h1>
            <p className="text-xs font-mono text-slate-400">
              {loggedInAccount ? `Authenticated as ${loggedInAccount.name}` : "Secure Bank OTP"}
            </p>
          </div>
        </div>

        {/* Fare summary */}
        <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_12px_rgba(232,163,61,0.25)] p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400">Amount to pay</p>
              <p className="font-mono text-3xl font-extrabold text-[#E8A33D] mt-1 drop-shadow-[0_0_8px_rgba(232,163,61,0.5)]">
                ₹{selectedOption?.fare.toLocaleString("en-IN") ?? "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-400">Route</p>
              <p className="text-sm font-semibold text-white mt-1 max-w-[140px] text-right leading-tight">
                {selectedOption?.route ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* OTP Entry Card */}
        <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_14px_rgba(232,163,61,0.3)] p-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D] uppercase">
              PAYMENT OTP
            </label>
            <span className="text-[10px] font-mono font-bold text-[#3F8F5F] bg-[#3F8F5F]/15 px-2 py-0.5 rounded-full border border-[#3F8F5F]/30">
              CODE SENT ✓
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 mb-4">
            Enter the 4-digit authorization code sent to your mobile number
          </p>

          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={otpRefs[idx]}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && idx > 0) {
                    otpRefs[idx - 1]?.current?.focus();
                  }
                  if (e.key === "Enter" && otpDigits.every((d) => d)) {
                    handleVerify();
                  }
                }}
                maxLength={1}
                className={`w-14 h-14 shrink-0 rounded-xl border bg-black text-center font-mono text-2xl font-bold text-white focus:outline-none transition-all ${
                  isAutoFilling
                    ? "border-[#E8A33D] shadow-[0_0_16px_rgba(232,163,61,0.65)] scale-105"
                    : "border-white/10 focus:border-[#E8A33D] focus:shadow-[0_0_10px_rgba(232,163,61,0.4)]"
                }`}
              />
            ))}
          </div>

          {/* Resend Countdown */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {resendCountdown > 0 ? (
                `Resend in 0:${resendCountdown.toString().padStart(2, "0")}`
              ) : (
                "Didn't receive code?"
              )}
            </span>
            {resendCountdown === 0 ? (
              <button
                type="button"
                onClick={triggerSendOtp}
                className="flex items-center gap-1 text-xs font-mono font-bold text-[#E8A33D] hover:underline"
              >
                <RotateCw className="h-3 w-3" /> Resend OTP
              </button>
            ) : (
              <span className="text-xs font-mono text-slate-500">SMS delivered</span>
            )}
          </div>

          {error && <p className="mt-2.5 text-xs font-mono text-[#C0432E]">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || otpDigits.some((d) => !d)}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" /> Authorizing...
              </>
            ) : (
              "Authorize ₹" + (selectedOption?.fare.toLocaleString("en-IN") ?? "")
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-xs font-mono text-slate-500">
          256-bit Encrypted IRCTC Payment Gateway
        </p>
      </div>
    </motion.main>
  );
}
