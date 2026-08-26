"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeartParticle {
  id: number;
  emoji: string;
  x: number; // percentage across screen (0 - 100)
  size: number; // font size in px
  duration: number; // fall duration in seconds
  delay: number; // start delay in seconds
  drift: number; // horizontal sway in px
}

const HEARTS = ["❤️", "💖", "💕", "💗", "💓", "💞", "✨", "💝"];

export default function HeartConfetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const generated: HeartParticle[] = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      x: Math.random() * 96 + 2, // 2% to 98%
      size: Math.floor(Math.random() * 18) + 18, // 18px to 36px
      duration: Math.random() * 1.2 + 1.6, // 1.6s to 2.8s
      delay: Math.random() * 0.4, // 0 to 0.4s
      drift: (Math.random() - 0.5) * 80, // sway left or right
    }));

    setParticles(generated);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Falling Heart Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 0,
                y: -50,
                x: `${p.x}vw`,
                scale: 0.6,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: "105vh",
                x: `calc(${p.x}vw + ${p.drift}px)`,
                scale: [0.6, 1.2, 1, 0.8],
                rotate: [-20, 20, -10, 15],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeInOut",
              }}
              style={{ fontSize: `${p.size}px` }}
              className="absolute select-none"
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Central Sweet Toast Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-24 left-1/2 -translate-x-1/2 rounded-full border border-pink-500/70 bg-[#0A0508]/90 backdrop-blur-md px-6 py-3 shadow-[0_0_30px_rgba(236,72,153,0.45)] text-center flex items-center gap-3"
          >
            <span className="text-xl animate-bounce">💖</span>
            <div>
              <p className="font-serif text-sm font-bold text-white tracking-wide">
                Direct Express to Dhruv&apos;s Heart
              </p>
              <p className="font-mono text-[10px] text-pink-400 font-semibold tracking-wider uppercase">
                BERTH CONFIRMED · PRIORITY CLEARANCE ❤️
              </p>
            </div>
            <span className="text-xl animate-bounce">💖</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
