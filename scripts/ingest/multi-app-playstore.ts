import * as fs from "fs";
import * as path from "path";
// @ts-ignore
const gplay = require(path.resolve(__dirname, "../../groww-sip-discovery/node_modules/google-play-scraper"));
import { RawItem } from "../types";

import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

const APPS_CONFIG_PATH = path.resolve(__dirname, "../../config/apps.json");

const SIP_KEYWORDS = [
  /\bsip\b/i,
  /\bsips\b/i,
  /\bs\.i\.p\b/i,
  /systematic investment/i,
  /mutual fund/i,
  /\bmf\b/i,
  /autopay/i,
  /mandate/i,
  /auto-debit/i,
  /enach/i,
  /nach/i,
  /installment/i,
  /nav\b/i,
  /xirr/i,
  /cagr/i
];

function isSIPRelated(text: string): boolean {
  return SIP_KEYWORDS.some((kw) => kw.test(text));
}

export async function ingestMultiAppPlayStore(): Promise<RawItem[]> {
  console.log("🚀 Starting Multi-App Google Play Store SIP Ingestion...\n");

  const apps = JSON.parse(fs.readFileSync(APPS_CONFIG_PATH, "utf-8"));
  const allItems: RawItem[] = [];

  for (const app of apps) {
    if (!app.playstore_id) continue;
    console.log(`📱 Scraping Play Store for ${app.name} (${app.playstore_id})...`);

    try {
      // 1. Fetch newest reviews
      console.log(`   Fetching newest reviews...`);
      const newestReviews = await gplay.reviews({
        appId: app.playstore_id,
        sort: gplay.sort.NEWEST,
        num: 300,
        country: "in",
        lang: "en"
      }).catch((e: any) => {
        console.warn(`   ⚠️ Newest fetch warning: ${e.message}`);
        return { data: [] };
      });

      await sleep(1500);

      // 2. Fetch helpful/relevant reviews
      console.log(`   Fetching most helpful reviews...`);
      const helpfulReviews = await gplay.reviews({
        appId: app.playstore_id,
        sort: gplay.sort.HELPFULNESS,
        num: 300,
        country: "in",
        lang: "en"
      }).catch((e: any) => {
        console.warn(`   ⚠️ Helpful fetch warning: ${e.message}`);
        return { data: [] };
      });

      const combined = [
        ...(Array.isArray(newestReviews) ? newestReviews : newestReviews.data || []),
        ...(Array.isArray(helpfulReviews) ? helpfulReviews : helpfulReviews.data || [])
      ];

      console.log(`   Total reviews fetched for ${app.name}: ${combined.length}`);

      // Filter for SIP mentions
      let matchedCount = 0;
      for (const rev of combined) {
        const text = rev.text || "";
        if (!text || text.length < 15) continue;

        if (isSIPRelated(text)) {
          matchedCount++;
          const id = makeId("playstore", `${app.name}_${rev.id || Math.random().toString(36).slice(2)}`);
          allItems.push({
            id,
            source: "playstore",
            source_url: rev.url || `https://play.google.com/store/apps/details?id=${app.playstore_id}`,
            author: rev.userName || "PlayStoreUser",
            date: rev.date ? new Date(rev.date).toISOString() : new Date().toISOString(),
            text: text,
            rating: rev.score || 3,
            upvotes: rev.thumbsUp || 0,
            platform_meta: {
              app_name: app.name,
              app_id: app.playstore_id,
              developer_reply: rev.replyText || null
            }
          });
        }
      }

      console.log(`   ✅ Kept ${matchedCount} SIP-related reviews for ${app.name}\n`);
      await sleep(2000);
    } catch (err: any) {
      console.error(`   ❌ Failed to scrape ${app.name}: ${err.message}\n`);
    }
  }

  // Deduplicate by text content prefix
  const seen = new Set<string>();
  const dedupedItems: RawItem[] = [];
  for (const item of allItems) {
    const key = item.text.slice(0, 80).toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(key)) {
      seen.add(key);
      dedupedItems.push(item);
    }
  }

  console.log(`\n🎉 Play Store Total: ${allItems.length} raw matches -> ${dedupedItems.length} deduped SIP reviews across all apps!`);

  // Persist
  saveRawItems("playstore", dedupedItems);
  updateManifest("playstore", dedupedItems, ["SIP", "mutual fund", "mandate", "autopay"]);

  return dedupedItems;
}

ingestMultiAppPlayStore().catch(console.error);

