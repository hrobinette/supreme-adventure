"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { getSnapshot } from "@/lib/storage";
import { Snapshot } from "@/lib/types";

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [snapshot, setSnapshot] = useState<Snapshot | null | "missing">(null);

  useEffect(() => {
    getSnapshot(id).then((s) => setSnapshot(s ?? "missing"));
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar
        showNav={false}
        readOnlyLabel={
          snapshot && snapshot !== "missing" ? snapshot.label : undefined
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {snapshot === null && (
          <p className="text-sm text-muted">Loading shared snapshot…</p>
        )}

        {snapshot === "missing" && (
          <div className="card border-dashed p-10 text-center">
            <h1 className="text-base font-semibold text-fg">
              Snapshot not found
            </h1>
            <p className="mt-1 text-sm text-muted">
              This shared link isn&apos;t available. The snapshot may no longer
              exist, or (if Supabase isn&apos;t configured) it was created in a
              different browser.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink shadow-glow hover:opacity-90"
            >
              Go to app
            </Link>
          </div>
        )}

        {snapshot && snapshot !== "missing" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                {snapshot.label}
              </h1>
              <p className="text-sm text-muted">
                Shared snapshot · {new Date(snapshot.created_at).toLocaleString()}
              </p>
            </div>
            <Dashboard deals={snapshot.deals} />
          </>
        )}
      </main>
    </div>
  );
}
