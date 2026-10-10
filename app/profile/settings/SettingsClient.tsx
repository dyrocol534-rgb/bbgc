"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  BellRing, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Trash2, 
  AlertCircle,
  LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isPushSupported, getExistingSubscription, subscribeUserToPush, unsubscribeUserFromPush } from "@/lib/push-client";
import { signOut } from "next-auth/react";
import axios from "axios";

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
    <div className="space-y-4">
      {/* ── 1. Top User Profile & Sync Status Bar ── */}
      {user ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-base bg-zinc-900">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white truncate">
                  {user.name || "Gamer"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              <span className="text-xs text-zinc-500 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/profile"
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-colors inline-flex items-center gap-1"
            >
              <span>View Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-900">
          <div className="flex flex-col pr-3">
            <span className="text-sm font-semibold text-white">Guest Player</span>
            <span className="text-xs text-zinc-500">Sign in to sync streaks, XP, and settings across devices</span>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold shrink-0 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* ── 2. Two-Column Settings Grid on Desktop (Full Width Utilization) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ── Left Column: Alerts, Audio & Gameplay Preferences ── */}
        <div className="space-y-4">
          {/* Notifications Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Notifications &amp; Alerts
            </div>

            <div className="bg-black rounded-xl border border-zinc-900 divide-y divide-zinc-900 overflow-hidden">
              {/* Push Notifications Row */}
              <div 
                onClick={isSupported ? handleToggleNotifications : undefined}
                className={`flex items-center justify-between p-3.5 transition-colors ${
                  isSupported ? "hover:bg-zinc-950 cursor-pointer" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSubscribed 
                      ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                  }`}>
                    {isSubscribed ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                      Push Notifications
                      {isSubscribed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </span>
                    <span className="text-xs text-zinc-500 leading-tight">
                      {isSupported ? "Streak reminders & new game drops" : "Not supported in this browser"}
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 touch-manipulation ${
                      isSubscribed ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                    title={isSubscribed ? "Disable notifications" : "Enable notifications"}
                  >
                    {loadingNotif ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                      </span>
                    ) : (
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          isSubscribed ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-zinc-500 font-medium">Unavailable</span>
                )}
              </div>
            </div>

            {/* Feedback Alert if present */}
            {notifFeedback && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                notifFeedback.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : notifFeedback.type === "error"
                  ? "bg-red-500/10 border-red-500/25 text-red-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300"
              }`}>
                {notifFeedback.type === "success" ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : notifFeedback.type === "error" ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                )}
                <span className="text-[11px]">{notifFeedback.message}</span>
              </div>
            )}

            {/* Browser Permission Blocked Alert */}
            {permission === "denied" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-[11.5px]">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Notifications Blocked by Browser
                </div>
                <p className="text-amber-200/80 text-[10.5px] leading-relaxed">
                  Push permissions are currently blocked in your browser address bar. Tap the site settings or padlock icon next to the URL to allow notifications.
                </p>
              </div>
            )}
          </div>

          {/* Gameplay Preferences */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Audio &amp; Gameplay
            </div>

            <div className="bg-black rounded-xl border border-zinc-900 divide-y divide-zinc-900 overflow-hidden">
              {/* Sound FX Row */}
              <div 
                onClick={handleToggleSound}
                className="flex items-center justify-between p-3.5 hover:bg-zinc-950 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    soundEnabled ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                  }`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-semibold text-white tracking-tight">Game Sound &amp; Effects</span>
                    <span className="text-xs text-zinc-500 leading-tight">In-game sound effects &amp; audio</span>
                  </div>
                </div>

                {/* Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSound();
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-manipulation ${
                    soundEnabled ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                  title={soundEnabled ? "Mute audio" : "Enable audio"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Platform Info */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Platform &amp; Cache
            </div>

            <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-3.5 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Game Engine Version</span>
                <span className="font-mono text-zinc-300">v1.0.4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cloud Save Status</span>
                <span className="text-emerald-400 font-medium">Active &amp; Synced</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sound Driver</span>
                <span className="font-mono text-zinc-300">HTML5 Audio / WebAudio</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Account Actions & Security ── */}
        <div className="space-y-4">
          {user && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
                Account Actions
              </div>

              <div className="bg-black rounded-xl border border-zinc-900 divide-y divide-zinc-900 overflow-hidden">
                {/* Sign Out Row */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-950 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        Sign Out
                      </span>
                      <span className="text-xs text-zinc-500">{user.email}</span>
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
                  className="w-full flex items-center justify-between p-3.5 hover:bg-red-500/[0.05] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-red-400">
                        Delete Account &amp; Data
                      </span>
                      <span className="text-xs text-zinc-500">
                        Permanently wipe XP balance, streak records, and profile
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
                </button>
              </div>

              <p className="text-xs text-zinc-600 px-1 pt-1">
                Deleting your account is permanent. All accumulated rewards, leaderboard scores, and streak data will be lost.
              </p>
            </div>
          )}

          {/* Quick Links Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Resources &amp; Support
            </div>

            <div className="bg-black rounded-xl border border-zinc-900 divide-y divide-zinc-900 overflow-hidden text-xs">
              <Link 
                href="/faq" 
                className="flex items-center justify-between p-3 hover:bg-zinc-950 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Frequently Asked Questions</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </Link>
              <Link 
                href="/privacy" 
                className="flex items-center justify-between p-3 hover:bg-zinc-950 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Privacy Policy</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </Link>
              <Link 
                href="/terms" 
                className="flex items-center justify-between p-3 hover:bg-zinc-950 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Terms of Service</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </Link>
            </div>
          </div>
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
