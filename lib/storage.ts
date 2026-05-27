import { Deal, Snapshot } from "./types";

/**
 * Snapshot persistence is intentionally behind this interface so the backend
 * can be swapped without touching the UI. Today it's backed by the browser's
 * localStorage (local-first). To move to cross-device sharing, add a Supabase
 * implementation of `SnapshotStore` and select it when the env vars are set.
 */
export interface SnapshotStore {
  save(snapshot: Snapshot): Promise<void>;
  get(id: string): Promise<Snapshot | null>;
  list(): Promise<Snapshot[]>;
  remove(id: string): Promise<void>;
}

const SNAPSHOT_PREFIX = "meridian:snapshot:";
const WORKING_KEY = "meridian:working";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

const localStore: SnapshotStore = {
  async save(snapshot) {
    if (!hasWindow()) return;
    localStorage.setItem(
      SNAPSHOT_PREFIX + snapshot.id,
      JSON.stringify(snapshot)
    );
  },
  async get(id) {
    if (!hasWindow()) return null;
    const raw = localStorage.getItem(SNAPSHOT_PREFIX + id);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  },
  async list() {
    if (!hasWindow()) return [];
    const out: Snapshot[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SNAPSHOT_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) out.push(JSON.parse(raw) as Snapshot);
      }
    }
    return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async remove(id) {
    if (!hasWindow()) return;
    localStorage.removeItem(SNAPSHOT_PREFIX + id);
  },
};

// When Supabase is wired up, return a SupabaseStore here instead.
export const store: SnapshotStore = localStore;

function makeId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${time}${rand}`;
}

export async function createSnapshot(
  deals: Deal[],
  label: string
): Promise<Snapshot> {
  const snapshot: Snapshot = {
    id: makeId(),
    label: label || "Untitled snapshot",
    created_at: new Date().toISOString(),
    deals,
  };
  await store.save(snapshot);
  return snapshot;
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
