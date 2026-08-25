# Route Expansion Prompt for Gemini

*Copy and paste everything below the line into a new Gemini prompt to generate data for new routes.*

---

## Context
I am building a "Waitlist Route Optimizer" prototype for an Indian Railways hackathon. The app helps users who are stuck on waitlisted (WL) tickets by calculating alternative ways to get to their destination, such as:
1. **Split-ticketing:** Breaking the journey at a major junction (e.g., A → B → C).
2. **Nearby stations:** Dropping the user at a station 20-30 km away from their target.

The app uses a hardcoded TypeScript dataset to simulate this engine. I need you to act as a realistic data generator to add a new route to my prototype. 

## Target Route
Please generate a realistic dataset entry for the following route:
**[INSERT ORIGIN CITY HERE] to [INSERT DESTINATION CITY HERE]**

## Required Types
Your output must perfectly match these TypeScript interfaces:

```typescript
type TrainClass = "1A" | "2A" | "3A" | "SL" | "CC";

interface TrainLeg {
  trainNumber: string;
  trainName: string;
  departureTime: string; // e.g. "14:00"
  arrivalTime: string;   // e.g. "22:00"
  dateOffset: number;    // 0 if same day, 1 if next day
  fromStation: string;
  toStation: string;
  class: TrainClass;
  status: string;        // e.g. "CONFIRMED", "WL 47", "RAC 12"
  price: number;
}

interface QuotaAvailability {
  station: string;
  distanceKm: number;
  status: string;
  priceDelta: number;
}

interface RouteOption {
  id: string;
  type: "DIRECT" | "SPLIT" | "NEARBY";
  legs: TrainLeg[];
  totalPrice: number;
  totalDurationHours: number;
  confidenceScore: number; // 0 to 100
  splitCity?: string;
  layoverHours?: number;
  nearbyStation?: QuotaAvailability;
}

interface RouteData {
  originCity: string;
  destinationCity: string;
  defaultClass: TrainClass;
  options: RouteOption[];
}
```

## Instructions for Generation
1. **Direct Route (Waitlisted):** Create 1 `DIRECT` option. Make it highly waitlisted (e.g., "WL 65") so the user needs an alternative.
2. **Split Route (Confirmed):** Create 1 `SPLIT` option. The user takes a train to a logical intermediate junction, has a 2-4 hour layover, and takes a second train to the final destination. Both legs should be "CONFIRMED". Ensure the times align logically.
3. **Nearby Station (Confirmed):** Create 1 `NEARBY` option. The train goes directly from the origin to a station within 50km of the destination. Status should be "CONFIRMED".
4. **Realism:** Use realistic Indian Railways train numbers (5 digits), actual train names, and realistic prices in INR.

Output **only** the TypeScript code for the `RouteData` object. Ensure it is ready to be appended to an array of routes.
