import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ocean-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean-600 font-display text-base font-bold text-white">
            IS
          </span>
          <span className="font-display text-xl font-bold text-ocean-900">
            {APP_NAME}
          </span>
        </Link>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
