"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, Ticket, Activity, TrainFront, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "My Trips", icon: Ticket, path: "/tickets" },
    { label: "Status", icon: Activity, path: "/journey" },
  ];

  return (
    <>
      {/* ── Top Header Navigation (Desktop: md and up) ────────────────────── */}
      <header className="hidden md:flex sticky top-0 z-50 w-full items-center justify-between border-b border-[#E8A33D]/20 bg-black/90 px-8 py-3.5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
        {/* Brand logo / wordmark */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 text-left transition hover:opacity-90 active:scale-[0.99]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8A33D]/80 bg-[#080808] shadow-[0_0_12px_rgba(232,163,61,0.4)]">
            <TrainFront className="h-5 w-5 text-[#E8A33D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white tracking-tight leading-none">
                घर वापसी
              </span>
              <span className="rounded-full border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-2 py-0.5 text-[9px] font-mono font-bold text-[#E8A33D]">
                PROTOTYPE
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#E8A33D]/80 tracking-widest uppercase">
              Waitlist Route Optimizer
            </p>
          </div>
        </button>

        {/* Center Nav tabs */}
        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-[#080808] p-1.5 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);

            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#E8A33D] text-black shadow-[0_0_12px_rgba(232,163,61,0.5)] scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-black" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right status badge */}
        <div className="flex items-center gap-2 rounded-full border border-[#3F8F5F]/40 bg-[#3F8F5F]/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3F8F5F] animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-[#3F8F5F] tracking-wide">
            PRS Quota Engine Active
          </span>
        </div>
      </header>

      {/* ── Bottom Tab Bar (Mobile: below md only) ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-black/95 backdrop-blur-md border-t border-[#E8A33D]/25 py-2.5 px-8 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className="flex-1 flex flex-col items-center justify-center py-1 relative transition-colors duration-200"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive
                      ? "text-[#E8A33D] drop-shadow-[0_0_10px_rgba(232,163,61,0.8)] scale-105"
                      : "text-[#475569] hover:text-[#94A3B8]"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-mono mt-1 tracking-tight transition-colors duration-200 ${
                  isActive ? "text-[#E8A33D] font-bold" : "text-[#475569]"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-[#E8A33D] rounded-full shadow-[0_0_8px_#E8A33D]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
