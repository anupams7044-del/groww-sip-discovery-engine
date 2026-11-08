import * as fs from "fs";
import * as path from "path";
import { RawItem, Source } from "./types";

export interface CleanItem extends RawItem {
  clean_text: string;
  lang: "en" | "hi-en" | "hi" | "other";
  word_count: number;
}

export interface FunnelStepCount {
  step: string;
  description: string;
  items_in: number;
  items_out: number;
  removed: number;
  reasons: Record<string, number>;
}

export interface FunnelLog {
  timestamp: string;
  total_raw: number;
  total_clean: number;
  overall_retention_rate: string;
  sources_breakdown: Record<string, { raw: number; clean: number; dropped: number }>;
  steps: FunnelStepCount[];
  removed_samples: Array<{ id: string; source: string; text: string; reason: string }>;
  kept_samples: Array<{ id: string; source: string; text: string; lang: string }>;
}

const DATA_RAW_DIR = path.resolve(__dirname, "../data/raw");
const DATA_CLEAN_DIR = path.resolve(__dirname, "../data/clean");

// Ensure directories
if (!fs.existsSync(DATA_CLEAN_DIR)) {
  fs.mkdirSync(DATA_CLEAN_DIR, { recursive: true });
}

// ── Cleaning Helpers ──────────────────────────────────────────────────────────

function normalizeForDedup(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function detectLanguage(text: string): "en" | "hi-en" | "hi" | "other" {
  // Check Devanagari script
  const devanagariRegex = /[\u0900-\u097F]/;
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > text.length * 0.3) {
    return "hi";
  }

  // Common Hinglish markers in Indian finance chats
  const hinglishMarkers = [
    /\b(maine|mujhe|mera|meri|kare|karna|hoga|kya|nahi|bhai|sab|mahine|paisa|paise|band|ruk|chal|raha|rahi|samajh|accha|bohot)\b/i
  ];
  if (hinglishMarkers.some((r) => r.test(text))) {
    return "hi-en";
  }

  return "en";
}

