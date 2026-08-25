"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, Ticket, Activity } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "My Trips", icon: Ticket, path: "/tickets" },
    { label: "Status", icon: Activity, path: "/journey" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-black/95 backdrop-blur-md border-t border-[#E8A33D]/25 py-2.5 px-8 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
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
  );
}
