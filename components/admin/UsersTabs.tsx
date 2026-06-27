"use client";

import { useState } from "react";
import clsx from "clsx";

interface UsersTabsProps {
  users: any[];
  subscribers: any[];
}

export default function UsersTabs({ users, subscribers }: UsersTabsProps) {
  const [activeTab, setActiveTab] = useState<"subscribers" | "users">("subscribers");

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border-main">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={clsx(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "subscribers" 
              ? "border-primary text-primary" 
              : "border-transparent text-zinc-400 hover:text-white"
          )}
        >
          Newsletter Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={clsx(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "users" 
              ? "border-primary text-primary" 
              : "border-transparent text-zinc-400 hover:text-white"
          )}
        >
          Registered Users ({users.length})
        </button>
      </div>

      {activeTab === "subscribers" && (
        <div className="bg-surface border border-border-main rounded-xl overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border-main text-zinc-400 text-sm">
                <th className="p-4 font-medium">Email Address</th>
                <th className="p-4 font-medium">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-sm">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-zinc-500">No subscribers yet.</td>
                </tr>
              ) : (
                subscribers.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-background/50 transition-colors">
                    <td className="p-4 text-white">{sub.email}</td>
                    <td className="p-4 text-zinc-400">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-surface border border-border-main rounded-xl overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border-main text-zinc-400 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">No registered users yet.</td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-background/50 transition-colors">
                    <td className="p-4 text-white font-medium flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      {user.name}
                    </td>
                    <td className="p-4 text-zinc-400">{user.email}</td>
                    <td className="p-4 text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
