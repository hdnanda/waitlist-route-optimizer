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
      className={`ticket-card overflow-hidden rounded-[10px] transition-all duration-200 ${
        option.isHero
          ? "border-2 border-[#E8A33D] shadow-[0_8px_24px_rgba(232,163,61,0.25),0_6px_18px_rgba(0,0,0,0.28)]"
          : "border border-[#D8CCB5] shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      }`}
      style={{
        backgroundColor: "var(--paper, #F7EFE0)",
        color: "var(--text-on-paper, #1C2B4A)",
      }}
    >
      {/* ── Top Section (Warm Cream Background) ──────────────────────────── */}
      <div className="p-5" style={{ backgroundColor: "var(--paper, #F7EFE0)" }}>
        {/* Badge row */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold tracking-wide text-white ${option.badgeBg}`}
          >
            {option.badge}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {option.transferTag && (
              <span className="rounded-full border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#9C6110]">
                {option.transferTag}
              </span>
            )}
            {option.isHero && (
              <ShieldCheck className="h-5 w-5 text-[#3F8F5F] drop-shadow-[0_0_4px_rgba(63,143,95,0.5)]" aria-label="Recommended option" />
            )}
          </div>
        </div>

        {/* Route */}
        <h2 className="route-title mt-3 font-serif text-xl font-bold leading-7 text-[#1C2B4A]">
          {option.route}
        </h2>
        <p className="meta-text mt-1 font-mono text-[11px] leading-4 text-[#5B5342]">
          {option.meta}
        </p>

        {/* Status + confidence row */}
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${option.statusBg}`}>
            {option.statusDisplay}
          </span>
          <span className="text-xs font-mono text-[#5B5342] font-semibold">
            {option.confirmationLikelihood}
          </span>
        </div>

        {/* Split legs (if applicable) */}
        {option.isSplit && option.leg1 && option.leg2 && (
          <div className="mt-3.5 rounded-lg bg-[#EDE3CE] border border-[#D8CCB5] p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]">
              <span className="rounded bg-[#E8A33D] text-black px-1.5 py-0.5 font-bold shrink-0 text-[9px]">
                LEG 1
              </span>
              <span className="leg-detail font-bold truncate">{option.leg1.from}</span>
              <span className="text-[#9C6110] font-bold">→</span>
              <span className="leg-detail font-bold truncate">{option.leg1.to}</span>
              <span className="meta-text ml-auto shrink-0 text-[#5B5342]">{option.leg1.departure}–{option.leg1.arrival}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]">
              <span className="rounded bg-[#E8A33D] text-black px-1.5 py-0.5 font-bold shrink-0 text-[9px]">
                LEG 2
              </span>
              <span className="leg-detail font-bold truncate">{option.leg2.from}</span>
              <span className="text-[#9C6110] font-bold">→</span>
              <span className="leg-detail font-bold truncate">{option.leg2.to}</span>
              <span className="meta-text ml-auto shrink-0 text-[#5B5342]">{option.leg2.departure}–{option.leg2.arrival}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Perforated divider (ticket-stub signature with dark background notches) ─ */}
      <div className="relative h-0 w-full border-t border-dashed border-[#D6C8B0]">
        <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-black border-r border-[#D6C8B0]" />
        <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black border-l border-[#D6C8B0]" />
      </div>

      {/* ── Lower section (Darker Cream Background) ─────────────────────────── */}
      <div className="why-section p-5" style={{ backgroundColor: "var(--paper-dim, #EDE3CE)" }}>
        {/* Fare */}
        <div className="flex items-center justify-between mb-2">
          <p className="why-label text-[10.5px] font-mono font-bold tracking-[0.07em] uppercase text-[#5B5342]">
            WHY THIS OPTION
          </p>
          <p className="font-mono text-base font-bold text-[#1C2B4A]">
            ₹{option.fare.toLocaleString("en-IN")}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-[#1C2B4A]">
          {option.why}
        </p>

        {/* Book Button (Dark Indigo Button punching through the Light Card / Muted Gray when Waitlisted) */}
        <button
          type="button"
          onClick={canBook ? onBook : undefined}
          disabled={!canBook}
          aria-disabled={!canBook}
          className={`book-button mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            canBook
              ? "bg-[#151B2E] text-[#F3EDE0] hover:bg-[#202945] shadow-[0_4px_14px_rgba(21,27,46,0.3)] cursor-pointer active:scale-[0.98]"
              : "bg-[#DDD2BA] text-[#8C7F69] border border-dashed border-[#C8BC9F] cursor-not-allowed opacity-60 pointer-events-none select-none"
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
          {canBook && <ArrowRight className="h-4 w-4 stroke-[2.5] text-[#F3EDE0]" />}
        </button>
      </div>
    </motion.article>
  );
}
