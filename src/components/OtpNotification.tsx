"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Smartphone, ShieldCheck, X } from "lucide-react";

interface OtpNotificationProps {
  code: string;
  sender?: string;
  title?: string;
  visible: boolean;
  onClose?: () => void;
}

export default function OtpNotification({
  code,
  sender = "IRCTC-AI",
  title = "verification",
  visible,
  onClose,
}: OtpNotificationProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 3200);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Below md (Mobile): Full-width top SMS notification banner ───────── */}
          <motion.div
            key="mobile-otp-banner"
            initial={{ y: -70, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="md:hidden fixed top-3 left-3 right-3 z-50 max-w-[440px] mx-auto cursor-pointer"
            onClick={onClose}
          >
            <div className="rounded-2xl border border-white/20 bg-slate-950/90 p-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(232,163,61,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E8A33D] text-black">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <span className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
                    {sender}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-500" />
                  <span className="text-[10px] font-mono text-slate-400">now</span>
                </div>
                <span className="text-[10px] font-mono text-[#E8A33D] font-bold">MESSAGES</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                Your OTP is <strong className="font-mono text-sm text-[#E8A33D] tracking-wider">{code}</strong> for {title}. Valid for 10 min. Do not share.
              </p>
            </div>
          </motion.div>

          {/* ── At md and up (Desktop/Tablet): Compact corner phone notification ── */}
          <motion.div
            key="desktop-otp-widget"
            initial={{ y: 40, x: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, x: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, x: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="hidden md:block fixed bottom-6 right-6 z-50 w-80 max-w-[340px]"
          >
            <div className="rounded-2xl border border-[#E8A33D]/40 bg-[#0A0A0A]/95 p-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(232,163,61,0.25)] backdrop-blur-xl relative overflow-hidden">
              {/* Top ambient highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8A33D] to-transparent" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8A33D]/50 bg-[#E8A33D]/10 text-[#E8A33D]">
                    <Smartphone className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#3F8F5F] ring-2 ring-black animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📱 Sent to your phone</span>
                    </p>
                    <p className="text-[10px] font-mono text-[#E8A33D] tracking-wide">
                      {sender} • now
                    </p>
                  </div>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white p-1 transition"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3 rounded-xl border border-white/5 bg-black/60 p-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your code is <strong className="font-mono text-sm font-extrabold text-[#E8A33D] tracking-widest">{code}</strong>
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Valid for 10 min • RailPravesh 2FA
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
