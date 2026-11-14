"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecentGameItem {
  slug: string;
  title: string;
  thumbnailUrl: string;
  category?: string[];
  playedAt?: number;
}

interface RecentGamesState {
  games: RecentGameItem[];
  isHydrated: boolean;

  // Actions
  addRecentGame: (game: RecentGameItem) => void;
  setRecentGames: (games: RecentGameItem[]) => void;
  clearRecentGames: () => void;
  fetchServerRecentGames: () => Promise<void>;
  setHydrated: (val: boolean) => void;
}

export const useRecentGamesStore = create<RecentGamesState>()(
  persist(
    (set, get) => ({
      games: [],
      isHydrated: false,

      addRecentGame: (game) => {
        set((state) => {
          // Remove if already in list to move it to position 0
          const filtered = state.games.filter((g) => g.slug !== game.slug);
          const newGame = {
            ...game,
            playedAt: Date.now(),
          };
          return { games: [newGame, ...filtered].slice(0, 15) };
        });
      },

      setRecentGames: (games) => {
        set({ games: games.slice(0, 15) });
      },

      clearRecentGames: () => {
        set({ games: [] });
      },

      fetchServerRecentGames: async () => {
        try {
          const res = await fetch("/api/user/recent");
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data?.games) && data.games.length > 0) {
            const serverGames: RecentGameItem[] = data.games.map((g: any) => ({
              slug: g.slug,
              title: g.title,
              thumbnailUrl: g.thumbnailUrl,
              category: g.category,
            }));

            set((state) => {
              const currentMap = new Map<string, RecentGameItem>();
              // Locally added/played games take top priority
              state.games.forEach((g) => currentMap.set(g.slug, g));
              // Merge server items not already in the local list
              serverGames.forEach((g) => {
                if (!currentMap.has(g.slug)) {
                  currentMap.set(g.slug, g);
                }
              });
              return { games: Array.from(currentMap.values()).slice(0, 15) };
            });
          }
        } catch (err) {
          console.error("Failed to sync recent games with server:", err);
        }
      },

      setHydrated: (val) => set({ isHydrated: val }),
    }),
    {
      name: "bluebuff_recent_games",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
