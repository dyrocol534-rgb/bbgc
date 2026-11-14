"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PlayerPreferencesState {
  // Theater Mode (Expanded cinematic widescreen on desktop)
  isTheaterMode: boolean;
  toggleTheaterMode: () => void;
  setTheaterMode: (val: boolean) => void;

  // Sound / Audio Mute
  isMuted: boolean;
  toggleMuted: () => void;
  setMuted: (val: boolean) => void;

  // Mobile Orientation (Force Landscape)
  isForceLandscape: boolean;
  toggleForceLandscape: () => void;
  setForceLandscape: (val: boolean) => void;

  // Haptic Feedback
  isHapticsEnabled: boolean;
  toggleHaptics: () => void;
}

export const usePlayerPreferencesStore = create<PlayerPreferencesState>()(
  persist(
    (set) => ({
      isTheaterMode: false,
      toggleTheaterMode: () => set((state) => ({ isTheaterMode: !state.isTheaterMode })),
      setTheaterMode: (val) => set({ isTheaterMode: val }),

      isMuted: false,
      toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (val) => set({ isMuted: val }),

      isForceLandscape: false,
      toggleForceLandscape: () => set((state) => ({ isForceLandscape: !state.isForceLandscape })),
      setForceLandscape: (val) => set({ isForceLandscape: val }),

      isHapticsEnabled: true,
      toggleHaptics: () => set((state) => ({ isHapticsEnabled: !state.isHapticsEnabled })),
    }),
    {
      name: "bluebuff_player_preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
