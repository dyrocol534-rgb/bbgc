import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import AdminUnlockForm from "@/components/admin/AdminUnlockForm";
import AdminLayoutShell from "@/components/layout/AdminLayoutShell";

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

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
