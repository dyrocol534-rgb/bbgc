"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Trash2, Eye, EyeOff, Star, Pencil } from "lucide-react";
import Link from "next/link";

interface GameData {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  playCount: number;
  thumbnailUrl: string;
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
  source: string;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data } = await axios.get('/api/admin/games');
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await axios.patch(`/api/admin/games/${id}`, { status: newStatus });
      setGames(games.map(g => g._id === id ? { ...g, status: newStatus } : g));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating status");
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    try {
      await axios.patch(`/api/admin/games/${id}`, { featured: !currentFeatured });
      setGames(games.map(g => g._id === id ? { ...g, featured: !currentFeatured } : g));
    } catch (error) {
      console.error("Failed to update featured", error);
      alert("Error updating featured status");
    }
  }

  async function deleteGame(id: string) {
    if (!window.confirm("Are you sure you want to completely delete this game? This cannot be undone.")) return;
    
    try {
      await axios.delete(`/api/admin/games/${id}`);
      setGames(games.filter(g => g._id !== id));
    } catch (error) {
      console.error("Failed to delete game", error);
      alert("Error deleting game");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-6">Manage Games ({games.length})</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-strong text-text-muted text-sm">
              <th className="py-3 px-4 font-medium w-16">Icon</th>
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium text-center">Plays</th>
              <th className="py-3 px-4 font-medium text-center">Rating</th>
              <th className="py-3 px-4 font-medium text-center">Featured</th>
              <th className="py-3 px-4 font-medium text-center">Visibility</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id} className={`border-b border-border-main transition-colors ${game.status === 'draft' ? 'bg-background/50' : 'hover:bg-surface-hover/50'}`}>
                <td className="py-3 px-4">
                  <img src={game.thumbnailUrl} alt={game.title} className="w-10 h-10 rounded-lg object-cover bg-background" />
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-text-main flex items-center gap-2">
                    {game.title}
                    {game.source === "aggregated" && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                        Imported
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted font-mono">{game.slug}</div>
                </td>
                <td className="py-3 px-4 text-center text-text-secondary text-sm">
                  {game.playCount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-400 font-medium">+{game.likes?.length || 0}</span>
                    <span className="text-text-muted">/</span>
                    <span className="text-red-400 font-medium">-{game.dislikes?.length || 0}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <button 
                    onClick={() => toggleFeatured(game._id, game.featured)}
                    className={`p-2 rounded-lg transition-colors ${game.featured ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-text-muted hover:bg-surface-hover hover:text-text-main'}`}
                    title={game.featured ? "Remove from Featured" : "Feature on Homepage"}
                  >
                    <Star className={`w-5 h-5 ${game.featured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button 
                    onClick={() => toggleStatus(game._id, game.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      game.status === 'published' 
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                    }`}
                  >
                    {game.status === 'published' ? <><Eye className="w-3.5 h-3.5" /> Published</> : <><EyeOff className="w-3.5 h-3.5" /> Draft / Hidden</>}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/admin/games/${game._id}/edit`}
                      className="p-2 text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit Game"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => deleteGame(game._id)}
                      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Game"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  No games found. Time to upload some!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
