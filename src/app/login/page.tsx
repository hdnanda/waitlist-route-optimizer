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
    if (mobile.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }
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
    if (otpDigits.some((d) => !d)) { setError("Enter all 4 OTP digits."); return; }
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
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-screen flex-col overflow-y-auto px-5 pb-12 pt-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#B9BDD1] mb-8">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8A33D]/20">
          <ShieldCheck className="h-6 w-6 text-[#E8A33D]" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">RailPravesh ID</h1>
          <p className="text-xs text-[#B9BDD1]">Secure identity verification · Mock</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1F2740] p-6">
        {step === "mobile" ? (
          <>
            <label className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70">MOBILE NUMBER</label>
            <input type="tel" inputMode="numeric" value={mobile}
              onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
              placeholder="10-digit mobile number"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#151B2E] px-4 py-3.5 font-mono text-lg text-[#F3EDE0] placeholder:text-[#94A3B8]/60 focus:border-[#E8A33D] focus:outline-none min-h-[52px]" />
            {error && <p className="mt-2 text-xs text-[#C0432E]">{error}</p>}
            <button onClick={handleSendOtp} disabled={loading || mobile.length < 10}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-bold text-[#1C2B4A] transition hover:bg-[#f0b250] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </button>
            <p className="mt-4 text-center text-[11px] text-[#B9BDD1]/50">
              Try: ending in 4521 (Ramesh Kumar) · 7789 (Priya Sharma) · 3300 (New User)
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold tracking-[0.12em] text-[#B9BDD1]/70">ENTER OTP</label>
              {otpSent && <span className="text-[10px] text-[#3F8F5F] font-mono">OTP SENT ✓</span>}
            </div>
            <p className="text-xs text-[#B9BDD1] mb-4">Sent to +91 ••••••{mobile.slice(-4)}</p>
            <div className="flex justify-center gap-3">
              {otpDigits.map((digit, idx) => (
                <input key={idx} ref={otpRefs[idx]} type="text" inputMode="numeric"
                  value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !digit && idx > 0) otpRefs[idx - 1]?.current?.focus(); }}
                  maxLength={1}
                  className="w-14 h-14 shrink-0 rounded-xl border border-white/10 bg-[#151B2E] text-center font-mono text-2xl font-bold text-[#F3EDE0] focus:border-[#E8A33D] focus:outline-none" />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#B9BDD1]/50 text-center">Enter any 4 digits (demo mode)</p>
            {error && <p className="mt-2 text-xs text-[#C0432E]">{error}</p>}
            <button onClick={handleVerify} disabled={loading || otpDigits.some((d) => !d)}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-bold text-[#1C2B4A] transition hover:bg-[#f0b250] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
            </button>
            <button onClick={() => setStep("mobile")} className="mt-3 w-full py-2 text-sm text-[#B9BDD1]">← Change number</button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-[#B9BDD1]/40">
        This is a mock identity system for hackathon demonstration. No real data is collected.
      </p>
    </motion.main>
  );
}
