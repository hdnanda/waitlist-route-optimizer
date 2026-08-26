"use client";
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { ParsedIntent, ReasonedOption, TrainClass, Account, StoredTicket } from "./types";

// ── Hardcoded Seeded Accounts ───────────────────────────────────────────────
export const HARDCODED_ACCOUNTS: Account[] = [
  {
    mobileLast4: "4521",
    name: "Ramesh Kumar",
    age: 42,
    tickets: [
      {
        pnr: "MOCK-4827193056",
        route: "Delhi → Kanpur",
        train: "12034 Shatabdi Express",
        date: "14 Aug 2026",
        class: "CC" as TrainClass,
        status: "CONFIRMED",
        note: "Booked directly, no optimization needed",
        isSplit: false,
        bookedAt: "2026-08-10T09:15:00Z",
        farePaid: 895,
        passengerName: "Ramesh Kumar",
      } as StoredTicket,
    ],
  },
  {
    mobileLast4: "7789",
    name: "Priya Sharma",
    age: 29,
    tickets: [
      {
        pnr: "MOCK-7731925048",
        route: "Mumbai → Nagpur → Lucknow",
        train: "12591 Gorakhpur Express (Split)",
        date: "20 Sep 2026",
        class: "3A",
        status: "SPLIT_CONFIRMED",
        isSplit: true,
        bookedAt: "2026-09-14T14:30:00Z",
        farePaid: 2610,
        passengerName: "Priya Sharma",
        leg1: { trainNumber: "12591", trainName: "Gorakhpur Express", from: "Mumbai CSMT", to: "Nagpur", departure: "19:45", arrival: "08:20+1" },
        leg2: { trainNumber: "12591", trainName: "Gorakhpur Express", from: "Nagpur", to: "Lucknow", departure: "08:45+1", arrival: "18:30+2" },
      } as StoredTicket,
    ],
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
interface AppState {
  parsedIntent: ParsedIntent | null;
  selectedOption: ReasonedOption | null;
  selectedClass: TrainClass | null;
  loggedInAccount: Account | null;
  accounts: Account[];
  currentBooking: StoredTicket | null;
}

type Action =
  | { type: "SET_INTENT"; payload: ParsedIntent }
  | { type: "SET_OPTION"; payload: ReasonedOption }
  | { type: "SET_CLASS"; payload: TrainClass }
  | { type: "SET_ACCOUNT"; payload: Account }
  // SEED_ACCOUNTS populates the accounts list only — never auto-signs anyone in
  | { type: "SEED_ACCOUNTS"; payload: Account[] }
  // REGISTER_ACCOUNT registers AND signs in (explicit user action only)
  | { type: "REGISTER_ACCOUNT"; payload: Account }
  | { type: "SET_BOOKING"; payload: StoredTicket }
  | { type: "ADD_TICKET"; payload: StoredTicket }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_INTENT":
      return { ...state, parsedIntent: action.payload, selectedClass: action.payload.class };
    case "SET_OPTION":
      return { ...state, selectedOption: action.payload };
    case "SET_CLASS":
      return { ...state, selectedClass: action.payload };
    case "SET_ACCOUNT":
      // Explicit login — sets loggedInAccount
      return { ...state, loggedInAccount: action.payload };
    case "SEED_ACCOUNTS": {
      // Merges incoming accounts into the accounts list WITHOUT changing loggedInAccount
      const merged = [...state.accounts];
      for (const incoming of action.payload) {
        const idx = merged.findIndex((a) => a.mobileLast4 === incoming.mobileLast4);
        if (idx >= 0) {
          merged[idx] = incoming;
        } else {
          merged.push(incoming);
        }
      }
      return { ...state, accounts: merged };
    }
    case "REGISTER_ACCOUNT": {
      // Called only on explicit sign-up — adds to accounts AND signs in
      const exists = state.accounts.some((a) => a.mobileLast4 === action.payload.mobileLast4);
      const accounts = exists
        ? state.accounts.map((a) => (a.mobileLast4 === action.payload.mobileLast4 ? action.payload : a))
        : [...state.accounts, action.payload];
      return { ...state, loggedInAccount: action.payload, accounts };
    }
    case "SET_BOOKING":
      return { ...state, currentBooking: action.payload };
    case "ADD_TICKET": {
      if (!state.loggedInAccount) return state;
      const alreadyHas = state.loggedInAccount.tickets.some(
        (t) => t.pnr === action.payload.pnr || (t.route === action.payload.route && t.train === action.payload.train && t.date === action.payload.date)
      );
      if (alreadyHas) {
        return { ...state, currentBooking: action.payload };
      }
      const updated = {
        ...state.loggedInAccount,
        tickets: [action.payload, ...state.loggedInAccount.tickets],
      };
      const accounts = state.accounts.map((a) =>
        a.mobileLast4 === updated.mobileLast4 ? updated : a
      );
      return { ...state, loggedInAccount: updated, accounts, currentBooking: action.payload };
    }
    case "RESET":
      return { ...state, parsedIntent: null, selectedOption: null, selectedClass: null };
    default:
      return state;
  }
}

