"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { ReasonedOption } from "@/lib/types";

interface TicketCardProps {
  option: ReasonedOption;
  onBook: () => void;
  index?: number;
}

export default function TicketCard({ option, onBook, index = 0 }: TicketCardProps) {
  const canBook = option.status === "CONFIRMED";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
      className={`overflow-hidden rounded-2xl bg-[#080808] text-white border transition-all duration-200 ${
        option.isHero
          ? "border-[#E8A33D] shadow-[0_0_18px_rgba(232,163,61,0.55),inset_0_0_8px_rgba(232,163,61,0.15)] ring-1 ring-[#E8A33D]"
          : "border-[#E8A33D]/70 shadow-[0_0_10px_rgba(232,163,61,0.25)] hover:shadow-[0_0_16px_rgba(232,163,61,0.45)]"
      }`}
    >
      {/* ── Top Section ─────────────────────────────────────────────────── */}
      <div className="p-5 bg-[#080808]">
        {/* Badge row */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold tracking-wide text-white ${option.badgeBg}`}
          >
            {option.badge}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {option.transferTag && (
              <span className="rounded-full border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#E8A33D]">
                {option.transferTag}
              </span>
            )}
            {option.isHero && (
              <ShieldCheck className="h-5 w-5 text-[#3F8F5F] drop-shadow-[0_0_6px_rgba(63,143,95,0.7)]" aria-label="Recommended option" />
            )}
          </div>
        </div>

        {/* Route */}
        <h2 className="mt-3 font-serif text-xl font-bold leading-7 text-white">{option.route}</h2>
        <p className="mt-1 font-mono text-[11px] leading-4 text-slate-400">{option.meta}</p>

        {/* Status + confidence row */}
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${option.statusBg}`}>
            {option.statusDisplay}
          </span>
          <span className="text-xs font-mono text-slate-300">{option.confirmationLikelihood}</span>
        </div>

        {/* Split legs (if applicable) */}
        {option.isSplit && option.leg1 && option.leg2 && (
          <div className="mt-3.5 rounded-xl bg-black/60 border border-white/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <span className="rounded bg-[#E8A33D]/20 text-[#E8A33D] px-1.5 py-0.5 font-bold">LEG 1</span>
              <span>{option.leg1.from}</span>
              <span className="text-[#E8A33D]">→</span>
              <span>{option.leg1.to}</span>
              <span className="ml-auto text-slate-400">{option.leg1.departure}–{option.leg1.arrival}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <span className="rounded bg-[#E8A33D]/20 text-[#E8A33D] px-1.5 py-0.5 font-bold">LEG 2</span>
              <span>{option.leg2.from}</span>
              <span className="text-[#E8A33D]">→</span>
              <span>{option.leg2.to}</span>
              <span className="ml-auto text-slate-400">{option.leg2.departure}–{option.leg2.arrival}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Perforated divider (ticket-stub signature) ────────────────── */}
      <div className="relative h-0 w-full border-t border-dashed border-[#E8A33D]/40">
        <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-black border-r border-[#E8A33D]/40" />
        <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black border-l border-[#E8A33D]/40" />
      </div>

      {/* ── Lower section ────────────────────────────────────────────────── */}
      <div className="bg-[#0E0E0E] p-5">
        {/* Fare */}
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#E8A33D]">WHY THIS OPTION</p>
          <p className="font-mono text-base font-bold text-white">₹{option.fare.toLocaleString("en-IN")}</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">{option.why}</p>

        <button
          type="button"
          onClick={canBook ? onBook : undefined}
          disabled={!canBook}
          className={`mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] ${
            canBook
              ? "bg-[#E8A33D] text-black hover:bg-[#F0B250] shadow-[0_0_14px_rgba(232,163,61,0.45)] cursor-pointer"
              : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
          }`}
        >
          {canBook ? (
            option.type === "SPLIT"
              ? "Book both legs — 1 tap"
              : option.type === "NEARBY"
              ? "Book alternate station"
              : "Book this ticket"
          ) : (
            `Hold: ${option.statusDisplay}`
          )}
          {canBook && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
        </button>
      </div>
    </motion.article>
  );
}
