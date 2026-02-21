import fs from "node:fs";
import path from "node:path";

import type { ProspectMeta } from "@/lib/types";

export type ProspectingStore = Record<string, ProspectMeta>;

const STORE_PATH = path.join(process.cwd(), "data", "prospecting-store.json");

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadStore(): ProspectingStore {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw) as ProspectingStore;
  } catch {
    // If file is corrupted, fail closed to empty.
    return {};
  }
}

export function saveStore(store: ProspectingStore) {
  ensureDir();
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_PATH);
}

export function upsertMeta(key: string, patch: Partial<ProspectMeta>) {
  const store = loadStore();
  const cur: ProspectMeta = store[key] ?? {
    advisor: "",
    called: false,
    scrubbed: false,
    updatedAt: Date.now(),
  };
  const next: ProspectMeta = {
    advisor: patch.advisor ?? cur.advisor,
    called: patch.called ?? cur.called,
    scrubbed: patch.scrubbed ?? cur.scrubbed,
    updatedAt: Date.now(),
  };
  store[key] = next;
  saveStore(store);
  return next;
}
