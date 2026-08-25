// â”€â”€ Shared types for the Waitlist Route Optimizer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type TrainClass = "1A" | "2A" | "3A" | "SL" | "CC";
export type BookingStatus = "CONFIRMED" | "WL" | "RAC";
export type OptionType = "DIRECT" | "SPLIT" | "NEARBY";

/** Output schema from the parser (OpenAI structured output + fallback) */
export interface ParsedIntent {
  origin: string;
  destination: string;
  date: string | null;
  passengerNote: string | null;
  /** Train class; null if not mentioned */
  class: TrainClass | null;
  /** high = model succeeded; low = deterministic fallback used */
  confidence: "high" | "low";
  /** true when result was served from in-memory demo cache */
  fromCache?: boolean;
  /** true when both model and fallback failed to identify origin+destination */
  parseError?: boolean;
}

export interface TrainLeg {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
}

export interface DatasetOption {
  type: OptionType;
  trainNumber: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  fare: number;
  status: BookingStatus;
  waitlistNumber?: number;
  splitStation?: string;
  splitLayoverMinutes?: number;
  nearbyStation?: string;
  nearbyDistanceKm?: number;
  leg1?: TrainLeg;
  leg2?: TrainLeg;
}

export interface RouteClassData {
  class: TrainClass;
  options: DatasetOption[];
}

export interface RouteData {
  generated?: boolean;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  aliases: { origin: string[]; destination: string[] };
  classes: RouteClassData[];
}

// â”€â”€ Engine output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ReasonedOption {
  id: string;
  type: OptionType;
  badge: string;
  badgeBg: string;
  route: string;
  meta: string;
  status: BookingStatus;
  statusDisplay: string;
  statusBg: string;
  confirmationLikelihood: string;
  why: string;
  isHero?: boolean;
  transferTag?: string;
  fare: number;
  trainNumber: string;
  trainName: string;
  isSplit?: boolean;
  leg1?: TrainLeg;
  leg2?: TrainLeg;
}

export interface OperationalStats {
  directAnalyzed: number;
  splitCombinations: number;
  maxLayoverMins: number;
}

export interface RouteResult {
  routeFound: boolean;
  originDisplay: string;
  destinationDisplay: string;
  selectedClass: TrainClass;
  trace: string[];
  options: ReasonedOption[];
  directStatus?: BookingStatus;
  directWL?: number;
  generated?: boolean;
  stats?: OperationalStats;
}

// â”€â”€ Auth / Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface StoredTicket {
  pnr: string;
  route: string;
  train: string;
  date: string;
  class: TrainClass;
  status: "CONFIRMED" | "SPLIT_CONFIRMED";
  note?: string;
  isSplit?: boolean;
  bookedAt: string;
  leg1?: TrainLeg;
  leg2?: TrainLeg;
  farePaid?: number;
  passengerName?: string;
}

export interface Account {
  mobileLast4: string;
  name: string;
  tickets: StoredTicket[];
}

