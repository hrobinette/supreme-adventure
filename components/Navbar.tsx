"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  showNav?: boolean;
  readOnlyLabel?: string;
}

export default function Navbar({ showNav = true, readOnlyLabel }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/upload", label: "Upload" },
    { href: "/insights", label: "Insights" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            M
          </span>
          <span className="text-sm font-semibold text-slate-800">
            Meridian Sales Insights
          </span>
          {readOnlyLabel && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Shared · {readOnlyLabel}
            </span>
          )}
        </div>

        {showNav && (
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
