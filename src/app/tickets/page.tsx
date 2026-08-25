"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket, CheckCircle2, GitBranch } from "lucide-react";
import { useApp } from "@/lib/context";
import type { StoredTicket } from "@/lib/types";

function TicketRow({ ticket }: { ticket: StoredTicket }) {
  const isSplit = ticket.isSplit || ticket.status === "SPLIT_CONFIRMED";
  return (
    <div className="rounded-2xl bg-[#1F2740] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isSplit ? "bg-[#E8A33D]/20 text-[#E8A33D]" : "bg-[#3F8F5F]/20 text-[#3F8F5F]"}`}>
            {isSplit ? "SPLIT TICKET" : "DIRECT"}
          </span>
          <div className="flex items-center gap-1 text-[#3F8F5F]">
            {isSplit ? <GitBranch className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span className="font-mono text-[10px] font-bold">{ticket.status.replace("_", " ")}</span>
          </div>
        </div>
        <p className="font-semibold text-[#F3EDE0] leading-tight">{ticket.route}</p>
        <p className="mt-1 font-mono text-[11px] text-[#B9BDD1]/60 leading-tight">{ticket.train}</p>
        {ticket.note && <p className="mt-2 text-[11px] text-[#B9BDD1]/50 italic">{ticket.note}</p>}
      </div>
      <div className="relative border-t border-dashed border-white/10">
        <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-[#151B2E]" />
        <div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-[#151B2E]" />
      </div>
      <div className="bg-[#2A3454] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] text-[#B9BDD1]/50 font-mono">DATE</p>
            <p className="text-xs font-semibold text-[#F3EDE0]">{ticket.date}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#B9BDD1]/50 font-mono">CLASS</p>
            <p className="text-xs font-semibold text-[#F3EDE0]">{ticket.class}</p>
          </div>
        </div>
        {ticket.farePaid && (
          <p className="font-mono text-sm font-bold text-[#E8A33D]">₹{ticket.farePaid.toLocaleString("en-IN")}</p>
        )}
      </div>
      {ticket.pnr && (
        <div className="px-4 pb-3 bg-[#2A3454]">
          <p className="font-mono text-[10px] text-[#B9BDD1]/40">{ticket.pnr}</p>
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
        className="flex min-h-screen flex-col items-center justify-center px-5">
        <Ticket className="h-12 w-12 text-[#B9BDD1]/30 mb-4" />
        <p className="text-[#B9BDD1] mb-2 text-center">Sign in to view your tickets</p>
        <p className="text-xs text-[#B9BDD1]/50 mb-6 text-center">Login is available when you tap Book on a confirmed route</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#1C2B4A]">← Search routes</button>
      </motion.main>
    );
  }

  const tickets = loggedInAccount.tickets;

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-8 pt-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#B9BDD1] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">MY TICKETS</span>
      </div>
      <h1 className="font-serif text-2xl font-semibold">{loggedInAccount.name}</h1>
      <p className="mt-1 text-xs text-[#B9BDD1]/60">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} in this session</p>

      {tickets.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <Ticket className="h-12 w-12 text-[#B9BDD1]/20 mb-4" />
          <p className="text-[#B9BDD1]">No tickets yet</p>
          <p className="text-xs text-[#B9BDD1]/50 mt-1">First-time traveller? Book your first journey below.</p>
          <button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#1C2B4A]">
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

      <button onClick={() => router.push("/")} className="mt-6 w-full py-3 text-sm text-[#B9BDD1] hover:text-[#F3EDE0]">
        ← Search more routes
      </button>
    </motion.main>
  );
}
