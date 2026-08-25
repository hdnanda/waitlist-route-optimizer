import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "घर वापसी — Waitlist Route Optimizer",
  description: "IRCTC redesign for Build What Moves India hackathon. Find confirmed alternatives when direct trains are waitlisted.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="mx-auto max-w-[430px] min-h-screen relative overflow-x-hidden bg-[#151B2E]">
            {/* Ambient glow orbs */}
            <div className="pointer-events-none fixed -right-24 -top-20 h-64 w-64 rounded-full bg-[#E8A33D]/8 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#3F8F5F]/8 blur-3xl" />
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
