import { Deal, Snapshot } from "./types";

/**
 * Snapshots are persisted via server API routes backed by Supabase. When
 * Supabase isn't configured (the API responds 501) or is unreachable, we fall
 * back to the browser's localStorage so the app still works locally.
 */

const SNAPSHOT_PREFIX = "meridian:snapshot:";
const WORKING_KEY = "meridian:working";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

const localStore = {
  save(snapshot: Snapshot): void {
    if (!hasWindow()) return;
    localStorage.setItem(
      SNAPSHOT_PREFIX + snapshot.id,
      JSON.stringify(snapshot)
    );
  },
  get(id: string): Snapshot | null {
    if (!hasWindow()) return null;
    const raw = localStorage.getItem(SNAPSHOT_PREFIX + id);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  },
};

function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateResult {
  id: string;
  remote: boolean;
}

export async function createSnapshot(
  deals: Deal[],
  label: string
): Promise<CreateResult> {
  // Try the server (Supabase) first.
  try {
    const res = await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, deals }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id: string };
      return { id: data.id, remote: true };
    }
    // 501 = Supabase not configured; anything else also falls back locally.
  } catch {
    /* network error — fall back to local */
  }

  const snapshot: Snapshot = {
    id: makeId(),
    label: label || "Untitled snapshot",
    created_at: new Date().toISOString(),
    deals,
  };
  localStore.save(snapshot);
  return { id: snapshot.id, remote: false };
}

export async function getSnapshot(id: string): Promise<Snapshot | null> {
  try {
    const res = await fetch(`/api/snapshots/${id}`);
    if (res.ok) return (await res.json()) as Snapshot;
    if (res.status === 404) {
      // Might be a local-only snapshot created before Supabase was set up.
      return localStore.get(id);
    }
  } catch {
    /* network error — fall back to local */
  }
  return localStore.get(id);
}

// --- Working (in-progress) dataset for the current authoring session ---

export function setWorkingDeals(deals: Deal[], label: string): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(WORKING_KEY, JSON.stringify({ deals, label }));
}

export function getWorkingDeals(): { deals: Deal[]; label: string } | null {
  if (!hasWindow()) return null;
  const raw = sessionStorage.getItem(WORKING_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearWorkingDeals(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(WORKING_KEY);
}
