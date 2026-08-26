"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket, CheckCircle2, GitBranch } from "lucide-react";
import { useApp } from "@/lib/context";
import type { StoredTicket } from "@/lib/types";

function TicketRow({ ticket }: { ticket: StoredTicket }) {
  const isSplit = ticket.isSplit || ticket.status === "SPLIT_CONFIRMED";
  return (
    <div className="rounded-2xl bg-[#080808] border border-[#E8A33D]/60 shadow-[0_0_12px_rgba(232,163,61,0.25)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${isSplit ? "bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/40" : "bg-[#3F8F5F]/20 text-[#3F8F5F] border border-[#3F8F5F]/40"}`}>
            {isSplit ? "SPLIT TICKET" : "DIRECT"}
          </span>
          <div className="flex items-center gap-1 text-[#3F8F5F]">
            {isSplit ? <GitBranch className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span className="font-mono text-[10px] font-bold">{ticket.status.replace("_", " ")}</span>
          </div>
        </div>
        <p className="font-bold text-white leading-tight">{ticket.route}</p>
        <p className="mt-1 font-mono text-[11px] text-slate-400 leading-tight">{ticket.train}</p>
        {ticket.note && <p className="mt-2 text-[11px] text-slate-400 italic">{ticket.note}</p>}
      </div>
      <div className="relative border-t border-dashed border-[#E8A33D]/30">
        <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-black border-r border-[#E8A33D]/40" />
        <div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-black border-l border-[#E8A33D]/40" />
      </div>
      <div className="bg-[#0E0E0E] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-slate-500 font-mono">DATE</p>
            <p className="text-xs font-semibold text-white">{ticket.date}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono">CLASS</p>
            <p className="text-xs font-semibold text-white">{ticket.class}</p>
          </div>
        </div>
        {ticket.farePaid && (
          <p className="font-mono text-sm font-bold text-[#E8A33D]">₹{ticket.farePaid.toLocaleString("en-IN")}</p>
        )}
      </div>
      {ticket.pnr && (
        <div className="px-4 pb-3 bg-[#0E0E0E]">
          <p className="font-mono text-[10px] text-slate-500">{ticket.pnr}</p>
        </div>
      )}
    </div>
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
