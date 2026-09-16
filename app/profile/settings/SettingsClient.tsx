"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  BellRing, 
  Loader2, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Trash2, 
  AlertCircle,
  LogOut,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isPushSupported, getExistingSubscription, subscribeUserToPush, unsubscribeUserFromPush } from "@/lib/push-client";
import { signOut } from "next-auth/react";
import axios from "axios";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  // Push Notification State
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [permission, setPermission] = useState<string>("default");

  // Sound preference state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    // Check push support
    if (!isPushSupported()) {
      setIsSupported(false);
      return;
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }

    getExistingSubscription().then((sub) => {
      setIsSubscribed(!!sub);
    });

    // Read sound preference from localStorage
    const savedSound = localStorage.getItem("game_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (loadingNotif) return;
    setLoadingNotif(true);
    setNotifFeedback(null);

    try {
      if (isSubscribed) {
        const res = await unsubscribeUserFromPush();
        if (res.success) {
          setIsSubscribed(false);
          setNotifFeedback({ type: "info", message: "Notifications turned off. You will not receive game drops." });
        } else {
          setNotifFeedback({ type: "error", message: res.error || "Failed to disable notifications." });
        }
      } else {
        const res = await subscribeUserToPush();
        if (res.success) {
          setIsSubscribed(true);
          setNotifFeedback({ type: "success", message: "Notifications turned on! You will get streak alerts & game drops." });
        } else {
          setNotifFeedback({ type: "error", message: res.error || "Could not turn on notifications." });
        }
      }
    } catch {
      setNotifFeedback({ type: "error", message: "An unexpected error occurred while toggling notifications." });
    } finally {
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
      setLoadingNotif(false);
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem("game_sound_enabled", String(nextVal));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await axios.delete("/api/user/account");
      if (res.data.success) {
        setShowDeleteModal(false);
        await signOut({ callbackUrl: "/" });
      } else {
        setDeleteError(res.data.error || "Failed to delete account");
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || "An error occurred while deleting your account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* ── 1. Top Profile / Apple ID Card ── */}
      {user ? (
        <Link
          href="/profile"
          className="flex items-center justify-between p-4 rounded-[22px] bg-[#141416] hover:bg-[#18181c] border border-white/[0.07] transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/[0.12] bg-zinc-800 shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-base bg-gradient-to-tr from-orange-500 to-amber-500">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                  {user.name || "Gamer"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              <span className="text-xs text-zinc-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
        </Link>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-[22px] bg-[#141416] border border-white/[0.07] shadow-sm">
          <div className="flex flex-col pr-4">
            <span className="text-[14px] font-semibold text-white">Guest Player</span>
            <span className="text-xs text-zinc-400">Sign in to sync streaks, XP, and settings across devices</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 text-black text-xs font-semibold shrink-0 transition-all shadow-sm active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* ── 2. Notifications Section (iOS Inset Group) ── */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
          Notifications &amp; Alerts
        </div>

        <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
          {/* Push Notifications Row */}
          <div 
            onClick={isSupported ? handleToggleNotifications : undefined}
            className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
              isSupported ? "hover:bg-white/[0.03] cursor-pointer" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                isSubscribed 
                  ? "bg-[#FF3B30] text-white" 
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {isSubscribed ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[14px] font-medium text-white tracking-tight flex items-center gap-2">
                  Push Notifications
                  {isSubscribed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight">
                  {isSupported ? "Streak expiration reminders & new game drops" : "Not supported in this browser"}
                </span>
              </div>
            </div>

            {/* iOS Switch */}
            {isSupported ? (
              <button
                type="button"
                role="switch"
                aria-checked={isSubscribed}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleNotifications();
                }}
                disabled={loadingNotif}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 touch-manipulation ${
                  isSubscribed ? "bg-[#34C759]" : "bg-[#39393D]"
                }`}
                title={isSubscribed ? "Disable notifications" : "Enable notifications"}
              >
                {loadingNotif ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  </span>
                ) : (
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isSubscribed ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                )}
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500 font-medium">Unavailable</span>
            )}
          </div>

          {/* Delivery Status Row */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[9px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[14px] font-medium text-white tracking-tight">Delivery Protocol</span>
                <span className="text-[11px] text-zinc-400">Web Push Standard (VAPID)</span>
              </div>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
              isSubscribed 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-zinc-800 text-zinc-400"
            }`}>
              {isSubscribed ? "Connected" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Feedback Alert if present */}
        {notifFeedback && (
          <div className={`mt-2.5 p-3 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            notifFeedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : notifFeedback.type === "error"
              ? "bg-red-500/10 border-red-500/25 text-red-300"
              : "bg-white/[0.04] border-white/[0.08] text-zinc-300"
          }`}>
            {notifFeedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : notifFeedback.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
            )}
            <span>{notifFeedback.message}</span>
          </div>
        )}

        {/* Browser Permission Blocked Alert */}
        {permission === "denied" && (
          <div className="mt-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Notifications Blocked by Browser
            </div>
            <p className="text-amber-200/80 text-[11px] leading-relaxed">
              Push permissions are currently blocked in your browser address bar. Tap the site settings or padlock icon next to the URL to allow notifications.
            </p>
          </div>
        )}

        <div className="text-[11px] text-zinc-500 px-3.5 mt-2">
          We send smart reminders before your daily streak expires and when major new games are published.
        </div>
      </div>

      {/* ── 3. Gameplay Preferences (iOS Inset Group) ── */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
          Audio &amp; Gameplay
        </div>

        <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
          {/* Sound FX Row */}
          <div 
            onClick={handleToggleSound}
            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                soundEnabled ? "bg-[#FF9500] text-white" : "bg-zinc-800 text-zinc-400"
              }`}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[14px] font-medium text-white tracking-tight">Game Sound &amp; Effects</span>
                <span className="text-[11px] text-zinc-400 leading-tight">In-game sound effects &amp; audio</span>
              </div>
            </div>

            {/* iOS Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSound();
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-manipulation ${
                soundEnabled ? "bg-[#34C759]" : "bg-[#39393D]"
              }`}
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Cloud Sync Row */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[9px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[14px] font-medium text-white tracking-tight">Cloud Progress Sync</span>
                <span className="text-[11px] text-zinc-400">
                  {user ? "Scores, XP and streaks backed up automatically" : "Guest mode — sign in to sync progress"}
                </span>
              </div>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
              user ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"
            }`}>
              {user ? "Active" : "Guest"}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 px-3.5 mt-2">
          Sound preferences are applied across all instant and arcade game sessions.
        </div>
      </div>

      {/* ── 4. Account Actions (iOS Inset Group) ── */}
      {user && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2">
            Account
          </div>

          <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
            {/* Sign Out Row */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.03] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-zinc-800 text-zinc-300 border border-white/[0.08] flex items-center justify-center shrink-0 shadow-sm group-hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[14px] font-medium text-zinc-200 group-hover:text-white transition-colors">
                    Sign Out
                  </span>
                  <span className="text-[11px] text-zinc-400">{user.email}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>

            {/* Delete Account Danger Row */}
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteConfirmationText("");
                setDeleteError("");
              }}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-red-500/[0.05] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[14px] font-medium text-[#FF453A]">
                    Delete Account &amp; Data
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Permanently wipe XP balance, streak records, and profile
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FF453A]/50 group-hover:text-[#FF453A] transition-colors" />
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 px-3.5 mt-2">
            Deleting your account is permanent. All accumulated rewards, leaderboard scores, and streak data will be lost.
          </div>
        </div>
      )}

      {/* ── 5. Play Store Section (AT THE VERY BOTTOM - UNIQUE & SIMPLE PREMIUM) ── */}
      <div className="pt-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 mb-2 flex items-center justify-between">
          <span>Android App</span>
          <span className="text-sky-400 flex items-center gap-1 normal-case font-normal text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Free on Google Play
          </span>
        </div>

        {/* Unique Companion App Showcase Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#161619] via-[#131316] to-[#0d0d0f] border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* App Branding & Badges */}
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Google Play Triangle App Icon */}
              <div className="w-12 h-12 rounded-[14px] bg-[#1a1a20] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group-hover:border-sky-500/40 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#32BBFF" d="M396.121 229.173 34.445 19.532C25.061 14.118 14.968 13.418 6.458 17.696L261.929 256 396.121 229.173z" />
                  <path fill="#32BBFF" d="m6.458 494.304 255.471-238.303L6.458 17.696C2.592 19.636 0 24.169 0 30.47v451.06c0 6.301 2.592 10.834 6.458 12.774z" />
                  <path fill="#FFD700" d="M419.978 274.638 396.121 261.17 261.929 256l134.192 26.827 23.857 13.469c11.27-6.408 11.27-15.25 0-21.658z" />
                  <path fill="#F3BC00" d="m396.121 282.827-361.676 209.64c9.084 5.203 19.018 4.66 27.547-.407L419.978 274.638 396.121 282.827z" />
                  <path fill="#00F076" d="M261.929 256 6.458 17.696c-1.054.516-2.058 1.142-2.993 1.89L261.929 256z" />
                  <path fill="#00DA65" d="M261.929 256 3.465 492.414c.934.748 1.939 1.374 2.993 1.89L261.929 256z" />
                  <path fill="#FF3A44" d="M419.978 237.362 61.992 19.26C53.463 14.192 43.529 13.65 34.445 19.532L261.929 256 419.978 237.362z" />
                  <path fill="#C31162" d="M261.929 256 34.445 492.468c9.084 5.882 19.018 5.34 27.547.272l358.986-218.103L261.929 256z" />
                </svg>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-white tracking-tight">
                    Bluebuff Games
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    ★ 4.8
                  </span>
                </div>
                <span className="text-xs text-zinc-400 mt-0.5">
                  Official Android App • Fullscreen &amp; Offline Play
                </span>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                    Instant Play
                  </span>
                  <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                    No Lag
                  </span>
                  <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-md">
                    Cloud Synced
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 text-black text-xs sm:text-sm font-semibold shadow-lg shadow-white/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              <span>Get on Google Play</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </a>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 px-3.5 mt-2">
          Designed specifically for Android devices. Get faster frame rates and home screen shortcuts.
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#18181b] border border-red-500/30 rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Delete Account</h3>
                <p className="text-xs text-zinc-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-[16px] p-3.5 text-xs text-zinc-300 space-y-1.5">
              <p className="font-semibold text-red-300">The following data will be permanently wiped:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 text-[11px]">
                <li>Your profile credentials and settings</li>
                <li>Accumulated XP, leaderboards, and streak progress</li>
                <li>Saved favorites and play history</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Type <span className="font-bold text-red-400 font-mono">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => {
                  setDeleteConfirmationText(e.target.value);
                  if (deleteError) setDeleteError("");
                }}
                placeholder="DELETE"
                className="w-full bg-[#121214] border border-white/[0.12] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 outline-none font-mono"
                autoFocus
              />
              {deleteError && (
                <p className="text-xs text-red-400 font-medium">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-full transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:text-zinc-600 rounded-full transition-all shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
