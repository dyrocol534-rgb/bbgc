import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { UploadCloud, BarChart3, Users } from "lucide-react";
import { cookies } from "next/headers";
import AdminNav from "@/components/layout/AdminNav";
import AdminUnlockForm from "@/components/admin/AdminUnlockForm";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== (process.env.ADMIN_EMAIL || "tusharkantanayak713@gmail.com")) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
        <p className="text-text-muted">You must be logged in with the admin email to view this section.</p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const isUnlocked = cookieStore.get("admin_unlocked")?.value === "true";

  if (!isUnlocked) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[70vh] flex items-center justify-center">
        <AdminUnlockForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
          <div className="flex items-center justify-between lg:flex-col lg:items-start lg:gap-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Admin Dashboard</h1>
            <AdminNav />
          </div>
        </aside>
        
        <main className="flex-1 min-w-0 w-full">
          <div className="bg-surface border border-border-main rounded-xl p-6 shadow-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
