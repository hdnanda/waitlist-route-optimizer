"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Train, ArrowRight, UserCheck } from "lucide-react";
import { useApp } from "@/lib/context";
import BookingBreadcrumbs from "@/components/BookingBreadcrumbs";

export default function ReviewPage() {
  const router = useRouter();
  const { state } = useApp();
  const { selectedOption, parsedIntent, loggedInAccount } = state;

  useEffect(() => {
    if (!selectedOption || !parsedIntent || !loggedInAccount) {
      router.replace("/?notice=session-reset");
    }
  }, [selectedOption, parsedIntent, loggedInAccount, router]);

  if (!selectedOption || !parsedIntent || !loggedInAccount) {
    return null;
  }

  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative min-h-screen px-5 pb-16 pt-4 lg:pt-8 bg-transparent text-white w-full">
      <div className="w-full max-w-[480px] mx-auto">
        <BookingBreadcrumbs currentStep="review" />
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-4 w-4 text-[#E8A33D]" /> Back
        </button>

        <div className="flex items-center gap-2 text-[#E8A33D] mb-2">
          <Train className="h-4 w-4 drop-shadow-[0_0_6px_rgba(232,163,61,0.6)]" />
          <span className="font-mono text-[10px] tracking-wider font-bold uppercase">BOOKING REVIEW · MOCK</span>
        </div>
        <h1 className="font-serif text-2xl font-bold mb-6 text-white">Confirm your journey</h1>

        {/* Journey summary parchment ticket card */}
        <div
          className="rounded-[10px] overflow-hidden border-2 border-[#E8A33D] shadow-[0_8px_24px_rgba(232,163,61,0.25),0_6px_18px_rgba(0,0,0,0.28)]"
          style={{
            backgroundColor: "var(--paper, #F7EFE0)",
            color: "var(--text-on-paper, #1C2B4A)",
          }}
        >
          <div className="p-5" style={{ backgroundColor: "var(--paper, #F7EFE0)" }}>
            <p className="font-mono text-[10px] font-bold tracking-widest text-[#9C6110] mb-1">JOURNEY</p>
            <p className="font-serif text-xl font-bold text-[#1C2B4A]">{selectedOption.route}</p>
            <p className="mt-1 font-mono text-xs text-[#5B5342]">{selectedOption.meta}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${selectedOption.statusBg}`}>
                {selectedOption.statusDisplay}
              </span>
              <span className="text-xs font-mono text-[#5B5342] font-semibold">{selectedOption.type === "SPLIT" ? "Split ticket · 2 PNRs" : "Single ticket"}</span>
            </div>

            {/* Leg breakdown for split */}
            {selectedOption.isSplit && selectedOption.leg1 && selectedOption.leg2 && (
              <div className="mt-3.5 rounded-lg bg-[#EDE3CE] border border-[#D8CCB5] p-3 space-y-2">
                {[selectedOption.leg1, selectedOption.leg2].map((leg, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-[#1C2B4A]">
                    <span className="rounded bg-[#E8A33D] text-black px-1.5 py-0.5 font-bold shrink-0 text-[9px]">LEG {i + 1}</span>
                    <span className="truncate font-bold">{leg.from} → {leg.to}</span>
                    <span className="ml-auto shrink-0 text-[#5B5342]">{leg.departure}–{leg.arrival}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative h-0 w-full border-t border-dashed border-[#D6C8B0]">
            <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-black border-r border-[#D6C8B0]" />
            <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black border-l border-[#D6C8B0]" />
          </div>

          <div className="p-5" style={{ backgroundColor: "var(--paper-dim, #EDE3CE)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#5B5342]">TOTAL FARE</span>
              <span className="font-mono text-xl font-bold text-[#1C2B4A]">₹{selectedOption.fare.toLocaleString("en-IN")}</span>
            </div>

            <label className="text-xs font-mono font-bold tracking-[0.1em] text-[#9C6110] uppercase">
              PRIMARY PASSENGER
            </label>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-[#D8CCB5] bg-[#F7EFE0] px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-4 w-4 text-[#276F43]" />
                <div>
                  <p className="text-sm font-bold text-[#1C2B4A] leading-tight">{loggedInAccount.name}</p>
                  <p className="text-[10px] font-mono text-[#5B5342]">
                    +91 ••••••{loggedInAccount.mobileLast4} {loggedInAccount.age ? `• ${loggedInAccount.age} yrs` : ""}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#3F8F5F]/40 bg-[#3F8F5F]/15 px-2 py-0.5 text-[9px] font-mono font-bold text-[#276F43]">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Proceed CTA */}
        <button onClick={() => router.push("/payment")}
          className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] text-sm font-extrabold text-black shadow-[0_0_18px_rgba(232,163,61,0.5)] transition hover:bg-[#F0B250] active:scale-[0.99]">
          Pay &amp; Confirm <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>

        <p className="mt-3 text-center text-[11px] font-mono text-slate-600">
          Mock payment · No real transaction will occur
        </p>
      </div>
    </motion.main>
  );
}
