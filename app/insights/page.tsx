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
            <h1 className="text-2xl font-bold tracking-tight">
              Sales <span className="brand-text">Insights</span>
            </h1>
            <p className="text-sm text-muted">{label}</p>
          </div>
          {deals && deals.length > 0 && (
            <button
              onClick={share}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              {sharing ? "Creating link…" : "Share"}
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="mt-4 card border-brand/20 p-4" style={{ boxShadow: "0 0 0 1px rgba(25,227,177,0.15)" }}>
            <p className="text-sm font-medium text-brand">
              {copied ? "Link copied to clipboard." : "Shareable link created."}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg"
              />
              <Link
                href={shareUrl}
                target="_blank"
                className="shrink-0 rounded-lg border border-brand/40 px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10"
              >
                Open
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted">
              {remote
                ? "Saved to Supabase — this link will open on any device."
                : "Supabase isn't configured, so this snapshot is stored locally in this browser only."}
            </p>
          </div>
        )}

        <div className="mt-6">
          {deals === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : deals.length === 0 ? (
            <div className="card border-dashed p-10 text-center">
              <p className="text-sm text-muted">No data loaded yet.</p>
              <Link
                href="/upload"
                className="mt-3 inline-block rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-ink shadow-glow hover:opacity-90"
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
