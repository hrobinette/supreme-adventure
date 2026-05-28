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
    { href: "/insights", label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/insights" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z"
                fill="#06231d"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-fg">
            MERIDIAN
          </span>
          {readOnlyLabel && (
            <span className="ml-2 rounded-full border border-accent-amber/30 bg-accent-amber/10 px-2 py-0.5 text-xs font-medium text-accent-amber">
              Shared · {readOnlyLabel}
            </span>
          )}
        </Link>

        {showNav && (
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                    active
                      ? "text-brand"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
