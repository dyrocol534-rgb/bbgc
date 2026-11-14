"use client";

import { create } from "zustand";

export interface ShareData {
  title?: string;
  thumbnailUrl?: string;
  category?: string;
  slug?: string;
  url?: string;
}

interface UIStore {
  // Navigation sidebar drawer (Mobile / Collapsible)
  isNavSidebarOpen: boolean;
  openNavSidebar: () => void;
  closeNavSidebar: () => void;
  toggleNavSidebar: () => void;
  setNavSidebarOpen: (open: boolean) => void;

  // Global Share Modal
  isShareModalOpen: boolean;
  shareData: ShareData | null;
  openShareModal: (data?: ShareData) => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Navigation Drawer state
  isNavSidebarOpen: false,
  openNavSidebar: () => set({ isNavSidebarOpen: true }),
  closeNavSidebar: () => set({ isNavSidebarOpen: false }),
  toggleNavSidebar: () => set((state) => ({ isNavSidebarOpen: !state.isNavSidebarOpen })),
  setNavSidebarOpen: (open: boolean) => set({ isNavSidebarOpen: open }),

  // Share Modal state
  isShareModalOpen: false,
  shareData: null,
  openShareModal: (data) => set({ isShareModalOpen: true, shareData: data ?? null }),
  closeShareModal: () => set({ isShareModalOpen: false, shareData: null }),
}));
