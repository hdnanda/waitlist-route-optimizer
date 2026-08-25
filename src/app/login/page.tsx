"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useApp } from "@/lib/context";

type LoginStep = "mobile" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { findAccount, setLoggedInAccount } = useApp();
  const [step, setStep] = useState<LoginStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSendOtp = () => {
    if (mobile.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setStep("otp");
    }, 1200);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  const handleVerify = () => {
    if (otpDigits.some((d) => !d)) {
      setError("Enter all 4 OTP digits.");
      return;
    }
    setError("");
    setLoading(true);
    const last4 = mobile.slice(-4);
    setTimeout(() => {
      const account = findAccount(last4);
      setLoggedInAccount(account);
      setLoading(false);
      router.push("/review");
    }, 1000);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-screen flex-col overflow-y-auto px-5 pb-16 pt-7 bg-black text-white"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_12px_rgba(232,163,61,0.35)]">
          <ShieldCheck className="h-6 w-6 text-[#E8A33D]" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">RailPravesh ID</h1>
          <p className="text-xs font-mono text-slate-400">Secure identity verification · Mock</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_14px_rgba(232,163,61,0.3)] p-6">
        {step === "mobile" ? (
          <>
            <label className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D]">
              MOBILE NUMBER
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              placeholder="10-digit mobile number"
              className="mt-2.5 w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 font-mono text-lg text-white placeholder:text-slate-600 focus:border-[#E8A33D] focus:shadow-[0_0_10px_rgba(232,163,61,0.4)] focus:outline-none min-h-[52px]"
            />
            {error && <p className="mt-2 text-xs font-mono text-[#C0432E]">{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading || mobile.length < 10}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-black shadow-[0_0_16px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : "Send OTP"}
            </button>
            <p className="mt-4 text-center text-[11px] font-mono text-slate-500">
              Demo accounts: 4521 (Ramesh) · 7789 (Priya) · any other (New)
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold tracking-[0.12em] text-[#E8A33D]">
                ENTER OTP
              </label>
              {otpSent && <span className="text-[10px] text-[#3F8F5F] font-mono font-bold">OTP SENT ✓</span>}
            </div>
            <p className="text-xs font-mono text-slate-400 mb-4">
              Sent to +91 ••••••{mobile.slice(-4)}
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
                    if (e.key === "Backspace" && !digit && idx > 0)
                      otpRefs[idx - 1]?.current?.focus();
                  }}
                  maxLength={1}
                  className="w-14 h-14 shrink-0 rounded-xl border border-white/10 bg-black text-center font-mono text-2xl font-bold text-white focus:border-[#E8A33D] focus:shadow-[0_0_10px_rgba(232,163,61,0.4)] focus:outline-none"
                />
              ))}
            </div>
            <p className="mt-3 text-[10px] font-mono text-slate-500 text-center">
              Enter any 4 digits for demo verification
            </p>
            {error && <p className="mt-2 text-xs font-mono text-[#C0432E]">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading || otpDigits.some((d) => !d)}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-black shadow-[0_0_16px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                "Verify & Continue"
              )}
            </button>
            <button
              onClick={() => setStep("mobile")}
              className="mt-3 w-full py-2 text-sm font-mono text-slate-400 hover:text-white transition"
            >
              ← Change number
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] font-mono text-slate-600">
        Mock identity system for hackathon demonstration.
      </p>
    </motion.main>
  );
}
