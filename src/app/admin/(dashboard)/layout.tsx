import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Halaman login admin tidak pakai layout ini (route group terpisah secara logis,
  // tapi karena /admin/login juga di bawah /admin, kita cek di sini juga).
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-ocean-50 lg:flex-row">
      <AdminSidebar nama={session.nama} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
