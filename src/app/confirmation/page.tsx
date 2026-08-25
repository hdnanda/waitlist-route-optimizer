"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Share2 } from "lucide-react";
import { useApp } from "@/lib/context";

export default function ConfirmationPage() {
  const router = useRouter();
  const { state } = useApp();
  const { currentBooking, loggedInAccount } = state;

  if (!currentBooking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="text-[#B9BDD1] mb-4">No booking found.</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#1C2B4A]">← Home</button>
      </div>
    );
  }

  return (
    <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="relative flex min-h-screen flex-col items-center px-5 pb-8 pt-12">
      {/* Success icon */}
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3F8F5F]/20">
        <CheckCircle2 className="h-14 w-14 text-[#3F8F5F]" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-center mt-6">
        <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#3F8F5F]">CONFIRMED (SIMULATED)</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          {currentBooking.isSplit ? "Both legs secured." : "You're going home."}
        </h1>
        <p className="mt-2 text-sm text-[#B9BDD1]">{currentBooking.route}</p>
        {loggedInAccount && (
          <p className="mt-1 text-xs text-[#B9BDD1]/60">Booked for {currentBooking.passengerName ?? loggedInAccount.name}</p>
        )}
      </motion.div>

      {/* PNR card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-8 w-full rounded-2xl bg-[#1F2740] overflow-hidden">
        <div className="p-5">
          <p className="font-mono text-[10px] font-bold tracking-widest text-[#B9BDD1]/60">MOCK PNR</p>
          <p className="mt-2 font-mono text-xl font-bold tracking-wide text-[#F3EDE0]">{currentBooking.pnr}</p>
          <p className="mt-1 text-xs text-[#B9BDD1]/60">
            {currentBooking.isSplit ? "Split ticket · 2 legs · Both CONFIRMED" : "Direct booking · CONFIRMED"}
          </p>
        </div>

        <div className="relative border-t-2 border-dashed border-white/10">
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#151B2E]" />
          <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#151B2E]" />
        </div>

        <div className="bg-[#2A3454] p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-[10px] text-[#B9BDD1]/60 font-mono">TRAIN</p><p className="mt-0.5 text-[#F3EDE0] font-semibold text-xs leading-tight">{currentBooking.train}</p></div>
            <div><p className="text-[10px] text-[#B9BDD1]/60 font-mono">DATE</p><p className="mt-0.5 text-[#F3EDE0] font-semibold">{currentBooking.date}</p></div>
            <div><p className="text-[10px] text-[#B9BDD1]/60 font-mono">CLASS</p><p className="mt-0.5 text-[#F3EDE0] font-semibold">{currentBooking.class}</p></div>
            <div><p className="text-[10px] text-[#B9BDD1]/60 font-mono">FARE PAID</p><p className="mt-0.5 font-mono text-[#E8A33D] font-bold">₹{(currentBooking.farePaid ?? 0).toLocaleString("en-IN")}</p></div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-6 w-full space-y-3">
        <button onClick={() => router.push("/journey")}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#E8A33D] text-sm font-bold text-[#1C2B4A] transition hover:bg-[#f0b250]">
          View journey dashboard →
        </button>
        <button onClick={() => router.push("/tickets")}
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#1F2740] text-sm font-semibold text-[#F3EDE0] transition hover:bg-[#2A3454]">
          My Tickets
        </button>
        <button onClick={() => router.push("/")}
          className="w-full py-3 text-sm text-[#B9BDD1] hover:text-[#F3EDE0]">
          ← Book another journey
        </button>
      </motion.div>

      <button className="mt-4 flex items-center gap-1.5 text-xs text-[#B9BDD1]/50">
        <Share2 className="h-3.5 w-3.5" /> Share itinerary (mock)
      </button>
    </motion.main>
  );
}