// Strict false-match filter for non-financial "sip"
function isFalseMatch(text: string): { isFalse: boolean; reason?: string } {
  const lower = text.toLowerCase();

  // Obvious non-financial phrases
  const nonFinancePhrases = [
    "sip of coffee",
    "sip of tea",
    "sip of water",
    "sip of beer",
    "sip of wine",
    "sip of drink",
    "take a sip",
    "took a sip",
    "taking a sip",
    "sip by sip",
    "sip trunk",
    "sip server",
    "voip sip",
    "sip protocol",
    "mississippi",
    "gossip"
  ];


  for (const phrase of nonFinancePhrases) {
    if (lower.includes(phrase)) {
      return { isFalse: true, reason: `Contains non-financial phrase: "${phrase}"` };
    }
  }

  // Check if text mentions SIP/MF keywords
  const financeKeywords = [
    /\bsip\b/i,
    /\bsips\b/i,
    /\bs\.i\.p\b/i,
    /systematic investment/i,
    /mutual fund/i,
    /\bmf\b/i,
    /mandate/i,
    /autopay/i,
    /auto-debit/i,
    /installment/i,
    /enach/i,
    /nach/i,
    /nav\b/i,
    /xirr/i,
    /cagr/i,
    /folio/i,
    /groww/i,
    /zerodha/i,
    /coin\b/i,
    /parag parikh/i,
    /nifty/i,
    /index fund/i
  ];

  const hasFinanceKeyword = financeKeywords.some((r) => r.test(text));
  if (!hasFinanceKeyword) {
    return { isFalse: true, reason: "No relevant investing/SIP keywords found" };
  }

  return { isFalse: false };
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

export async function runCleaning(): Promise<{ totalRaw: number; totalClean: number }> {
  console.log("🧹 Starting Phase 2 Cleaning & Relevance Funnel...\n");

  const sources: Source[] = ["playstore", "appstore", "tradingqna", "youtube", "reddit"];
  let rawItems: RawItem[] = [];

  for (const src of sources) {
    const filePath = path.join(DATA_RAW_DIR, `${src}.json`);
    if (fs.existsSync(filePath)) {
      const items: RawItem[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      rawItems.push(...items);
      console.log(`  Loaded ${items.length} items from ${src}`);
    }
  }

  const totalRaw = rawItems.length;
  console.log(`\n📥 Total Raw Input: ${totalRaw} items\n`);

  const removedSamples: Array<{ id: string; source: string; text: string; reason: string }> = [];
  const steps: FunnelStepCount[] = [];

  // ── Step 1: Deduplication ──────────────────────────────────────────────────
  const seenNorms = new Set<string>();
  const step1Out: RawItem[] = [];
  let dupCount = 0;

  for (const item of rawItems) {
    const norm = normalizeForDedup(item.text);
    if (!norm) continue;

    // Check near duplicate if first 80 chars matches an existing one
    const prefix = norm.slice(0, 80);
    if (seenNorms.has(prefix)) {
      dupCount++;
      if (removedSamples.length < 20) {
        removedSamples.push({ id: item.id, source: item.source, text: item.text, reason: "Duplicate item" });
      }
    } else {
      seenNorms.add(prefix);
      step1Out.push(item);
    }
  }

  steps.push({
    step: "1_deduplication",
    description: "Remove exact and near duplicates across collections",
    items_in: totalRaw,
    items_out: step1Out.length,
    removed: dupCount,
    reasons: { duplicate_content: dupCount }
  });
  console.log(`Step 1 (Deduplication): ${totalRaw} -> ${step1Out.length} (Removed ${dupCount})`);

  // ── Step 2: Minimum Length & Pure Noise Filter ─────────────────────────────
  const step2Out: RawItem[] = [];
  let shortCount = 0;
  let noiseCount = 0;

  for (const item of step1Out) {
    const words = countWords(item.text);
    if (words < 8) {
      shortCount++;
      if (removedSamples.length < 30) {
        removedSamples.push({
          id: item.id,
          source: item.source,
          text: item.text,
          reason: `Too short (< 8 words: ${words} words)`
        });
      }
      continue;
    }

    // Pure noise / generic single phrase without context
    const isPureNoise = /^(good app|nice app|best app|super app|great app|bad app|worst app|5 star|1 star)[\.\!\s]*$/i.test(
      item.text.trim()
    );

    if (isPureNoise) {
      noiseCount++;
      if (removedSamples.length < 30) {
        removedSamples.push({ id: item.id, source: item.source, text: item.text, reason: "Generic noise review" });
      }
      continue;
    }

    step2Out.push(item);
  }

  const step2Removed = shortCount + noiseCount;
  steps.push({
    step: "2_length_and_noise",
    description: "Drop items < 8 words or generic rating noise without substance",
    items_in: step1Out.length,
    items_out: step2Out.length,
    removed: step2Removed,
    reasons: { too_short: shortCount, generic_noise: noiseCount }
  });
  console.log(`Step 2 (Length & Noise): ${step1Out.length} -> ${step2Out.length} (Removed ${step2Removed})`);

  // ── Step 3: False-Positive & Relevance Filter ──────────────────────────────
  const step3Out: CleanItem[] = [];
  let falsePositiveCount = 0;

  for (const item of step2Out) {
    const check = isFalseMatch(item.text);
    if (check.isFalse) {
      falsePositiveCount++;
      if (removedSamples.length < 40) {
        removedSamples.push({
          id: item.id,
          source: item.source,
          text: item.text,
          reason: check.reason || "False positive match"
        });
      }
      continue;
    }

    const lang = detectLanguage(item.text);
    step3Out.push({
      ...item,
      clean_text: item.text.replace(/\s+/g, " ").trim(),
      lang,
      word_count: countWords(item.text)
    });
  }

  steps.push({
    step: "3_relevance_and_false_matches",
    description: "Verify genuine Systematic Investment Plan context and discard off-topic mentions",
    items_in: step2Out.length,
    items_out: step3Out.length,
    removed: falsePositiveCount,
    reasons: { non_sip_or_irrelevant: falsePositiveCount }
  });
  console.log(`Step 3 (Relevance & False Matches): ${step2Out.length} -> ${step3Out.length} (Removed ${falsePositiveCount})`);

  // ── Sources Breakdown ──────────────────────────────────────────────────────
  const sourcesBreakdown: Record<string, { raw: number; clean: number; dropped: number }> = {};
  for (const s of sources) {
    const rawCount = rawItems.filter((i) => i.source === s).length;
    const cleanCount = step3Out.filter((i) => i.source === s).length;
    sourcesBreakdown[s] = {
      raw: rawCount,
      clean: cleanCount,
      dropped: rawCount - cleanCount
    };
  }

  // ── Sample Kept Items ──────────────────────────────────────────────────────
  const keptSamples = step3Out.slice(0, 15).map((i) => ({
    id: i.id,
    source: i.source,
    text: i.clean_text,
    lang: i.lang
  }));

  // ── Save Clean Items and Funnel Log ────────────────────────────────────────
  const funnelLog: FunnelLog = {
    timestamp: new Date().toISOString(),
    total_raw: totalRaw,
    total_clean: step3Out.length,
    overall_retention_rate: ((step3Out.length / totalRaw) * 100).toFixed(1) + "%",
    sources_breakdown: sourcesBreakdown,
    steps,
    removed_samples: removedSamples,
    kept_samples: keptSamples
  };

  fs.writeFileSync(path.join(DATA_CLEAN_DIR, "items.json"), JSON.stringify(step3Out, null, 2), "utf-8");
  fs.writeFileSync(path.join(DATA_CLEAN_DIR, "funnel.json"), JSON.stringify(funnelLog, null, 2), "utf-8");

  console.log(`\n✅ Saved ${step3Out.length} clean items to /data/clean/items.json`);
  console.log(`📋 Funnel log saved to /data/clean/funnel.json`);

  return { totalRaw, totalClean: step3Out.length };
}

// ── Run and Display Acceptance Output ─────────────────────────────────────────

async function main() {
  await runCleaning();

  const funnelPath = path.join(DATA_CLEAN_DIR, "funnel.json");
  const funnel: FunnelLog = JSON.parse(fs.readFileSync(funnelPath, "utf-8"));

  console.log("\n========================================================");
  console.log("📊 PHASE 2 ACCEPTANCE: CLEANING FUNNEL SUMMARY");
  console.log("========================================================");
  console.log(`Total Raw Input      : ${funnel.total_raw}`);
  console.log(`Total Clean Retained : ${funnel.total_clean} (${funnel.overall_retention_rate})`);

  console.log("\nFunnel Step-by-Step:");
  console.log("--------------------------------------------------------");
  for (const st of funnel.steps) {
    console.log(`• ${st.step.padEnd(28)}: in=${st.items_in} -> out=${st.items_out} (dropped ${st.removed})`);
  }

  console.log("\nSource Retention Breakdown:");
  console.log("--------------------------------------------------------");
  for (const [src, counts] of Object.entries(funnel.sources_breakdown)) {
    console.log(`• ${src.padEnd(12)}: raw=${String(counts.raw).padStart(3)} | clean=${String(counts.clean).padStart(3)} | dropped=${counts.dropped}`);
  }

  console.log("\n========================================================");
  console.log("🗑️  10 REMOVED EXAMPLES (with reason):");
  console.log("========================================================");
  const sampleRemoved = funnel.removed_samples.slice(0, 10);
  for (let idx = 0; idx < sampleRemoved.length; idx++) {
    const item = sampleRemoved[idx];
    console.log(`\n[${idx + 1}] ID: ${item.id} | Source: ${item.source}`);
    console.log(`Reason : ${item.reason}`);
    console.log(`Text   : "${item.text.slice(0, 140)}..."`);
  }

  console.log("\n========================================================");
  console.log("✨ 10 KEPT EXAMPLES (Clean & Verified):");
  console.log("========================================================");
  const sampleKept = funnel.kept_samples.slice(0, 10);
  for (let idx = 0; idx < sampleKept.length; idx++) {
    const item = sampleKept[idx];
    console.log(`\n[${idx + 1}] ID: ${item.id} | Source: ${item.source} | Lang: ${item.lang}`);
    console.log(`Text : "${item.text.slice(0, 180)}..."`);
  }

  console.log("\n========================================================");
}

main().catch(console.error);
