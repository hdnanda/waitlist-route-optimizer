export const CLASS_MULTIPLIER: Record<"1A" | "2A" | "3A" | "SL" | "CC", number> = {
  SL: 0.4,
  CC: 0.85,
  "3A": 1.0,
  "2A": 1.6,
  "1A": 2.6,
};

export function priceForClass(base3APrice: number, cls: "1A" | "2A" | "3A" | "SL" | "CC"): number {
  const mult = CLASS_MULTIPLIER[cls] ?? 1.0;
  return Math.round(base3APrice * mult);
}
