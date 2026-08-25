"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { ReasonedOption } from "@/lib/types";

interface TicketCardProps {
  option: ReasonedOption;
  onBook: () => void;
  index?: number;
}

/**
 * TicketCard — reusable ticket-stub component with perforated dashed divider.
 * Design: paper (#F7EFE0) top section, darker paper (#EDE3CE) lower section,
 * separated by a dashed border with circular notches (ticket-stub aesthetic).
 */
export default function TicketCard({ option, onBook, index = 0 }: TicketCardProps) {
  const canBook = option.status === "CONFIRMED";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
      className={`overflow-hidden rounded-2xl bg-[#F7EFE0] text-[#1C2B4A] shadow-xl ${
        option.isHero ? "ring-2 ring-[#E8A33D]" : ""
      }`}
    >
      {/* ── Top section ─────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Badge row */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide text-white ${option.badgeBg}`}
          >
            {option.badge}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {option.transferTag && (
              <span className="rounded-full bg-[#E8A33D]/20 px-2.5 py-1 text-[10px] font-bold text-[#C48630]">
                {option.transferTag}
              </span>
            )}
            {option.isHero && (
              <ShieldCheck className="h-5 w-5 text-[#3F8F5F]" aria-label="Recommended option" />
            )}
          </div>
        </div>

        {/* Route */}
        <h2 className="mt-4 font-serif text-xl font-semibold leading-7">{option.route}</h2>
        <p className="mt-1.5 font-mono text-[11px] leading-4 text-[#1C2B4A]/60">{option.meta}</p>

        {/* Status + confidence row */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${option.statusBg}`}>
            {option.statusDisplay}
          </span>
          <span className="text-xs font-semibold text-[#1C2B4A]/60">{option.confirmationLikelihood}</span>
        </div>

        {/* Split legs (if applicable) */}
        {option.isSplit && option.leg1 && option.leg2 && (
          <div className="mt-4 rounded-xl bg-[#1C2B4A]/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]/70">
              <span className="rounded bg-[#1C2B4A]/10 px-1.5 py-0.5 font-bold">LEG 1</span>
              <span>{option.leg1.from}</span>
              <span>→</span>
              <span>{option.leg1.to}</span>
              <span className="ml-auto">{option.leg1.departure}–{option.leg1.arrival}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]/70">
              <span className="rounded bg-[#1C2B4A]/10 px-1.5 py-0.5 font-bold">LEG 2</span>
              <span>{option.leg2.from}</span>
              <span>→</span>
              <span>{option.leg2.to}</span>
              <span className="ml-auto">{option.leg2.departure}–{option.leg2.arrival}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Perforated divider (ticket-stub signature) ────────────────── */}
      <div className="relative h-0 w-full border-t-2 border-dashed border-[#94A3B8]/60">
        <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#151B2E]" />
        <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#151B2E]" />
      </div>

      {/* ── Lower section ────────────────────────────────────────────────── */}
      <div className="bg-[#EDE3CE] p-5">
        {/* Fare */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#1C2B4A]/50">WHY THIS OPTION</p>
          <p className="font-mono text-sm font-bold text-[#1C2B4A]">₹{option.fare.toLocaleString("en-IN")}</p>
        </div>
        <p className="text-sm leading-5 text-[#1C2B4A]/80">{option.why}</p>

        <button
          type="button"
          onClick={canBook ? onBook : undefined}
          disabled={!canBook}
          className={`mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition active:scale-[0.98] ${
            canBook
              ? "bg-[#1C2B4A] text-[#F7EFE0] hover:bg-[#273b64] cursor-pointer"
              : "bg-[#1C2B4A]/30 text-[#1C2B4A]/50 cursor-not-allowed"
          }`}
        >
          {canBook ? (option.type === "SPLIT" ? "Book both legs — 1 tap" : option.type === "NEARBY" ? "Book alternate station" : "Book this ticket") : `Hold: ${option.statusDisplay}`}
          {canBook && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </motion.article>
  );
}
