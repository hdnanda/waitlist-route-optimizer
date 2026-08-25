"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Share2, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context";

export default function ConfirmationPage() {
  const router = useRouter();
  const { state } = useApp();
  const { currentBooking, loggedInAccount } = state;

  if (!currentBooking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 bg-black text-white">
        <p className="text-slate-400 mb-4 font-mono text-sm">No booking found.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_14px_rgba(232,163,61,0.45)]">← Home</button>
      </div>
    );
  }

  return (
    <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="relative flex min-h-screen flex-col items-center px-5 pb-16 pt-10 bg-black text-white">
      {/* Success icon */}
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3F8F5F]/15 border border-[#3F8F5F]/60 shadow-[0_0_24px_rgba(63,143,95,0.45)]">
        <CheckCircle2 className="h-14 w-14 text-[#3F8F5F]" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-center mt-5">
        <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#3F8F5F]">CONFIRMED (SIMULATED)</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold text-white">
          {currentBooking.isSplit ? "Both legs secured." : "You're going home."}
        </h1>
        <p className="mt-2 text-sm text-slate-300">{currentBooking.route}</p>
        {loggedInAccount && (
          <p className="mt-1 text-xs font-mono text-slate-500">Booked for {currentBooking.passengerName ?? loggedInAccount.name}</p>
        )}
      </motion.div>

      {/* PNR card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 w-full rounded-2xl bg-[#080808] border border-[#E8A33D]/70 shadow-[0_0_16px_rgba(232,163,61,0.3)] overflow-hidden">
        <div className="p-5 bg-[#080808]">
          <p className="font-mono text-[10px] font-bold tracking-widest text-[#E8A33D]">MOCK PNR</p>
          <p className="mt-2 font-mono text-xl font-bold tracking-wide text-white">{currentBooking.pnr}</p>
          <p className="mt-1 text-xs font-mono text-slate-400">
            {currentBooking.isSplit ? "Split ticket · 2 legs · Both CONFIRMED" : "Direct booking · CONFIRMED"}
          </p>
        </div>

        <div className="relative border-t border-dashed border-[#E8A33D]/40">
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-black border-r border-[#E8A33D]/40" />
          <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black border-l border-[#E8A33D]/40" />
        </div>

        <div className="bg-[#0E0E0E] p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-[10px] text-slate-500 font-mono">TRAIN</p><p className="mt-0.5 text-white font-semibold text-xs leading-tight">{currentBooking.train}</p></div>
            <div><p className="text-[10px] text-slate-500 font-mono">DATE</p><p className="mt-0.5 text-white font-semibold">{currentBooking.date}</p></div>
            <div><p className="text-[10px] text-slate-500 font-mono">CLASS</p><p className="mt-0.5 text-white font-semibold">{currentBooking.class}</p></div>
            <div><p className="text-[10px] text-slate-500 font-mono">FARE PAID</p><p className="mt-0.5 font-mono text-[#E8A33D] font-bold">₹{(currentBooking.farePaid ?? 0).toLocaleString("en-IN")}</p></div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-6 w-full space-y-3">
        <button onClick={() => router.push("/journey")}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250]">
          View journey dashboard <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button onClick={() => router.push("/tickets")}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#080808] border border-[#E8A33D]/50 text-sm font-bold text-white transition hover:bg-[#121212]">
          My Tickets
        </button>
        <button onClick={() => router.push("/")}
          className="w-full py-2.5 text-sm font-mono text-slate-400 hover:text-white transition">
          ← Book another journey
        </button>
      </motion.div>

      <button className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 transition">
        <Share2 className="h-3.5 w-3.5" /> Share itinerary (mock)
      </button>
    </motion.main>
  );
}
