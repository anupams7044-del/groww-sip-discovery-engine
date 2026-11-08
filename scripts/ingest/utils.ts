import * as fs from "fs";
import * as path from "path";
import { RawItem, CollectionManifest, Source } from "../types";

const DATA_RAW_DIR = path.resolve(__dirname, "../../data/raw");

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveRawItems(source: Source, items: RawItem[]) {
  ensureDir(DATA_RAW_DIR);
  const filePath = path.join(DATA_RAW_DIR, `${source}.json`);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`✅ Saved ${items.length} items to ${filePath}`);
}

export function loadRawItems(source: Source): RawItem[] {
  const filePath = path.join(DATA_RAW_DIR, `${source}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function updateManifest(
  source: Source,
  items: RawItem[],
  keywords: string[]
) {
  ensureDir(DATA_RAW_DIR);
  const manifestPath = path.join(DATA_RAW_DIR, "manifest.json");

  let manifest: CollectionManifest = {
    last_updated: new Date().toISOString(),
    sources: [],
    total_items: 0,
  };

  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  }

  const dates = items
    .map((i) => i.date)
    .filter(Boolean)
    .sort();

  const existingIdx = manifest.sources.findIndex((s) => s.source === source);
  const entry = {
    source,
    count: items.length,
    date_range: {
      earliest: dates[0] || "unknown",
      latest: dates[dates.length - 1] || "unknown",
    },
    keywords_used: keywords,
  };

  if (existingIdx >= 0) {
    manifest.sources[existingIdx] = entry;
  } else {
    manifest.sources.push(entry);
  }

  manifest.total_items = manifest.sources.reduce((s, e) => s + e.count, 0);
  manifest.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(
    `📋 Manifest updated: ${manifest.total_items} total items across ${manifest.sources.length} sources`
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a deterministic ID for a raw item */
export function makeId(source: Source, uniquePart: string): string {
  return `${source}_${uniquePart.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 60)}`;
}
