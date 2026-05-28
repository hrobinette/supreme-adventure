"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { getWorkingDeals, createSnapshot } from "@/lib/storage";
import { Deal } from "@/lib/types";

export default function InsightsPage() {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [label, setLabel] = useState("Sales upload");
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    const working = getWorkingDeals();
    if (working) {
      setDeals(working.deals);
      setLabel(working.label);
    } else {
      setDeals([]);
    }
  }, []);

  async function share() {
    if (!deals || deals.length === 0) return;
    setSharing(true);
    setCopied(false);
    try {
      const { id, remote: isRemote } = await createSnapshot(deals, label);
      setRemote(isRemote);
      const url = `${window.location.origin}/share/${id}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        /* clipboard may be blocked; link is still shown */
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Insights</h1>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
          {deals && deals.length > 0 && (
            <button
              onClick={share}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              {sharing ? "Creating link…" : "Share"}
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
            <p className="text-sm font-medium text-brand-800">
              {copied ? "Link copied to clipboard." : "Shareable link created."}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-md border border-brand-200 bg-white px-3 py-1.5 text-sm text-slate-700"
              />
              <Link
                href={shareUrl}
                target="_blank"
                className="shrink-0 rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
              >
                Open
              </Link>
            </div>
            <p className="mt-2 text-xs text-brand-700/80">
              {remote
                ? "Saved to Supabase — this link will open on any device."
                : "Supabase isn't configured, so this snapshot is stored locally in this browser only."}
            </p>
          </div>
        )}

        <div className="mt-6">
          {deals === null ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : deals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm text-slate-600">
                No data loaded yet.
              </p>
              <Link
                href="/upload"
                className="mt-3 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Upload a CSV
              </Link>
            </div>
          ) : (
            <Dashboard deals={deals} />
          )}
        </div>
      </main>
    </div>
  );
}
