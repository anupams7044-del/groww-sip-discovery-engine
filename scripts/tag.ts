import * as dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

import * as fs from "fs";
import * as path from "path";

import { z } from "zod";
import { callLLM } from "../lib/llm";
import { TaggedItemSchema, TaggedItemResult } from "../lib/taxonomy";

const CLEAN_ITEMS_PATH = path.resolve(__dirname, "../data/clean/items.json");
const TAGGED_DIR = path.resolve(__dirname, "../data/tagged");
const TAGGED_ITEMS_PATH = path.join(TAGGED_DIR, "items.json");

if (!fs.existsSync(TAGGED_DIR)) {
  fs.mkdirSync(TAGGED_DIR, { recursive: true });
}

interface CleanInputItem {
  id: string;
  source: string;
  text: string;
  clean_text: string;
  lang: string;
  date?: string;
  author?: string;
  rating?: number;
  source_url?: string;
  platform_meta?: Record<string, unknown>;
}

export type EnrichedTaggedItem = CleanInputItem & TaggedItemResult;

const BatchResponseSchema = z.object({
  results: z.array(TaggedItemSchema)
});

function loadExistingTagged(): Map<string, EnrichedTaggedItem> {
  const map = new Map<string, EnrichedTaggedItem>();
  if (fs.existsSync(TAGGED_ITEMS_PATH)) {
    try {
      const items: EnrichedTaggedItem[] = JSON.parse(
        fs.readFileSync(TAGGED_ITEMS_PATH, "utf-8")
      );
      for (const item of items) {
        map.set(item.id, item);
      }
    } catch (e) {
      console.warn("Could not read existing tagged items, starting fresh.");
    }
  }
  return map;
}

function saveTagged(items: EnrichedTaggedItem[]) {
  fs.writeFileSync(TAGGED_ITEMS_PATH, JSON.stringify(items, null, 2), "utf-8");
}

function verifyExactSubstring(text: string, quote: string): boolean {
  if (!quote) return false;
  if (text.includes(quote)) return true;
  // Normalized whitespace check
  const normText = text.replace(/\s+/g, " ");
  const normQuote = quote.replace(/\s+/g, " ");
  return normText.includes(normQuote);
}

const SYSTEM_PROMPT = `You are a Principal Product Manager on the Growth team at Groww analyzing user feedback at scale.
Your strategic goal is to understand WHY first-time mutual fund investors stop having an active SIP within 12 months.
An active SIP = at least one successful installment in the last 30 days.

TAXONOMY DEFINITIONS:
1. lifecycle_stage:
   - setup: Onboarding, KYC, bank account linking, first mandate creation.
   - payment_reliability: Bank auto-debit, UPI Autopay, eNACH bounce, insufficient balance, OTP/bank delays.
   - early_experience_m1_3: Months 1 to 3 post-start. Red/negative returns shock, tracking daily, NAV delay confusion, feeling underwhelmed.
   - voluntary_decision_m3_12: Months 3 to 12. Cash crunch, festival spending, peer noise ("trading is better"), wanting to withdraw, shifting funds.
   - re_engagement: Users trying to restart, modify, or unpause a lapsed SIP.
   - not_applicable: Purely technical generic issue unrelated to SIP journey.

2. churn_type:
   - involuntary: Failed payment, bank mandate expired/bounced, bank penalty charges.
   - voluntary: User intentionally paused, cancelled, reduced amount, or redeemed.
   - none: User is happily continuing or just started.
   - unclear: Not enough context.

3. action: started | continuing | paused | reduced | stopped | redeemed | restarted | considering_stopping | unclear

4. RULES FOR STRICT TAGGING:
   - Only tag what the text ACTUALLY says. NEVER hallucinate or guess.
   - For segment_signals (first_time, income_stability, age_hint, money_source, influenced_by), use "unknown" or null unless explicitly stated in the text.
   - evidence_quote MUST be an EXACT VERBATIM substring copied directly from the user's text that justifies your tags. Do not paraphrase.
   - Output strict JSON matching the schema.`;

