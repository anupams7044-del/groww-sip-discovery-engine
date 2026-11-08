import * as fs from "fs";
import * as path from "path";
import { RawItem, CollectionManifest } from "../types";

const DATA_RAW_DIR = path.resolve(__dirname, "../../data/raw");

function printSummary() {
  const manifestPath = path.join(DATA_RAW_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("No manifest.json found at", manifestPath);
    return;
  }

  const manifest: CollectionManifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  console.log("\n========================================================");
  console.log("📊 PHASE 1 DATA INGESTION: CORPUS SUMMARY");
  console.log("========================================================");
  console.log(`Total Raw Items Collected: ${manifest.total_items}`);
  console.log(`Last Updated: ${manifest.last_updated}\n`);

  console.log("Breakdown by Source:");
  console.log("--------------------------------------------------------");
  for (const s of manifest.sources) {
    console.log(
      `• ${s.source.padEnd(12)} : ${String(s.count).padStart(4)} items | Date Range: ${s.date_range.earliest.slice(0, 10)} to ${s.date_range.latest.slice(0, 10)}`
    );
  }

  console.log("\n========================================================");
  console.log("🔍 SAMPLE ITEMS (1 per source):");
  console.log("========================================================");

  const sources = ["playstore", "appstore", "reddit", "tradingqna", "youtube"] as const;

  for (const src of sources) {
    const filePath = path.join(DATA_RAW_DIR, `${src}.json`);
    if (!fs.existsSync(filePath)) continue;

    const items: RawItem[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (items.length === 0) continue;

    const sample = items[Math.floor(Math.random() * items.length)];
    console.log(`\n[Source: ${src.toUpperCase()}] ID: ${sample.id} | Date: ${sample.date?.slice(0, 10) || "N/A"}`);
    console.log(`Author: ${sample.author} | URL: ${sample.source_url || "N/A"}`);
    console.log(`Text: "${sample.text.slice(0, 220)}..."`);
  }

  console.log("\n========================================================");
}

printSummary();
