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
          <p className="text-sm text-slate-400">Loading shared snapshot…</p>
        )}

        {snapshot === "missing" && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h1 className="text-base font-semibold text-slate-800">
              Snapshot not found
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              This shared link isn&apos;t available. The snapshot may no longer
              exist, or (if Supabase isn&apos;t configured) it was created in a
              different browser.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Go to app
            </Link>
          </div>
        )}

        {snapshot && snapshot !== "missing" && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-slate-900">
                {snapshot.label}
              </h1>
              <p className="text-sm text-slate-500">
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
