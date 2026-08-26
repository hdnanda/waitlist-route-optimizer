import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "घर वापसी — Waitlist Route Optimizer",
  description: "Stuck on a train waitlist? We look beyond the direct queue to discover confirmed split-ticket quotas and alternate station connections.",
  openGraph: {
    title: "घर वापसी — Waitlist Route Optimizer",
    description: "Stuck on a train waitlist? We look beyond the direct queue to discover confirmed split-ticket quotas and alternate station connections.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased selection:bg-[#E8A33D]/30 selection:text-white min-h-screen relative flex flex-col">
        <AppProvider>
          {/* ── Decorative Departure Board / Route Network Desktop Backdrop ─── */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.06]">
            {/* SVG Departure Board Schedule Grid & Railway Route lines */}
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="schedule-grid"
                  width="120"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="120" y2="0" stroke="#818CF8" strokeWidth="0.75" />
                  <line x1="0" y1="30" x2="120" y2="30" stroke="#818CF8" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="0" x2="0" y2="60" stroke="#818CF8" strokeWidth="0.5" />
                  <line x1="60" y1="0" x2="60" y2="60" stroke="#818CF8" strokeWidth="0.5" strokeDasharray="2 4" />
                </pattern>
                <pattern
                  id="route-lines"
                  width="400"
                  height="400"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 100 Q 150 50 250 200 T 380 350"
                    fill="none"
                    stroke="#E8A33D"
                    strokeWidth="1.2"
                  />
                  <circle cx="50" cy="100" r="4" fill="#E8A33D" />
                  <circle cx="250" cy="200" r="5" fill="#818CF8" />
                  <circle cx="380" cy="350" r="4" fill="#E8A33D" />
                  <path
                    d="M 350 40 Q 200 150 100 320"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#schedule-grid)" />
              <rect width="100%" height="100%" fill="url(#route-lines)" />
            </svg>
          </div>

          {/* Ambient Warm Amber Glow Orbs */}
          <div className="pointer-events-none fixed -right-24 -top-20 h-96 w-96 rounded-full bg-[#E8A33D]/10 blur-3xl" />
          <div className="pointer-events-none fixed -bottom-20 -left-16 h-80 w-80 rounded-full bg-[#818CF8]/5 blur-3xl" />

          {/* Responsive Header Navigation (TopNav on desktop, BottomNav on mobile) */}
          <Navigation />

          {/* Main App Container */}
          <div className="relative z-10 flex-1 w-full pb-16 md:pb-8 flex flex-col">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
