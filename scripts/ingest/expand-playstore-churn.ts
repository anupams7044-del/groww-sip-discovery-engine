import * as fs from "fs";
import * as path from "path";
// @ts-ignore
const gplay = require(path.resolve(__dirname, "../../groww-sip-discovery/node_modules/google-play-scraper"));
import { RawItem } from "../types";
import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

const TARGET_APPS = [
  { name: "Groww", id: "com.nextbillion.groww" },
  { name: "Zerodha Coin", id: "com.zerodha.coin" },
  { name: "Paytm Money", id: "com.paytmmoney" },
  { name: "Angel One", id: "com.msf.angelmobile" },
  { name: "Upstox", id: "in.upstox.app" }
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

export async function expandPlayStoreChurn(): Promise<void> {
  console.log("🔍 Expanding Play Store collection with 1★, 2★, and 3★ user churn reviews...\n");

  const existingItems: RawItem[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../data/raw/playstore.json"), "utf-8")
  );
  console.log(`Initial Play Store items: ${existingItems.length}`);

  const newItems: RawItem[] = [];

  for (const app of TARGET_APPS) {
    console.log(`📱 Deep scraping critical reviews for ${app.name}...`);

    for (const rating of [1, 2, 3]) {
      try {
        const reviews = await gplay.reviews({
          appId: app.id,
          sort: gplay.sort.HELPFULNESS,
          num: 250,
          country: "in",
          lang: "en"
        });

        const list = Array.isArray(reviews) ? reviews : reviews.data || [];
        let matched = 0;

        for (const rev of list) {
          const text = rev.text || "";
          if (text.length < 15 || !isSIPRelated(text)) continue;

          matched++;
          const id = makeId("playstore", `${app.name}_${rev.id || Math.random().toString(36).slice(2)}`);
          newItems.push({
            id,
            source: "playstore",
            source_url: rev.url || `https://play.google.com/store/apps/details?id=${app.id}`,
            author: rev.userName || "PlayStoreUser",
            date: rev.date ? new Date(rev.date).toISOString() : new Date().toISOString(),
            text: text,
            rating: rev.score || rating,
            upvotes: rev.thumbsUp || 0,
            platform_meta: {
              app_name: app.name,
              app_id: app.id,
              developer_reply: rev.replyText || null
            }
          });
        }

        console.log(`   ${rating}★ pass: found ${matched} matching SIP reviews.`);
        await sleep(1200);
      } catch (err: any) {
        console.warn(`   ⚠️ Could not fetch for ${app.name} rating ${rating}: ${err.message}`);
      }
    }
    console.log();
  }

  // Combine and deduplicate
  const combined = [...existingItems, ...newItems];
  const seen = new Set<string>();
  const deduped: RawItem[] = [];

  for (const item of combined) {
    const key = item.text.slice(0, 80).toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  console.log(`\n🎉 Expanded Play Store Items: ${existingItems.length} -> ${deduped.length} (+${deduped.length - existingItems.length} new items)`);

  saveRawItems("playstore", deduped);
  updateManifest("playstore", deduped, ["SIP", "mutual fund", "mandate", "autopay"]);
}

expandPlayStoreChurn().catch(console.error);