function loadAccounts(): Account[] | null {
  try {
    const raw = sessionStorage.getItem("railpravesh_accounts");
    if (raw) return JSON.parse(raw) as Account[];
  } catch {}
  return null;
}

function saveAccounts(accounts: Account[]) {
  try { sessionStorage.setItem("railpravesh_accounts", JSON.stringify(accounts)); } catch {}
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  setParsedIntent: (intent: ParsedIntent) => void;
  setSelectedOption: (option: ReasonedOption) => void;
  setSelectedClass: (cls: TrainClass) => void;
  setLoggedInAccount: (account: Account) => void;
  registerAccount: (account: Account) => void;
  addTicket: (ticket: StoredTicket) => void;
  setCurrentBooking: (ticket: StoredTicket) => void;
  reset: () => void;
  findAccount: (mobileLast4: string) => Account | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    parsedIntent: null,
    selectedOption: null,
    selectedClass: null,
    loggedInAccount: null,  // Always starts as null — user must explicitly sign in
    accounts: HARDCODED_ACCOUNTS.map((a) => ({ ...a, tickets: [...a.tickets] })),
    currentBooking: null,
  });

  // On mount: hydrate accounts list from sessionStorage (no auto-login)
  useEffect(() => {
    const stored = loadAccounts();
    if (stored && stored.length > 0) {
      dispatch({ type: "SEED_ACCOUNTS", payload: stored });
    }
  }, []);

  // Persist accounts whenever they change
  useEffect(() => {
    saveAccounts(state.accounts);
  }, [state.accounts]);

  const setParsedIntent = (intent: ParsedIntent) => dispatch({ type: "SET_INTENT", payload: intent });
  const setSelectedOption = (option: ReasonedOption) => dispatch({ type: "SET_OPTION", payload: option });
  const setSelectedClass = (cls: TrainClass) => dispatch({ type: "SET_CLASS", payload: cls });
  // setLoggedInAccount is called after successful OTP — explicit login
  const setLoggedInAccount = (account: Account) => dispatch({ type: "SET_ACCOUNT", payload: account });
  // registerAccount is called for new sign-ups — also signs in
  const registerAccount = (account: Account) => dispatch({ type: "REGISTER_ACCOUNT", payload: account });
  const addTicket = (ticket: StoredTicket) => dispatch({ type: "ADD_TICKET", payload: ticket });
  const setCurrentBooking = (ticket: StoredTicket) => dispatch({ type: "SET_BOOKING", payload: ticket });
  const reset = () => dispatch({ type: "RESET" });

  const findAccount = (mobileLast4: string): Account | undefined => {
    return state.accounts.find((a) => a.mobileLast4 === mobileLast4);
  };

  return (
    <AppContext.Provider value={{
      state, setParsedIntent, setSelectedOption, setSelectedClass,
      setLoggedInAccount, registerAccount, addTicket, setCurrentBooking, reset, findAccount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
