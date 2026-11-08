import * as fs from "fs";
import * as path from "path";
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

export async function ingestMultiAppAppStore(): Promise<RawItem[]> {
  console.log("🍎 Starting Multi-App Apple App Store SIP Ingestion...\n");

  const apps = JSON.parse(fs.readFileSync(APPS_CONFIG_PATH, "utf-8"));
  const allItems: RawItem[] = [];

  for (const app of apps) {
    if (!app.appstore_id) continue;
    console.log(`🍏 Scraping App Store for ${app.name} (ID: ${app.appstore_id})...`);

    let appMatches = 0;

    for (let page = 1; page <= 10; page++) {
      const url = `https://itunes.apple.com/in/rss/customerreviews/id=${app.appstore_id}/sortBy=mostRecent/page=${page}/json`;

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SIPDiscoveryEngine/1.0)" }
        });

        if (!res.ok) {
          if (res.status === 404 || res.status === 400) break;
          continue;
        }

        const data = await res.json().catch(() => null);
        const entries = data?.feed?.entry;
        if (!entries || !Array.isArray(entries) || entries.length === 0) break;

        for (const entry of entries) {
          // Skip first entry if it's app meta
          const title = entry?.title?.label || "";
          const content = entry?.content?.label || "";
          const fullText = title ? `${title}: ${content}` : content;
          if (fullText.length < 15) continue;

          if (isSIPRelated(fullText)) {
            appMatches++;
            const author = entry?.author?.name?.label || "AppStoreUser";
            const rating = Number(entry?.["im:rating"]?.label) || 3;
            const date = entry?.updated?.label ? new Date(entry.updated.label).toISOString() : new Date().toISOString();
            const id = makeId("appstore", `${app.name}_${author}_${date.slice(0, 10)}`);

            allItems.push({
              id,
              source: "appstore",
              source_url: `https://apps.apple.com/in/app/id${app.appstore_id}`,
              author,
              date,
              text: fullText,
              rating,
              platform_meta: {
                app_name: app.name,
                app_id: app.appstore_id
              }
            });
          }
        }

        await sleep(400);
      } catch (err) {
        break;
      }
    }

    console.log(`   ✅ Kept ${appMatches} SIP-related reviews for ${app.name}\n`);
    await sleep(800);
  }

  // Deduplicate
  const seen = new Set<string>();
  const dedupedItems: RawItem[] = [];
  for (const item of allItems) {
    const key = item.text.slice(0, 80).toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(key)) {
      seen.add(key);
      dedupedItems.push(item);
    }
  }

  console.log(`\n🎉 App Store Total: ${allItems.length} raw matches -> ${dedupedItems.length} deduped reviews!`);

  saveRawItems("appstore", dedupedItems);
  updateManifest("appstore", dedupedItems, ["SIP", "mutual fund", "mandate", "autopay"]);

  return dedupedItems;
}

ingestMultiAppAppStore().catch(console.error);

