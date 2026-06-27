"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, Circle, MessageSquareWarning } from "lucide-react";

interface FeedbackData {
  _id: string;
  gameSlug: string;
  userEmail: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    try {
      const { data } = await axios.get('/api/admin/feedback');
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "pending" ? "resolved" : "pending";
    try {
      await axios.patch(`/api/admin/feedback/${id}`, { status: newStatus });
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating status");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-indigo-400" />
          User Feedback ({feedbacks.length})
        </h2>
      </div>
      
      <div className="bg-zinc-900 border border-border-main rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-border-strong text-zinc-400 text-sm">
                <th className="py-4 px-6 font-semibold">User</th>
                <th className="py-4 px-6 font-semibold">Game</th>
                <th className="py-4 px-6 font-semibold w-1/2">Message</th>
                <th className="py-4 px-6 font-semibold text-center">Date</th>
                <th className="py-4 px-6 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((item) => (
                <tr key={item._id} className={`border-b border-border-main transition-colors hover:bg-surface-hover/50 ${item.status === 'resolved' ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="font-medium text-zinc-200">{item.userEmail}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono">
                      {item.gameSlug}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{item.message}</p>
                  </td>
                  <td className="py-4 px-6 text-center text-zinc-500 text-sm whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => toggleStatus(item._id, item.status)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        item.status === 'resolved' 
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                          : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                      }`}
                    >
                      {item.status === 'resolved' ? <><CheckCircle2 className="w-4 h-4" /> Resolved</> : <><Circle className="w-4 h-4" /> Pending</>}
                    </button>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No feedback received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
