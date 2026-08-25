import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "घर वापसी — Waitlist Route Optimizer",
  description: "OLED Luxury IRCTC redesign. Find confirmed alternatives when direct trains are waitlisted.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased selection:bg-[#E8A33D]/30 selection:text-white">
        <AppProvider>
          <div className="mx-auto max-w-[430px] min-h-screen relative overflow-x-hidden bg-black flex flex-col border-x border-[#E8A33D]/10">
            {/* Subtle ambient warm amber glow orbs */}
            <div className="pointer-events-none fixed -right-24 -top-20 h-64 w-64 rounded-full bg-[#E8A33D]/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#E8A33D]/5 blur-3xl" />
            
            <div className="flex-1 pb-16">
              {children}
            </div>

            {/* Global Bottom Navigation */}
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
