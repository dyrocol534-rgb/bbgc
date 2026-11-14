"use client";

import { useState } from "react";
import axios from "axios";
import { Edit2, Check, X, Loader2, Phone, AlignLeft } from "lucide-react";

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
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
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
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 rounded-full transition-all cursor-pointer"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 active:scale-95 rounded-full transition-all disabled:opacity-60 shadow-sm cursor-pointer"
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
    </div>
  );
}

