"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle2, User, Calendar, Phone } from "lucide-react";
import { useApp } from "@/lib/context";
import type { Account } from "@/lib/types";

type LoginStep = "mobile" | "signup" | "otp" | "success";

export default function LoginPage() {
  const router = useRouter();
  const { findAccount, setLoggedInAccount, registerAccount } = useApp();
  
  const [step, setStep] = useState<LoginStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // If entering OTP step, auto-focus first box
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs[0]?.current?.focus(), 150);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMobileSubmit = () => {
    if (mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const last4 = mobile.slice(-4);
      const existing = findAccount(last4);

      if (existing) {
        setIsNewUser(false);
        setTargetAccount(existing);
        setStep("otp");
      } else {
        setIsNewUser(true);
        setStep("signup");
      }
    }, 600);
  };

  const handleSignupSubmit = () => {
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    const numAge = parseInt(age, 10);
    if (!age || isNaN(numAge) || numAge < 5 || numAge > 120) {
      setError("Please enter a valid age (between 5 and 120).");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      const newAcc: Account = {
        mobileLast4: mobile.slice(-4),
        name: fullName.trim(),
        age: numAge,
        tickets: [],
      };
      setTargetAccount(newAcc);
      setLoading(false);
      setStep("otp");
    }, 600);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  const handleVerifyOtp = () => {
    if (otpDigits.some((d) => !d)) {
      setError("Please enter all 4 OTP digits.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (targetAccount) {
        if (isNewUser) {
          registerAccount(targetAccount);
        } else {
          setLoggedInAccount(targetAccount);
        }
      }
      setLoading(false);
      setStep("success");
    }, 800);
  };

  // Redirect after 1 second on success
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        router.push("/review");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex min-h-screen flex-col overflow-y-auto px-5 pb-16 pt-7 bg-gradient-to-b from-[#FFFFFF] via-[#F8F9FA] to-[#F1F3F5] text-slate-900 w-full"
    >
      {/* Gentle ambient warm glow orb */}
      <div className="pointer-events-none fixed -top-16 -right-16 h-60 w-60 rounded-full bg-[#E8A33D]/15 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-20 -left-16 h-60 w-60 rounded-full bg-[#E8A33D]/10 blur-3xl" />

      <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-center">
        {step !== "success" && (
          <button
            onClick={() => {
              if (step === "signup") setStep("mobile");
              else if (step === "otp") setStep(isNewUser ? "signup" : "mobile");
              else router.back();
            }}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition mb-6 w-fit"
          >
            <ArrowLeft className="h-4 w-4 text-[#D97706]" /> Back
          </button>
        )}

      {/* Brand Header */}
      {step !== "success" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E8A33D]/40 shadow-[0_4px_16px_rgba(232,163,61,0.2)]">
            <ShieldCheck className="h-6 w-6 text-[#D97706]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">RailPravesh ID</h1>
            <p className="text-xs font-mono text-slate-500">Secure IRCTC identity verification</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: MOBILE NUMBER ────────────────────────────────────── */}
          {step === "mobile" && (
            <motion.div
              key="mobile-step"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
            >
              <label className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                Mobile Number
              </label>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">
                Enter your mobile number to sign in or create an account
              </p>

              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-mono font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mobile.length === 10) {
                      e.preventDefault();
                      handleMobileSubmit();
                    }
                  }}
                  placeholder="98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-14 pr-4 py-3.5 font-mono text-lg text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none min-h-[52px]"
                />
              </div>

              {error && <p className="mt-2.5 text-xs font-mono text-red-600">{error}</p>}

              <button
                onClick={handleMobileSubmit}
                disabled={loading || mobile.length < 10}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_4px_14px_rgba(232,163,61,0.4)] transition-all hover:bg-[#F0B250] hover:shadow-[0_6px_20px_rgba(232,163,61,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Send OTP"}
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: NEW USER SIGN UP PROFILE ─────────────────────────── */}
          {step === "signup" && (
            <motion.div
              key="signup-step"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
            >
              <div className="mb-4">
                <span className="rounded-full bg-[#E8A33D]/15 text-[#D97706] px-2.5 py-0.5 text-[10px] font-mono font-bold">
                  NEW USER SIGN UP
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Create Your Rail Profile</h2>
                <p className="text-xs text-slate-500">
                  Quick one-time registration to auto-fill ticket bookings
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#D97706]" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. Rahul Verma"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#D97706]" /> Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. 28"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#D97706]" /> Mobile Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`+91 ${mobile}`}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-mono text-sm text-slate-600 min-h-[48px] cursor-not-allowed"
                  />
                </div>
              </div>

              {error && <p className="mt-3 text-xs font-mono text-red-600">{error}</p>}

              <button
                onClick={handleSignupSubmit}
                disabled={loading || !fullName.trim() || !age}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_4px_14px_rgba(232,163,61,0.4)] transition-all hover:bg-[#F0B250] hover:shadow-[0_6px_20px_rgba(232,163,61,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  "Continue to OTP"
                )}
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: ENTER OTP ────────────────────────────────────────── */}
          {step === "otp" && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                  Enter OTP
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  CODE SENT ✓
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mb-5">
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
                      if (e.key === "Backspace" && !digit && idx > 0) {
                        otpRefs[idx - 1]?.current?.focus();
                      }
                      if (e.key === "Enter" && otpDigits.every((d) => d)) {
                        handleVerifyOtp();
                      }
                    }}
                    maxLength={1}
                    className="w-14 h-14 shrink-0 rounded-xl border border-slate-300 bg-slate-50/60 text-center font-mono text-2xl font-bold text-slate-900 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none transition-all"
                  />
                ))}
              </div>

              <p className="mt-3 text-[11px] font-mono text-slate-400 text-center">
                Enter any 4-digit code for demo verification
              </p>

              {error && <p className="mt-2.5 text-xs font-mono text-red-600">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpDigits.some((d) => !d)}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_4px_14px_rgba(232,163,61,0.4)] transition-all hover:bg-[#F0B250] hover:shadow-[0_6px_20px_rgba(232,163,61,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <button
                onClick={() => setStep(isNewUser ? "signup" : "mobile")}
                className="mt-3.5 w-full py-2 text-xs font-mono text-slate-500 hover:text-slate-800 transition text-center"
              >
                ← Back to edit details
              </button>
            </motion.div>
          )}

          {/* ── STEP 4: YOU'RE SIGNED IN TRANSITION SCREEN ───────────────── */}
          {step === "success" && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center py-12"
            >
              {/* Pulsing check icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)] mb-6"
              >
                <CheckCircle2 className="h-11 w-11 text-emerald-600" />
              </motion.div>

              {/* Crisp Black Header */}
              <h1 className="font-serif text-3xl font-extrabold text-black tracking-tight">
                You&apos;re signed in
              </h1>

              {/* Lighter subtext */}
              <p className="mt-2 text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E8A33D] animate-ping" />
                Redirecting back to your booking...
              </p>

              {/* Small flowing progress bar */}
              <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="h-full bg-[#E8A33D]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step !== "success" && (
        <p className="mt-6 text-center text-[11px] font-mono text-slate-400">
          Encrypted authentication • Demo mode
        </p>
      )}
      </div>
    </motion.main>
  );
}