async function tagBatch(batch: CleanInputItem[]): Promise<TaggedItemResult[]> {
  const promptInput = batch.map((item, idx) => ({
    index: idx + 1,
    id: item.id,
    source: item.source,
    text: item.clean_text || item.text
  }));

  const userPrompt = `Analyze and tag each of the following ${batch.length} user feedback items according to the taxonomy.
Return a JSON object with a "results" array of ${batch.length} objects with this exact structure:
{
  "results": [
    {
      "id": "item_id_here",
      "lifecycle_stage": "setup" | "payment_reliability" | "early_experience_m1_3" | "voluntary_decision_m3_12" | "re_engagement" | "not_applicable",
      "churn_type": "involuntary" | "voluntary" | "none" | "unclear",
      "action": "started" | "continuing" | "paused" | "reduced" | "stopped" | "redeemed" | "restarted" | "considering_stopping" | "unclear",
      "trigger": "short label describing the reason, e.g. mandate bounce, negative returns, cash crunch, UI smooth",
      "expectation_gap": "expected X but got Y" or null,
      "checking_behaviour": "checks daily" or null,
      "confusion": "nav delay" or null,
      "outside_app_action": "asked friends" or null,
      "segment_signals": {
        "first_time": "yes" | "no" | "unknown",
        "income_stability": "stable" | "variable" | "student" | "unknown",
        "age_hint": null,
        "money_source": null,
        "influenced_by": null
      },
      "unmet_need": "short unmet need description" or null,
      "evidence_quote": "EXACT substring from the text that proves your tags",
      "confidence": 0.85
    }
  ]
}

Items to analyze:
${JSON.stringify(promptInput, null, 2)}`;


  try {
    const rawResponse = await callLLM({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      temperature: 0.1
    });

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (err) {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const rawList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.results)
      ? parsed.results
      : [];

    const results: TaggedItemResult[] = [];
    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      const match = rawList.find((r: any) => r && r.id === item.id) || rawList[i] || {};
      const parsedItem = TaggedItemSchema.safeParse({ ...match, id: item.id });
      if (parsedItem.success) {
        results.push(parsedItem.data);
      } else {
        console.warn(`Item parse fallback on ${item.id}:`, parsedItem.error.message);
        results.push(createNeedsReviewItem(item, "Schema mismatch"));
      }
    }
    return results;

  } catch (err: any) {
    console.error("Batch LLM call error:", err.message);
    return batch.map((item) => createNeedsReviewItem(item, err.message));
  }
}

function createNeedsReviewItem(item: CleanInputItem, reason: string): TaggedItemResult {
  return {
    id: item.id,
    lifecycle_stage: "not_applicable",
    churn_type: "unclear",
    action: "unclear",
    trigger: "needs_review: " + reason.slice(0, 40),
    expectation_gap: null,
    checking_behaviour: null,
    confusion: null,
    outside_app_action: null,
    segment_signals: {
      first_time: "unknown",
      income_stability: "unknown",
      age_hint: null,
      money_source: null,
      influenced_by: null
    },
    unmet_need: null,
    evidence_quote: (item.clean_text || item.text).slice(0, 60),
    confidence: 0.1,
    needs_review: true
  };
}

