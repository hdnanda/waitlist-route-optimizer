"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Sparkles } from "lucide-react";

interface CustomDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
  selectedDate?: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const FESTIVAL_TAGS: Record<string, string> = {
  "10-1": "Diwali",     // 1 Nov (month is 0-indexed: 10 = Nov)
  "10-6": "Chhath",     // 6 Nov
  "11-25": "Xmas",      // 25 Dec
  "0-1": "New Year",    // 1 Jan
  "2-14": "Holi",       // 14 Mar
  "9-20": "Dussehra",   // 20 Oct
};

export default function CustomDatePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
}: CustomDatePickerModalProps) {
  const today = useMemo(() => new Date(), []);
  
  // Set initial view to current month or selected date month
  const [viewDate, setViewDate] = useState(() => {
    return new Date();
  });

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Navigation handlers
  const canGoPrev = useMemo(() => {
    return (
      currentYear > today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth > today.getMonth())
    );
  }, [currentMonth, currentYear, today]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
      festivalName?: string;
    }> = [];

    // Leading empty slots from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(currentYear, currentMonth, d);
      const isPast =
        thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday =
        thisDate.getFullYear() === today.getFullYear() &&
        thisDate.getMonth() === today.getMonth() &&
        thisDate.getDate() === today.getDate();
      
      const formattedForCheck = `${d} ${MONTH_SHORT[currentMonth]}`;
      const isSelected = selectedDate === formattedForCheck;

      const festKey = `${currentMonth}-${d}`;
      const festivalName = FESTIVAL_TAGS[festKey];

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday,
        isSelected,
        festivalName,
      });
    }

    return days;
  }, [currentMonth, currentYear, today, selectedDate]);

  const handlePickDay = (day: number) => {
    const monthStr = MONTH_SHORT[currentMonth];
    const formatted = `${day} ${monthStr}`;
    onSelectDate(formatted);
    onClose();
  };

  const handlePickFestival = (day: number, monthIdx: number) => {
    const monthStr = MONTH_SHORT[monthIdx];
    const formatted = `${day} ${monthStr}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-[360px] rounded-[24px] bg-[#0A0A0A] border border-[#E8A33D]/80 shadow-[0_0_35px_rgba(232,163,61,0.35)] p-5 text-white flex flex-col gap-4 z-10"
          >
            {/* Header: Title + Close */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#E8A33D]" />
                <span className="font-mono text-xs tracking-widest text-[#E8A33D] font-bold uppercase">
                  PICK TRAVEL DATE
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close calendar"
                className="h-7 w-7 rounded-full border border-white/15 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Month Navigation Row */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                  canGoPrev
                    ? "border-[#E8A33D]/60 text-[#E8A33D] hover:bg-[#E8A33D]/20 hover:scale-105 active:scale-95"
                    : "border-white/10 text-slate-600 cursor-not-allowed opacity-30"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <p className="font-serif text-base font-bold text-white tracking-wide">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </p>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="h-8 w-8 rounded-full border border-[#E8A33D]/60 text-[#E8A33D] hover:bg-[#E8A33D]/20 hover:scale-105 active:scale-95 flex items-center justify-center transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day of Week Labels */}
            <div className="grid grid-cols-7 text-center text-[11px] font-mono font-bold text-[#E8A33D] tracking-wider py-1 border-y border-white/5">
              {DAY_LABELS.map((d) => (
                <div key={d} className="py-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="h-10 w-full" />;
                }

                const { dayNumber, isPast, isToday, isSelected, festivalName } = item;

                return (
                  <button
                    key={`day-${dayNumber}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handlePickDay(dayNumber)}
                    className={`relative h-10 w-full rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? "bg-[#E8A33D] text-black shadow-[0_0_14px_rgba(232,163,61,0.7)] scale-105"
                        : isPast
                        ? "text-slate-600 cursor-not-allowed opacity-30"
                        : "text-white hover:bg-[#E8A33D] hover:text-black hover:shadow-[0_0_12px_rgba(232,163,61,0.5)] active:scale-95"
                    } ${isToday && !isSelected ? "ring-1 ring-[#E8A33D] text-[#E8A33D]" : ""}`}
                  >
                    <span>{dayNumber}</span>
                    {festivalName && (
                      <span
                        className={`text-[8px] font-sans font-normal leading-none truncate max-w-[90%] ${
                          isSelected ? "text-black font-bold" : "text-[#E8A33D]"
                        }`}
                      >
                        {festivalName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Festival / Popular Quick Shortcuts */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-[10px] font-mono text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#E8A33D]" />
                POPULAR DATES:
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePickFestival(1, 10)}
                  className="rounded-lg border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-2.5 py-1 text-[10px] font-mono text-[#E8A33D] hover:bg-[#E8A33D] hover:text-black transition"
                >
                  Diwali (1 Nov)
                </button>
                <button
                  type="button"
                  onClick={() => handlePickFestival(6, 10)}
                  className="rounded-lg border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-2.5 py-1 text-[10px] font-mono text-[#E8A33D] hover:bg-[#E8A33D] hover:text-black transition"
                >
                  Chhath (6 Nov)
                </button>
                <button
                  type="button"
                  onClick={() => handlePickFestival(25, 11)}
                  className="rounded-lg border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-2.5 py-1 text-[10px] font-mono text-[#E8A33D] hover:bg-[#E8A33D] hover:text-black transition"
                >
                  Xmas (25 Dec)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
