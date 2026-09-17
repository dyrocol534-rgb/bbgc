"use client";

import { useState } from "react";
import axios from "axios";
import { Edit2, Check, X, Loader2, Phone, AlignLeft, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";

interface ProfileClientProps {
  initialBio: string;
  initialPhone: string;
}

function FieldRow({
  iconBg,
  icon,
  label,
  value,
  isEditing,
  isLoading,
  editContent,
  onEdit,
  onSave,
  onCancel,
  emptyText,
}: {
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing: boolean;
  isLoading: boolean;
  editContent: React.ReactNode;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  emptyText: string;
}) {
  return (
    <div className="p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-[8px] ${iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2.5 space-y-2">
          {editContent}
          <div className="flex gap-1.5 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-full transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-60 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap pl-9">
          {value || <span className="italic text-zinc-500 text-xs">{emptyText}</span>}
        </p>
      )}
    </div>
  );
}

export default function ProfileClient({ initialBio, initialPhone }: ProfileClientProps) {
  const [bio, setBio] = useState(initialBio);
  const [phone, setPhone] = useState(initialPhone);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(initialBio);
  const [isBioLoading, setIsBioLoading] = useState(false);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(initialPhone);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleSaveBio = async () => {
    setIsBioLoading(true);
    try {
      const res = await axios.patch("/api/user/profile", { bio: tempBio });
      setBio(res.data.bio);
      setIsEditingBio(false);
    } catch {
      alert("Failed to update bio");
    } finally {
      setIsBioLoading(false);
    }
  };

  const handleSavePhone = async () => {
    setIsPhoneLoading(true);
    try {
      const res = await axios.patch("/api/user/profile", { phone: tempPhone });
      setPhone(res.data.phone);
      setIsEditingPhone(false);
    } catch {
      alert("Failed to update phone");
    } finally {
      setIsPhoneLoading(false);
    }
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
      {/* iOS Inset Group */}
      <div className="bg-[#141416] rounded-[22px] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-sm">
        <FieldRow
          iconBg="bg-[#34C759]"
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone Number"
          value={phone}
          isEditing={isEditingPhone}
          isLoading={isPhoneLoading}
          onEdit={() => { setTempPhone(phone); setIsEditingPhone(true); }}
          onSave={handleSavePhone}
          onCancel={() => { setTempPhone(phone); setIsEditingPhone(false); }}
          emptyText="No phone number configured."
          editContent={
            <input
              type="tel"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              className="w-full bg-[#121214] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/50 transition-colors"
              placeholder="+1 (555) 000-0000"
              autoFocus
            />
          }
        />

        <FieldRow
          iconBg="bg-[#5856D6]"
          icon={<AlignLeft className="w-3.5 h-3.5" />}
          label="About Bio"
          value={bio}
          isEditing={isEditingBio}
          isLoading={isBioLoading}
          onEdit={() => { setTempBio(bio); setIsEditingBio(true); }}
          onSave={handleSaveBio}
          onCancel={() => { setTempBio(bio); setIsEditingBio(false); }}
          emptyText="Write something about yourself…"
          editContent={
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              className="w-full bg-[#121214] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/50 transition-colors min-h-[85px] resize-none"
              placeholder="Tell others what you like to play…"
              autoFocus
            />
          }
        />
      </div>

      {/* Quick Action to Settings */}
      <div className="pt-1">
        <button
          onClick={() => {
            setShowDeleteModal(true);
            setDeleteConfirmationText("");
            setDeleteError("");
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-[18px] bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/20 hover:border-red-500/30 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-red-400 group-hover:text-red-300 transition-colors">
                Delete Account &amp; Data
              </span>
              <span className="text-[10px] text-zinc-500">Permanently erase progress</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-red-400/80 group-hover:text-red-400">
            Action ↗
          </span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
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
                <li>Your profile details, phone, and bio</li>
                <li>Earned XP, leaderboards, and streak progress</li>
                <li>Favorites and gameplay history</li>
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