export async function runTagging(sampleSize?: number) {
  const cleanItems: CleanInputItem[] = JSON.parse(
    fs.readFileSync(CLEAN_ITEMS_PATH, "utf-8")
  );

  const existingTaggedMap = loadExistingTagged();
  const itemsToProcess = sampleSize ? cleanItems.slice(0, sampleSize) : cleanItems;

  console.log(`\n🏷️ Starting Phase 3 Structured AI Tagging...`);
  console.log(`Total clean items available: ${cleanItems.length}`);
  console.log(`Items in this run: ${itemsToProcess.length} (sample: ${sampleSize || "ALL"})`);
  console.log(`Already cached items: ${existingTaggedMap.size}\n`);

  const BATCH_SIZE = 10;
  const pendingItems = itemsToProcess.filter((i) => !existingTaggedMap.has(i.id));
  console.log(`Pending items to tag: ${pendingItems.length}\n`);

  let processedCount = 0;
  let quoteMismatchCount = 0;

  for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
    const batch = pendingItems.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingItems.length / BATCH_SIZE);

    console.log(`⚡ Processing Batch ${batchNum}/${totalBatches} (${batch.length} items)...`);
    const results = await tagBatch(batch);

    for (let j = 0; j < batch.length; j++) {
      const input = batch[j];
      const tagResult = results.find((r) => r.id === input.id) || results[j];

      // Validate verbatim quote
      const quoteValid = verifyExactSubstring(input.clean_text || input.text, tagResult.evidence_quote);
      let finalResult = tagResult;

      if (!quoteValid) {
        quoteMismatchCount++;
        finalResult = {
          ...tagResult,
          evidence_quote: (input.clean_text || input.text).slice(0, 100),
          needs_review: true
        };
      }

      existingTaggedMap.set(input.id, {
        ...input,
        ...finalResult
      });
      processedCount++;
    }

    // Save progressively to cache
    saveTagged(Array.from(existingTaggedMap.values()));

    // Rate-limit spacer
    if (i + BATCH_SIZE < pendingItems.length) {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }


  const allTagged = Array.from(existingTaggedMap.values());
  const sampleTagged = itemsToProcess.map((item) => existingTaggedMap.get(item.id)!);

  const needsReviewCount = sampleTagged.filter((i) => i.needs_review || i.confidence < 0.5).length;

  console.log(`\n========================================================`);
  console.log(`📊 PHASE 3 TAGGING SUMMARY (${sampleTagged.length} items evaluated)`);
  console.log(`========================================================`);
  console.log(`Total tagged in dataset : ${allTagged.length}`);
  console.log(`Items in current sample : ${sampleTagged.length}`);
  console.log(`Needs review / low conf : ${needsReviewCount} (${((needsReviewCount / sampleTagged.length) * 100).toFixed(1)}%)`);
  console.log(`Quote mismatches noted  : ${quoteMismatchCount}`);

  // Breakdown by lifecycle stage
  const stageCounts: Record<string, number> = {};
  for (const item of sampleTagged) {
    stageCounts[item.lifecycle_stage] = (stageCounts[item.lifecycle_stage] || 0) + 1;
  }
  console.log(`\nLifecycle Stage Distribution:`);
  for (const [st, cnt] of Object.entries(stageCounts)) {
    console.log(`  • ${st.padEnd(26)} : ${cnt} (${((cnt / sampleTagged.length) * 100).toFixed(1)}%)`);
  }

  // Breakdown by churn type
  const churnCounts: Record<string, number> = {};
  for (const item of sampleTagged) {
    churnCounts[item.churn_type] = (churnCounts[item.churn_type] || 0) + 1;
  }
  console.log(`\nChurn Type Distribution:`);
  for (const [ch, cnt] of Object.entries(churnCounts)) {
    console.log(`  • ${ch.padEnd(26)} : ${cnt} (${((cnt / sampleTagged.length) * 100).toFixed(1)}%)`);
  }

  console.log(`\n========================================================`);
  console.log(`🔍 SAMPLE TAGGED OUTPUT (5 items):`);
  console.log(`========================================================`);
  for (const item of sampleTagged.slice(0, 5)) {
    console.log(`\n[ID: ${item.id}] Source: ${item.source}`);
    console.log(`Lifecycle Stage : ${item.lifecycle_stage}`);
    console.log(`Churn Type      : ${item.churn_type} | Action: ${item.action}`);
    console.log(`Trigger         : ${item.trigger}`);
    console.log(`Unmet Need      : ${item.unmet_need || "N/A"}`);
    console.log(`First-time User : ${item.segment_signals.first_time}`);
    console.log(`Evidence Quote  : "${item.evidence_quote}"`);
    console.log(`Confidence      : ${item.confidence} | Needs Review: ${item.needs_review}`);
  }
  console.log(`\n========================================================\n`);
}

// Run full dataset tagging (reads cache to continue where left off)
runTagging().catch(console.error);

