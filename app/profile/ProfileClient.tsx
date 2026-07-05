"use client";

import { useState } from "react";
import axios from "axios";
import { Edit2, Check, X, Loader2, Phone } from "lucide-react";

interface ProfileClientProps {
  initialBio: string;
  initialPhone: string;
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
    } catch (error) {
      console.error("Failed to update bio", error);
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
    } catch (error) {
      console.error("Failed to update phone", error);
      alert("Failed to update phone");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  const handleCancelPhone = () => {
    setTempPhone(phone);
    setIsEditingPhone(false);
  };

  return (
    <div className="w-full text-left space-y-6">
      {/* Phone Number Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-zinc-400" /> Phone Number
          </h3>
          {!isEditingPhone && (
            <button 
              onClick={() => setIsEditingPhone(true)}
              className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
              title="Edit Phone"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isEditingPhone ? (
          <div className="space-y-3">
            <input
              type="tel"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              className="w-full bg-surface-hover border border-border-main rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-primary-hover"
              placeholder="+1 (555) 000-0000"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={handleCancelPhone}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                disabled={isPhoneLoading}
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSavePhone}
                className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                disabled={isPhoneLoading}
              >
                {isPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 font-mono">
            {phone || <span className="italic text-zinc-600 font-sans">No phone number provided.</span>}
          </p>
        )}
      </div>

      <div className="w-full h-px bg-zinc-800/50"></div>

      {/* Bio Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">About Me</h3>
          {!isEditingBio && (
            <button 
              onClick={() => setIsEditingBio(true)}
              className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
              title="Edit Bio"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isEditingBio ? (
          <div className="space-y-3">
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              className="w-full bg-surface-hover border border-border-main rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-primary-hover min-h-[100px] resize-none"
              placeholder="Write something about yourself..."
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={handleCancelBio}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                disabled={isBioLoading}
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSaveBio}
                className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                disabled={isBioLoading}
              >
                {isBioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {bio || <span className="italic text-zinc-600">No bio provided yet.</span>}
          </p>
        )}
      </div>
    </div>
  );
}
