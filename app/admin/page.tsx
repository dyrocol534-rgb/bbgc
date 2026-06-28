"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Gamepad2, PlaySquare, Loader2, Activity, UserPlus, Mail } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalGames: number;
  totalPlays: number;
  activeUsers24h: number;
  newUsers7d: number;
  totalSubscribers: number;
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
      <h2 className="text-2xl font-bold text-text-main mb-6">Overview Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Engagement & Growth Stats */}
        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Active Users (24h)</p>
            <p className="text-3xl font-bold text-text-main">{stats?.activeUsers24h || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">New Users (7 Days)</p>
            <p className="text-3xl font-bold text-text-main">{stats?.newUsers7d || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-pink-500/10 rounded-xl">
            <Mail className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Total Subscribers</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalSubscribers || 0}</p>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-indigo-500/10 rounded-xl">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Total Lifetime Users</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-green-500/10 rounded-xl">
            <Gamepad2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Published Games</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalGames || 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-lg">
          <div className="p-4 bg-orange-500/10 rounded-xl">
            <PlaySquare className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Total Lifetime Plays</p>
            <p className="text-3xl font-bold text-text-main">{stats?.totalPlays || 0}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
