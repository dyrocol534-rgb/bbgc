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
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-zinc-500">
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            title={`Edit ${label}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {editContent}
          <div className="flex gap-1.5 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {value || <span className="italic text-zinc-600 text-xs">{emptyText}</span>}
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
    <div className="space-y-5">
      <FieldRow
        icon={<Phone className="w-3 h-3" />}
        label="Phone"
        value={phone}
        isEditing={isEditingPhone}
        isLoading={isPhoneLoading}
        onEdit={() => { setTempPhone(phone); setIsEditingPhone(true); }}
        onSave={handleSavePhone}
        onCancel={() => { setTempPhone(phone); setIsEditingPhone(false); }}
        emptyText="No phone number set."
        editContent={
          <input
            type="tel"
            value={tempPhone}
            onChange={(e) => setTempPhone(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            placeholder="+1 (555) 000-0000"
            autoFocus
          />
        }
      />

      <div className="h-px bg-zinc-800/50" />

      <FieldRow
        icon={<AlignLeft className="w-3 h-3" />}
        label="About Me"
        value={bio}
        isEditing={isEditingBio}
        isLoading={isBioLoading}
        onEdit={() => { setTempBio(bio); setIsEditingBio(true); }}
        onSave={handleSaveBio}
        onCancel={() => { setTempBio(bio); setIsEditingBio(false); }}
        emptyText="No bio provided yet."
        editContent={
          <textarea
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors min-h-[90px] resize-none"
            placeholder="Write something about yourself…"
            autoFocus
          />
        }
      />

      <div className="h-px bg-zinc-800/50" />

      {/* Account Settings / Danger Zone */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
          <ShieldAlert className="w-3 h-3 text-red-400/80" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Account Settings</span>
        </div>
        
        <button
          onClick={() => {
            setShowDeleteModal(true);
            setDeleteConfirmationText("");
            setDeleteError("");
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-800/40 hover:border-red-700/60 rounded-xl transition-all shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Account & Data
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 border border-red-900/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Account</h3>
                <p className="text-xs text-zinc-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-xs text-zinc-300 space-y-1.5">
              <p className="font-semibold text-red-300">The following data will be permanently wiped:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
                <li>Your profile details, phone, and bio</li>
                <li>Earned XP, leaderboards, and streak progress</li>
                <li>Favorites and gameplay history</li>
                <li>Account credentials and login sessions</li>
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
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none font-mono"
                autoFocus
              />
              {deleteError && (
                <p className="text-xs text-red-400 font-medium">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:text-zinc-600 rounded-xl transition-all shadow-sm"
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

