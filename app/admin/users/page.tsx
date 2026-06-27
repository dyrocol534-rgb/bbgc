"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await axios.get('/api/admin/users');
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
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
      <h2 className="text-xl font-bold text-text-main mb-6">Registered Users ({users.length})</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-strong text-text-muted text-sm">
              <th className="py-3 px-4 font-medium">User</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-border-main hover:bg-surface-hover/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full bg-background" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-xs font-bold text-text-muted">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-text-main">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary text-sm">{user.email}</td>
                <td className="py-3 px-4 text-text-muted text-xs font-mono">{user._id}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
