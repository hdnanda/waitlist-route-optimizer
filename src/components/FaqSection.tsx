"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck, Scale, Clock, RefreshCw, Layers } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  icon: typeof ShieldCheck;
  answer: string;
  badge: string;
}

const FAQS: FaqItem[] = [
  {
    id: "legal",
    question: "Is split-ticketing 100% legal on Indian Railways?",
    icon: Scale,
    badge: "RAILWAY CODE COMPLIANT",
    answer:
      "Yes, absolutely. Booking separate PRS tickets across intermediate segments on the same or connecting trains is fully authorized under Indian Railways Passenger Tariff Rules. Both generated PNRs are authentic, government-issued Indian Railway bookings.",
  },
  {
    id: "quota",
    question: "Why are seats available via split when the direct train is WL 50+?",
    icon: Layers,
    badge: "PRS QUOTA ARCHITECTURE",
    answer:
      "Indian Railways allocates berth inventory into independent segment pools (e.g. Remote Location Quota, Station Quotas, and End-to-End pools). When direct festival tickets sell out, intermediate segment quotas (e.g. Delhi to Kanpur, and Kanpur to Patna) frequently remain completely vacant.",
  },
  {
    id: "delays",
    question: "Do I have to switch trains or change platforms during a split ticket?",
    icon: Clock,
    badge: "ZERO TRANSFER RISK",
    answer:
      "No. All split-ticket options are issued on the exact same physical train and same berth. You remain seated throughout your journey without de-boarding. The split is purely an administrative PRS quota unlock across intermediate stations, eliminating connection and delay transfer risks.",
  },
  {
    id: "booking",
    question: "Do I have to make two separate payments for split tickets?",
    icon: ShieldCheck,
    badge: "UNIFIED CHECKOUT",
    answer:
      "No. RailPravesh bundles both legs into a single 1-tap checkout. Both PNRs are generated together and tracked in a synchronized, unified live Journey Dashboard.",
  },
  {
    id: "refunds",
    question: "What happens if a fallback waitlisted ticket doesn't confirm?",
    icon: RefreshCw,
    badge: "AUTOMATIC TDR REFUND",
    answer:
      "During chart preparation (4 hours before train departure), any unconfirmed fallback leg is automatically cancelled and refunded to your original payment method with zero manual paperwork.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full mt-10 pt-8 border-t border-white/10">
      {/* Header with emblem */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#E8A33D]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E8A33D]">
            FREQUENTLY ASKED QUESTIONS
          </span>
        </div>
        <span className="rounded-full border border-[#3F8F5F]/50 bg-[#3F8F5F]/15 px-2.5 py-0.5 text-[9px] font-mono font-bold text-[#3F8F5F]">
          VERIFIED BY RULES
        </span>
      </div>

      {/* Accordion list */}
      <div className="space-y-2.5">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-[#080808] border-[#E8A33D]/80 shadow-[0_0_18px_rgba(232,163,61,0.25)]"
                  : "bg-[#050505] border-white/10 hover:border-[#E8A33D]/50 hover:bg-[#080808]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="flex w-full items-center justify-between p-4 text-left cursor-pointer gap-3"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all mt-0.5 ${
                      isOpen
                        ? "border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D]"
                        : "border-white/10 bg-white/5 text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="inline-block rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#E8A33D] bg-[#E8A33D]/10 mb-1">
                      {faq.badge}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {faq.question}
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-300 border-t border-white/5">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
