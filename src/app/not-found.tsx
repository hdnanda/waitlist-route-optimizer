"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrainFront, ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-white relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E8A33D]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_25px_rgba(232,163,61,0.25)] p-6 sm:p-8 text-center relative z-10"
      >
        {/* Top signal emblem */}
        <div className="flex items-center justify-center mb-5">
          <div className="h-16 w-16 rounded-full border border-[#C0432E]/80 bg-[#C0432E]/15 flex items-center justify-center shadow-[0_0_18px_rgba(192,67,46,0.4)]">
            <AlertTriangle className="h-8 w-8 text-[#C0432E]" />
          </div>
        </div>

        {/* 404 code pill */}
        <span className="inline-block rounded-full border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-3 py-1 font-mono text-xs font-bold text-[#E8A33D] uppercase tracking-widest mb-3">
          ERROR 404 · SIGNAL RED
        </span>

        {/* Station Board Headline */}
        <h1 className="font-serif text-3xl font-black text-white tracking-tight leading-tight mb-2">
          Platform Not Found
        </h1>
        <p className="font-mono text-xs text-slate-400 leading-relaxed mb-6">
          This train has been diverted or the requested platform does not exist on our railway grid.
        </p>

        {/* Station Info Box */}
        <div className="rounded-xl bg-[#050505] border border-white/10 p-4 mb-6 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Status:</span>
            <span className="text-[#C0432E] font-bold">● ROUTE_TERMINATED</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Junction Master:</span>
            <span className="text-white">Ghar Wapsi PRS Engine</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Recommended Action:</span>
            <span className="text-[#E8A33D]">Return to Main Concourse</span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] py-3.5 text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.45)] hover:bg-[#F0B250] hover:shadow-[0_0_24px_rgba(232,163,61,0.65)] transition active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          Return to Search
        </Link>
      </motion.div>

      <div className="mt-8 flex items-center gap-2 text-xs font-mono text-slate-600">
        <TrainFront className="h-3.5 w-3.5 text-[#E8A33D]/60" />
        <span>INDIAN RAIL ROUTES · GHAR WAPSI</span>
      </div>
    </main>
  );
}
