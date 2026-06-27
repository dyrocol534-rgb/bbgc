"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Gamepad2, PlaySquare, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalGames: number;
  totalPlays: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-6">Overview Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-border-main p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 rounded-lg">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Total Users</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-background border border-border-main p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg">
            <Gamepad2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Published Games</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalGames || 0}</p>
          </div>
        </div>

        <div className="bg-background border border-border-main p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-orange-500/10 rounded-lg">
            <PlaySquare className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Total Plays</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalPlays || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
