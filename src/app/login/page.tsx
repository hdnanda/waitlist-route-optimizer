"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle2, User, Calendar, Phone, RotateCw } from "lucide-react";
import { useApp } from "@/lib/context";
import OtpNotification from "@/components/OtpNotification";
import type { Account } from "@/lib/types";

type LoginStep = "mobile" | "signup" | "otp" | "success";

function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function LoginPage() {
  const router = useRouter();
  const { state, findAccount, setLoggedInAccount, registerAccount } = useApp();
  const { parsedIntent, selectedOption } = state;
  
  const [step, setStep] = useState<LoginStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);

  // ── Session Guard: Redirect to home if refreshed without active booking context ──
  useEffect(() => {
    if (!parsedIntent || !selectedOption) {
      router.replace("/?notice=session-reset");
    }
  }, [parsedIntent, selectedOption, router]);

  // ── OTP Real Code & Notification State ─────────────────────────────────────
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

  // ── Paste handler: distributes 4 digits across all inputs ─────────────────
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const digits = pasted.split("");
    while (digits.length < 4) digits.push("");
    setOtpDigits(digits);
    const nextIdx = Math.min(pasted.length, 3);
    otpRefs[nextIdx]?.current?.focus();
  };

  // ── Send OTP routine: generates code, triggers notification, schedule autofill ──
  const triggerSendOtp = useCallback(() => {
    const code = generateOtpCode();
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

  // Resend timer tick
  useEffect(() => {
    if (step !== "otp") return;
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // When step transitions to OTP, trigger code generation & focus
  useEffect(() => {
    if (step === "otp") {
      triggerSendOtp();
      setTimeout(() => otpRefs[0]?.current?.focus(), 150);
    }
  }, [step, triggerSendOtp]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const entered = otpDigits.join("");
    // Strict validation check against the generated OTP
    if (entered !== expectedOtp) {
      setError("Invalid OTP code. Please enter the 4-digit code sent to your phone.");
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

  if (!parsedIntent || !selectedOption) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex min-h-screen flex-col overflow-y-auto px-5 pb-16 pt-7 bg-gradient-to-b from-[#FFFFFF] via-[#F8F9FA] to-[#F1F3F5] text-slate-900 w-full"
    >
      {/* ── Real Phone SMS Notification (Mobile top banner / Desktop bottom-right widget) ── */}
      <OtpNotification
        code={expectedOtp}
        sender="IRCTC-AI"
        title="RailPravesh ID sign-in"
        visible={showNotification && step === "otp"}
        onClose={() => setShowNotification(false)}
      />

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
                  Enter 10-Digit Mobile Number
                </label>
                <p className="mt-1 text-xs text-slate-500 mb-4">
                  We&apos;ll send an OTP to verify your account or create a new profile
                </p>

                <div className="relative flex items-center">
                  <span className="absolute left-4 font-mono text-sm font-semibold text-slate-500 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setMobile(val);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && mobile.length === 10) handleMobileSubmit();
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-3.5 pl-14 pr-4 font-mono text-base font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none transition-all"
                  />
                </div>

                {error && <p className="mt-2.5 text-xs font-mono text-red-600">{error}</p>}

                <button
                  onClick={handleMobileSubmit}
                  disabled={loading || mobile.length < 10}
                  className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_4px_14px_rgba(232,163,61,0.4)] transition-all hover:bg-[#F0B250] hover:shadow-[0_6px_20px_rgba(232,163,61,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    "Send Verification OTP"
                  )}
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: NEW USER SIGNUP (if number not recognized) ─────── */}
            {step === "signup" && (
              <motion.div
                key="signup-step"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-[#E8A33D]/20 text-[#D97706] px-2 py-0.5 text-[10px] font-mono font-bold">
                    NEW PASSENGER
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-slate-900">Create RailPravesh Profile</h2>
                <p className="text-xs text-slate-500 mt-1 mb-5">
                  Complete your verified profile for automatic IRCTC passenger charting
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#D97706]" /> Full Name (As per Govt ID)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#D97706]" /> Age (Years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. 32"
                      min={5}
                      max={120}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5">
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
                    Enter Verification Code
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
                      onPaste={handlePaste}
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
                      className={`w-14 h-14 shrink-0 rounded-xl border text-center font-mono text-2xl font-bold text-slate-900 focus:outline-none transition-all ${
                        isAutoFilling
                          ? "border-[#E8A33D] bg-[#E8A33D]/20 shadow-[0_0_12px_rgba(232,163,61,0.5)] scale-105"
                          : "border-slate-300 bg-slate-50/60 focus:border-[#D97706] focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.15)]"
                      }`}
                    />
                  ))}
                </div>

                {/* Resend Countdown */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
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
                      className="flex items-center gap-1 text-xs font-mono font-bold text-[#D97706] hover:underline"
                    >
                      <RotateCw className="h-3 w-3" /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">SMS delivered</span>
                  )}
                </div>

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
              </motion.div>
            )}

            {/* ── STEP 4: YOU'RE SIGNED IN SUCCESS (1 second display) ─────── */}
            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>

                <h1 className="mt-5 font-serif text-3xl font-bold text-slate-900 tracking-tight">
                  You&apos;re signed in
                </h1>

                <p className="mt-2 text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E8A33D] animate-ping" />
                  Redirecting back to your booking...
                </p>

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
            Encrypted authentication • RailPravesh
          </p>
        )}
      </div>
    </motion.main>
  );
}
