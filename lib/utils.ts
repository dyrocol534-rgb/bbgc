import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type HapticType = "light" | "medium" | "heavy" | "success" | "warning";

/**
 * Native tactile vibration feedback for Android PWA and mobile devices
 */
export function triggerHaptic(type: HapticType = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    const { usePlayerPreferencesStore } = require("./stores/playerPreferencesStore");
    if (!usePlayerPreferencesStore.getState().isHapticsEnabled) return;
  } catch (e) {}
  try {
    switch (type) {
      case "light":
        navigator.vibrate(12);
        break;
      case "medium":
        navigator.vibrate(22);
        break;
      case "heavy":
        navigator.vibrate(35);
        break;
      case "success":
        navigator.vibrate([15, 40, 20]);
        break;
      case "warning":
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch (e) {
    // Graceful fallback on devices that silence vibration
  }
}
