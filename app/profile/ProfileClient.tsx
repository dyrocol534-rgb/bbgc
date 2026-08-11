"use client";

import { useState } from "react";
import axios from "axios";
import { Edit2, Check, X, Loader2, Phone, AlignLeft } from "lucide-react";

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
    </div>
  );
}
