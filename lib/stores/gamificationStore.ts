"use client";

import { create } from "zustand";

interface GamificationState {
  xp: number;
  streak: number;
  isInitialized: boolean;

  // Actions
  setStats: (stats: { xp?: number; streak?: number }) => void;
  setXp: (xp: number) => void;
  addXp: (amount: number) => void;
  deductXp: (amount: number) => void;
  setStreak: (streak: number) => void;
  initFromSession: (sessionUser: any) => void;
  fetchProfileStats: () => Promise<void>;
  checkDailyStreak: () => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xp: 0,
  streak: 0,
  isInitialized: false,

  setStats: (stats) =>
    set((state) => ({
      xp: stats.xp !== undefined ? stats.xp : state.xp,
      streak: stats.streak !== undefined ? stats.streak : state.streak,
      isInitialized: true,
    })),

  setXp: (xp) =>
    set({
      xp: Math.max(0, xp),
      isInitialized: true,
    }),

  addXp: (amount) =>
    set((state) => ({
      xp: state.xp + amount,
      isInitialized: true,
    })),

  deductXp: (amount) =>
    set((state) => ({
      xp: Math.max(0, state.xp - amount),
      isInitialized: true,
    })),

  setStreak: (streak) =>
    set({
      streak,
      isInitialized: true,
    }),

  initFromSession: (sessionUser) => {
    if (!sessionUser) return;
    const sessionXp = sessionUser.xp ?? 0;
    const sessionStreak = sessionUser.currentStreak ?? 0;

    set((state) => {
      // If store is not yet initialized, populate with session data
      if (!state.isInitialized) {
        return {
          xp: sessionXp,
          streak: sessionStreak,
          isInitialized: true,
        };
      }
      return {};
    });
  },

  fetchProfileStats: async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) {
        set({
          xp: data.xp ?? 0,
          streak: data.currentStreak ?? 0,
          isInitialized: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch fresh gamification stats:", err);
    }
  },

  checkDailyStreak: async () => {
    if (typeof window === "undefined") return;
    const hasChecked = sessionStorage.getItem("hasCheckedStreak");
    if (hasChecked) return;

    try {
      const res = await fetch("/api/user/streak", { method: "POST" });
      const data = await res.json();
      sessionStorage.setItem("hasCheckedStreak", "true");

      if (data?.success) {
        set((state) => ({
          xp: state.xp + (data.xpAwarded || 0),
          streak: data.currentStreak ?? state.streak,
          isInitialized: true,
        }));
      }
    } catch (err) {
      console.error("Failed to check daily streak:", err);
    }
  },
}));
