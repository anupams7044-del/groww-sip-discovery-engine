import * as fs from "fs";
import * as path from "path";
// @ts-ignore
const gplay = require(path.resolve(__dirname, "../../groww-sip-discovery/node_modules/google-play-scraper"));

import { RawItem } from "../types";
import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

const TARGET_APPS = [
  { name: "Groww", id: "com.nextbillion.groww", maxPages: 10 },
  { name: "Zerodha Coin", id: "com.zerodha.coin", maxPages: 10 },
  { name: "Paytm Money", id: "com.paytmmoney", maxPages: 8 },
  { name: "Angel One", id: "com.msf.angelmobile", maxPages: 8 },
  { name: "Upstox", id: "in.upstox.app", maxPages: 8 }
];

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

async function deepScrape() {
  console.log("🚀 Starting Deep Multi-App Play Store Scraping (Target: 1,000+ SIP reviews)...\n");

  const existingItems: RawItem[] = fs.existsSync(path.resolve(__dirname, "../../data/raw/playstore.json"))
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../data/raw/playstore.json"), "utf-8"))
    : [];

  const allItemsMap = new Map<string, RawItem>();
  for (const item of existingItems) {
    const key = item.text.slice(0, 80).toLowerCase().replace(/\s+/g, " ");
    allItemsMap.set(key, item);
  }

  console.log(`Starting with ${allItemsMap.size} existing unique Play Store reviews.`);

  for (const app of TARGET_APPS) {
    console.log(`\n============================================================`);
    console.log(`📱 Deep scraping ${app.name} (${app.id}) - Up to ${app.maxPages} pages...`);
    console.log(`============================================================`);

    let nextToken: string | undefined = undefined;
    let pagesFetched = 0;
    let appMatches = 0;

    for (let p = 1; p <= app.maxPages; p++) {
      try {
        console.log(`   📄 Fetching page ${p}/${app.maxPages}...`);
        const result = await gplay.reviews({
          appId: app.id,
          num: 150,
          paginate: true,
          nextPaginationToken: nextToken,
          sort: gplay.sort.NEWEST,
          country: "in",
          lang: "en"
        });

        const reviews = result.data || [];
        if (reviews.length === 0) break;

        pagesFetched++;
        let pageMatches = 0;

        for (const rev of reviews) {
          const text = rev.text || "";
          if (text.length < 15) continue;

          if (isSIPRelated(text)) {
            const key = text.slice(0, 80).toLowerCase().replace(/\s+/g, " ");
            if (!allItemsMap.has(key)) {
              pageMatches++;
              appMatches++;
              const id = makeId("playstore", `${app.name}_${rev.id || Math.random().toString(36).slice(2)}`);
              allItemsMap.set(key, {
                id,
                source: "playstore",
                source_url: rev.url || `https://play.google.com/store/apps/details?id=${app.id}`,
                author: rev.userName || "PlayStoreUser",
                date: rev.date ? new Date(rev.date).toISOString() : new Date().toISOString(),
                text: text,
                rating: rev.score || 3,
                upvotes: rev.thumbsUp || 0,
                platform_meta: {
                  app_name: app.name,
                  app_id: app.id,
                  developer_reply: rev.replyText || null
                }
              });
            }
          }
        }

        console.log(`      Found ${reviews.length} reviews (${pageMatches} new SIP mentions). Total so far: ${allItemsMap.size}`);

        nextToken = result.nextPaginationToken;
        if (!nextToken) {
          console.log(`      No further pagination token for ${app.name}.`);
          break;
        }

        await sleep(1500);
      } catch (err: any) {
        console.warn(`      ⚠️ Error fetching page ${p} for ${app.name}: ${err.message}`);
        await sleep(2000);
      }
    }

    console.log(`   ✅ Completed ${app.name}: added ${appMatches} new SIP reviews across ${pagesFetched} pages.`);
  }

  const finalItems = Array.from(allItemsMap.values());
  console.log(`\n============================================================`);
  console.log(`🎉 Deep Scraping Complete!`);
  console.log(`Total Play Store SIP Reviews: ${finalItems.length}`);
  console.log(`============================================================`);

  saveRawItems("playstore", finalItems);
  updateManifest("playstore", finalItems, ["SIP", "mutual fund", "mandate", "autopay"]);
}

deepScrape().catch(console.error);
