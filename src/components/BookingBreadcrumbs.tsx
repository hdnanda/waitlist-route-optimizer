"use client";

import { Check } from "lucide-react";

export type BookingStep = "results" | "review" | "payment" | "confirmation";

interface BookingBreadcrumbsProps {
  currentStep: BookingStep;
}

const STEPS: Array<{ id: BookingStep; label: string; number: number }> = [
  { id: "results", label: "Routes", number: 1 },
  { id: "review", label: "Passenger", number: 2 },
  { id: "payment", label: "Authorize", number: 3 },
  { id: "confirmation", label: "Confirmed", number: 4 },
];

export default function BookingBreadcrumbs({ currentStep }: BookingBreadcrumbsProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      aria-label="Booking progress"
      className="w-full max-w-md mx-auto mb-6 py-2.5 px-3.5 rounded-xl bg-[#080808]/90 border border-white/10 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
    >
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5">
                {/* Step indicator circle */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-all ${
                    isDone
                      ? "bg-[#3F8F5F] text-white shadow-[0_0_8px_rgba(63,143,95,0.6)]"
                      : isCurrent
                      ? "bg-[#E8A33D] text-black shadow-[0_0_10px_rgba(232,163,61,0.8)] scale-110"
                      : "bg-white/5 border border-white/10 text-slate-500"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : step.number}
                </div>

                {/* Step label */}
                <span
                  className={`text-[11px] font-mono tracking-tight transition-all ${
                    isCurrent
                      ? "font-bold text-[#E8A33D] drop-shadow-[0_0_6px_rgba(232,163,61,0.4)]"
                      : isDone
                      ? "font-medium text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-3 sm:w-5 rounded-full transition-all ${
                    idx < currentIndex ? "bg-[#3F8F5F]" : "bg-white/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
