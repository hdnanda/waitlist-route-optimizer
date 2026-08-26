"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket, CheckCircle2, GitBranch } from "lucide-react";
import { useApp } from "@/lib/context";
import type { StoredTicket } from "@/lib/types";

function TicketRow({ ticket }: { ticket: StoredTicket }) {
  const isSplit = ticket.isSplit || ticket.status === "SPLIT_CONFIRMED";
  return (
    <article
      className="ticket-card overflow-hidden rounded-[10px] border-2 border-[#E8A33D] shadow-[0_8px_24px_rgba(232,163,61,0.25),0_6px_18px_rgba(0,0,0,0.28)]"
      style={{
        backgroundColor: "var(--paper, #F7EFE0)",
        color: "var(--text-on-paper, #1C2B4A)",
      }}
    >
      {/* Top Section (Warm Cream) */}
      <div className="p-4" style={{ backgroundColor: "var(--paper, #F7EFE0)" }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="rounded-full bg-[#E8A33D] px-2.5 py-0.5 text-[10px] font-mono font-bold text-black">
            {isSplit ? "SPLIT TICKET" : "DIRECT"}
          </span>
          <div className="flex items-center gap-1 text-[#276F43]">
            {isSplit ? <GitBranch className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span className="font-mono text-[10px] font-bold tracking-wide">
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <h2 className="font-serif text-lg font-bold leading-snug text-[#1C2B4A]">
          {ticket.route}
        </h2>
        <p className="mt-1 font-mono text-[11px] leading-tight text-[#5B5342]">
          {ticket.train}
        </p>
        {ticket.note && (
          <p className="mt-2 font-mono text-[10.5px] text-[#7A6E58] italic bg-[#EDE3CE] px-2.5 py-1 rounded border border-[#D8CCB5]">
            {ticket.note}
          </p>
        )}
      </div>

      {/* Perforated Divider with dark background notches */}
      <div className="relative h-0 w-full border-t border-dashed border-[#D6C8B0]">
        <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-black border-r border-[#D6C8B0]" />
        <div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-black border-l border-[#D6C8B0]" />
      </div>

      {/* Lower Section (Slightly Darker Cream) */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--paper-dim, #EDE3CE)" }}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-[#5B5342] font-mono font-bold uppercase">DATE</p>
            <p className="text-xs font-bold text-[#1C2B4A]">{ticket.date}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#5B5342] font-mono font-bold uppercase">CLASS</p>
            <p className="text-xs font-bold text-[#1C2B4A]">{ticket.class}</p>
          </div>
        </div>
        {ticket.farePaid && (
          <div className="text-right">
            <p className="font-mono text-sm font-bold text-[#1C2B4A]">
              ₹{ticket.farePaid.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>
      {ticket.pnr && (
        <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between" style={{ backgroundColor: "var(--paper-dim, #EDE3CE)" }}>
          <p className="font-mono text-[10px] text-[#7A6E58] font-bold tracking-wider">
            PNR: {ticket.pnr}
          </p>
        </div>
      )}
    </article>
  );
}

export default function TicketsPage() {
  const router = useRouter();
  const { state } = useApp();
  const { loggedInAccount } = state;

  if (!loggedInAccount) {
    return (
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-5 bg-transparent text-white text-center w-full">
        <div className="max-w-[480px] mx-auto flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E8A33D]/40 bg-[#E8A33D]/10 mb-4 shadow-[0_0_20px_rgba(232,163,61,0.2)]">
            <Ticket className="h-8 w-8 text-[#E8A33D]/70" />
          </div>
          <p className="text-white font-bold text-lg mb-1">You are not signed in</p>
          <p className="text-sm text-slate-400 mb-1 max-w-[260px] leading-relaxed">
            Sign in to view your tickets.
          </p>
          <p className="text-xs text-slate-500 mb-6 max-w-[260px] leading-relaxed">
            Your sign-in happens automatically when you book a confirmed route.
          </p>
          <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_14px_rgba(232,163,61,0.45)] hover:bg-[#F0B250] transition">← Search routes</button>
        </div>
      </motion.main>
    );
  }

  const tickets = loggedInAccount.tickets;

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-4 lg:pt-8 bg-transparent text-white w-full">
      <div className="w-full max-w-[480px] md:max-w-xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
        </button>

        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">MY TICKETS</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-white">{loggedInAccount.name}</h1>
        <p className="mt-1 text-xs font-mono text-slate-400">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} in this session</p>

        {tickets.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <Ticket className="h-12 w-12 text-[#E8A33D]/20 mb-4" />
            <p className="text-white font-semibold">No tickets yet</p>
            <p className="text-xs text-slate-400 mt-1">First-time traveller? Book your first journey below.</p>
            <button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_14px_rgba(232,163,61,0.45)]">
              Find a route →
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {tickets.map((ticket, i) => (
              <motion.div key={ticket.pnr ?? i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <TicketRow ticket={ticket} />
              </motion.div>
            ))}
          </div>
        )}

        <button onClick={() => router.push("/")} className="mt-6 w-full py-3 text-sm font-mono text-slate-400 hover:text-white transition">
          ← Search more routes
        </button>
      </div>
    </motion.main>
  );
}
