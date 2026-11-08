/**
 * TradingQ&A (Zerodha Community Forum) Ingestion Script
 *
 * Fetches SIP-related discussions from tradingqna.com, which runs on
 * the Discourse platform with a public JSON API.
 *
 * Sources:
 *   - Search API: /search.json?q={query}
 *   - Topic API:  /t/{slug}/{id}.json
 */

import { RawItem } from "../types";
import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

// ─── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = "https://tradingqna.com";

const SEARCH_QUERIES = [
  "SIP",
  "SIP stopped",
  "SIP paused",
  "SIP experience",
  "mutual fund SIP",
  "first time investor SIP",
  "SIP mandate",
  "cancel SIP",
  "stop SIP",
];

const REQUEST_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "User-Agent": "SIPDiscoveryEngine/1.0",
};

const DELAY_MS = 2_000; // Polite delay between requests
const RATE_LIMIT_RETRY_MS = 5_000; // Retry delay on 429

// ─── Discourse API response shapes ──────────────────────────────────────────

interface DiscourseSearchTopic {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  like_count: number;
  reply_count: number;
}

interface DiscourseSearchResponse {
  topics?: DiscourseSearchTopic[];
  posts?: Array<{
    id: number;
    topic_id: number;
    username: string;
    cooked: string;
    raw?: string;
  }>;
}

interface DiscoursePost {
  id: number;
  username: string;
  created_at: string;
  cooked: string;
  raw?: string;
  like_count: number;
  reply_count: number;
  post_number: number;
}

interface DiscourseTopicResponse {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  post_stream?: {
    posts?: DiscoursePost[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip HTML tags from Discourse "cooked" content */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fetch JSON from a URL with retry on 429 rate-limiting */
async function fetchJson<T>(url: string): Promise<T | null> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { headers: REQUEST_HEADERS });

      if (response.status === 429) {
        console.warn(`⏳ Rate limited (429) on ${url}, retrying in ${RATE_LIMIT_RETRY_MS / 1000}s...`);
        await sleep(RATE_LIMIT_RETRY_MS);
        continue;
      }

      if (response.status === 403) {
        console.warn(`🚫 Forbidden (403) for ${url} — skipping`);
        return null;
      }

      if (!response.ok) {
        console.warn(`⚠️ HTTP ${response.status} for ${url} — skipping`);
        return null;
      }

      return (await response.json()) as T;
    } catch (err) {
      console.error(`❌ Network error fetching ${url}:`, (err as Error).message);
      if (attempt < maxRetries) {
        await sleep(RATE_LIMIT_RETRY_MS);
        continue;
      }
      return null;
    }
  }

  return null;
}

// ─── Core Ingestion Logic ────────────────────────────────────────────────────

export async function ingestTradingQnA(): Promise<RawItem[]> {
  console.log("🔍 Starting TradingQ&A ingestion...\n");

  // Phase 1: Discover topics via search queries
  const topicMap = new Map<number, DiscourseSearchTopic>();

  for (const query of SEARCH_QUERIES) {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${BASE_URL}/search.json?q=${encodedQuery}`;
    console.log(`🔎 Searching: "${query}"`);

    const result = await fetchJson<DiscourseSearchResponse>(searchUrl);

    if (result?.topics) {
      for (const topic of result.topics) {
        if (!topicMap.has(topic.id)) {
          topicMap.set(topic.id, topic);
        }
      }
      console.log(`   Found ${result.topics.length} topics (${topicMap.size} unique so far)`);
    } else {
      console.log(`   No topics returned`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n📊 Total unique topics discovered: ${topicMap.size}\n`);

  if (topicMap.size === 0) {
    console.log("⚠️ No topics found — saving empty result");
    saveRawItems("tradingqna", []);
    updateManifest("tradingqna", [], SEARCH_QUERIES);
    return [];
  }

  // Phase 2: Fetch full topic details and extract posts
  const rawItems: RawItem[] = [];
  const seenIds = new Set<string>();
  let fetchedCount = 0;

  for (const [topicId, topicSummary] of topicMap) {
    fetchedCount++;
    const topicUrl = `${BASE_URL}/t/${topicSummary.slug}/${topicId}.json`;
    console.log(`📥 [${fetchedCount}/${topicMap.size}] Fetching topic: ${topicSummary.title.slice(0, 80)}`);

    const topicData = await fetchJson<DiscourseTopicResponse>(topicUrl);

    if (!topicData?.post_stream?.posts) {
      console.log(`   ⚠️ No posts in topic — skipping`);
      await sleep(DELAY_MS);
      continue;
    }

    const posts = topicData.post_stream.posts;

    for (const post of posts) {
      // Keep the first post (the question) always, and replies only if they have likes
      const isFirstPost = post.post_number === 1;
      const isHighValueReply = post.post_number > 1 && post.like_count > 0;

      if (!isFirstPost && !isHighValueReply) continue;

      // Extract text content — prefer raw (plain text) over cooked (HTML)
      const text = post.raw
        ? post.raw.trim()
        : stripHtml(post.cooked);

      if (!text || text.length < 10) continue;

      const itemId = makeId("tradingqna", `${topicId}_post_${post.id}`);

      // Deduplicate by ID
      if (seenIds.has(itemId)) continue;
      seenIds.add(itemId);

      const rawItem: RawItem = {
        id: itemId,
        source: "tradingqna",
        source_url: `${BASE_URL}/t/${topicSummary.slug}/${topicId}/${post.post_number}`,
        author: post.username,
        date: post.created_at,
        text: isFirstPost
          ? `[Q] ${topicData.title}\n\n${text}`
          : `[A] Re: ${topicData.title}\n\n${text}`,
        upvotes: post.like_count,
        reply_count: isFirstPost ? post.reply_count : undefined,
        platform_meta: {
          topic_id: topicId,
          post_id: post.id,
          post_number: post.post_number,
          is_question: isFirstPost,
        },
      };

      rawItems.push(rawItem);
    }

    console.log(`   ✅ Extracted ${posts.filter((p) => p.post_number === 1 || p.like_count > 0).length} relevant posts`);
    await sleep(DELAY_MS);
  }

  // Phase 3: Save results
  console.log(`\n💾 Saving ${rawItems.length} items...`);
  saveRawItems("tradingqna", rawItems);
  updateManifest("tradingqna", rawItems, SEARCH_QUERIES);

  console.log(`\n🎉 TradingQ&A ingestion complete — ${rawItems.length} items collected`);
  return rawItems;
}

// ─── Standalone entry point ──────────────────────────────────────────────────

if (require.main === module) {
  ingestTradingQnA().catch((err) => {
    console.error("💥 Fatal error during TradingQ&A ingestion:", err);
    process.exit(1);
  });
}
