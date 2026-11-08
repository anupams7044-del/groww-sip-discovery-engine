/**
 * Master ingestion runner
 * Runs all source ingestors sequentially and reports totals.
 * 
 * Usage: npx tsx scripts/ingest/run-all.ts
 */

async function runAll() {
  console.log("🚀 Starting full data ingestion pipeline...\n");
  const startTime = Date.now();

  const sources = [
    { name: "Play Store", fn: async () => (await import("./playstore")).ingestPlayStore() },
    { name: "App Store", fn: async () => (await import("./appstore")).ingestAppStore() },
    { name: "Reddit", fn: async () => (await import("./reddit")).ingestReddit() },
    { name: "TradingQ&A", fn: async () => (await import("./tradingqna")).ingestTradingQnA() },
    { name: "YouTube", fn: async () => (await import("./youtube")).ingestYouTube() },
  ];

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  for (const source of sources) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📥 Ingesting: ${source.name}`);
    console.log("=".repeat(60));

    try {
      await source.fn();
      results.push({ name: source.name, success: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Failed to ingest ${source.name}: ${errorMsg}`);
      results.push({ name: source.name, success: false, error: errorMsg });
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 INGESTION SUMMARY");
  console.log("=".repeat(60));
  for (const r of results) {
    const icon = r.success ? "✅" : "❌";
    console.log(`  ${icon} ${r.name}${r.error ? ` — ${r.error}` : ""}`);
  }
  console.log(`\n⏱️  Total time: ${elapsed}s`);
  console.log(`\n📁 Raw data saved to: /data/raw/`);
  console.log(`📋 Manifest at: /data/raw/manifest.json`);
}

runAll().catch(console.error);
