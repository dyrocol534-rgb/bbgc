"use client";

import { useState } from "react";
import axios from "axios";
import { Edit2, Check, X, Loader2 } from "lucide-react";

interface ProfileClientProps {
  initialBio: string;
}

export default function ProfileClient({ initialBio }: ProfileClientProps) {
  const [bio, setBio] = useState(initialBio);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(initialBio);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await axios.patch("/api/user/profile", { bio: tempBio });
      setBio(res.data.bio);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update bio", error);
      alert("Failed to update bio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempBio(bio);
    setIsEditing(false);
  };

  return (
    <div className="w-full text-left">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">About Me</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
            title="Edit Bio"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isEditing ? (
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
              onClick={handleCancel}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSave}
              className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
          {bio || <span className="italic text-zinc-600">No bio provided yet.</span>}
        </p>
      )}
    </div>
  );
}
