import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { UploadCloud, BarChart3, Users } from "lucide-react";
import AdminNav from "@/components/layout/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== "tusharkantanayak713@gmail.com") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
        <p className="text-text-muted">You must be logged in with the admin email to view this section.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text-main">Admin Dashboard</h1>
        <AdminNav />
      </div>
      
      <div className="bg-surface border border-border-main rounded-xl p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}
