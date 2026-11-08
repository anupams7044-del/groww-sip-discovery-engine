import * as dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

import * as fs from "fs";
import * as path from "path";
import { callLLM } from "../lib/llm";

// Auto-load .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...v] = line.trim().split("=");
    if (k && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
  }
}

interface TaggedItem {
  id: string;
  source: string;
  text: string;
  clean_text: string;
  lifecycle_stage: string;
  churn_type: string;
  action: string;
  trigger: string;
  expectation_gap: string | null;
  checking_behaviour: string | null;
  confusion: string | null;
  outside_app_action: string | null;
  segment_signals: {
    first_time: string;
    income_stability: string;
    age_hint: string | null;
    money_source: string | null;
    influenced_by: string | null;
  };
  unmet_need: string | null;
  evidence_quote: string;
  confidence: number;
  source_url?: string;
}

const TAGGED_PATH = path.resolve(__dirname, "../data/tagged/items.json");
const allItems: TaggedItem[] = JSON.parse(fs.readFileSync(TAGGED_PATH, "utf-8"));

const FINANCIAL_ADVICE_PATTERNS = [
  /which (fund|stock|mutual fund|scheme) (should i|is best|to buy|will give)/i,
  /suggest (a |some )?(fund|stock|scheme|crypto|portfolio)/i,
  /recommend (a |some )?(fund|stock|portfolio)/i,
  /should i buy /i,
  /should i invest in /i,
  /predict.*(return|market|nifty|sensex)/i,
  /will .*give \d+%/i,
  /best mutual fund for 202/i,
  /top (small cap|large cap|mid cap|flexi cap|fund)/i
];

function isAdviceSeeking(query: string): boolean {
  return FINANCIAL_ADVICE_PATTERNS.some((rx) => rx.test(query));
}

async function askEngine(query: string) {
  // Check advice
  if (isAdviceSeeking(query)) {
    return {
      type: "declined_advice",
      answer: "Under SEBI regulations and project guardrails, this engine does not provide financial advice or fund recommendations. Please refer to official AMFI (mutualfundssahihai.com) and SEBI (investor.sebi.gov.in) investor resources.",
      confidence: "High",
      supporting_quotes: []
    };
  }

  // Retrieval
  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = allItems.map((item) => {
    const text = `${item.trigger || ""} ${item.unmet_need || ""} ${item.clean_text || item.text} ${item.confusion || ""} ${item.expectation_gap || ""}`.toLowerCase();
    let score = 0;
    for (const w of queryWords) {
      if (text.includes(w)) score++;
    }
    if (/first|start|begin/i.test(query) && item.segment_signals?.first_time === "yes") score += 2;
    if (/stop|pause|drop|cancel|reduce/i.test(query) && item.churn_type !== "none") score += 2;
    if (/mandate|autopay|bank|bounce/i.test(query) && item.lifecycle_stage === "payment_reliability") score += 3;
    return { item, score };
  });

  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.item);

  if (top.length < 3) {
    return {
      type: "insufficient_evidence",
      answer: "Not enough evidence in the dataset to answer this question confidently (< 3 matching items found).",
      confidence: "Low",
      item_count_used: top.length,
      supporting_quotes: []
    };
  }

  // Evidence synthesis
  const evidenceContext = top.slice(0, 8).map((it, idx) => ({
    id: it.id,
    source: it.source,
    quote: it.evidence_quote || it.clean_text.slice(0, 120),
    url: it.source_url
  }));

  const systemPrompt = `You are the AI Discovery Engine for Groww analyzing user feedback at scale.
Answer the PM research question based ONLY on the provided evidence items.
Output JSON:
{
  "answer": "Clear, concise 2-3 sentence PM finding with quantitative context.",
  "confidence": "High" | "Medium" | "Low",
  "follow_ups": ["question 1", "question 2"]
}`;

  const userPrompt = `Question: "${query}"\nEvidence items (N=${top.length}):\n${JSON.stringify(evidenceContext, null, 2)}`;

  const res = await callLLM({ systemPrompt, userPrompt, jsonMode: true, temperature: 0.1 });
  let parsed: any = {};
  try {
    parsed = JSON.parse(res);
  } catch (e) {
    const cleaned = res.replace(/```json/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleaned);
  }

  const quotes = top.slice(0, 3).map((it) => ({
    id: it.id,
    source: it.source,
    quote: it.evidence_quote || it.clean_text.slice(0, 100),
    url: it.source_url
  }));

  return {
    type: "answered",
    answer: parsed.answer || "Synthesis based on dataset.",
    confidence: parsed.confidence || "High",
    item_count_used: top.length,
    supporting_quotes: quotes,
    follow_ups: parsed.follow_ups || []
  };
}

const STARTER_QUESTIONS = [
  "1. Why do people start a SIP, and what do they expect to happen?",
  "2. What changes in their behaviour in the months after starting?",
  "3. What leads investors to pause, reduce or stop a SIP?",
  "4. What do investors check, and how often, once they have started?",
  "5. What confuses or worries them inside the app?",
  "6. What do they do outside the app when they feel unsure?",
  "7. What separates investors who continue from those who quietly drop off?",
  "8. How do these patterns differ across user segments (income stability, age, source of money, who influenced them)?",
  "9. What unmet needs emerge consistently across conversations?"
];

async function runAcceptanceTest() {
  console.log("==========================================================================================");
  console.log("🤖 PHASE 5 ACCEPTANCE TEST: 'ASK THE ENGINE' EVALUATION");
  console.log("==========================================================================================\n");

  for (let idx = 0; idx < STARTER_QUESTIONS.length; idx++) {
    const q = STARTER_QUESTIONS[idx];
    console.log(`\n------------------------------------------------------------------------------------------`);
    console.log(`❓ [Q${idx + 1}] ${q}`);
    console.log(`------------------------------------------------------------------------------------------`);
    const result = await askEngine(q);

    console.log(`\n💬 ANSWER (Confidence: [${result.confidence}] | Based on ${result.item_count_used || 0} items):`);
    console.log(result.answer);

    if (result.supporting_quotes && result.supporting_quotes.length > 0) {
      console.log(`\n📌 SUPPORTING EVIDENCE QUOTES:`);
      for (const sq of result.supporting_quotes) {
        console.log(`   • [${sq.source}] "${sq.quote}"`);
      }
    }

    if (result.follow_ups && result.follow_ups.length > 0) {
      console.log(`\n💡 SUGGESTED FOLLOW-UPS:`);
      for (const fu of result.follow_ups) {
        console.log(`   👉 "${fu}"`);
      }
    }
  }

  // 10. Financial Advice Blocker Test
  console.log(`\n==========================================================================================`);
  console.log(`🛡️ SAFETY TEST 1: FINANCIAL ADVICE BLOCKER`);
  console.log(`==========================================================================================`);
  const adviceQ = "Which mutual fund should I buy to get 30% return? Should I stop Groww SIP and buy Quant Small Cap?";
  console.log(`Query: "${adviceQ}"`);
  const adviceRes = await askEngine(adviceQ);
  console.log(`Result Type: ${adviceRes.type}`);
  console.log(`Response   : ${adviceRes.answer}`);

  // 11. Insufficient Evidence Fallback Test
  console.log(`\n==========================================================================================`);
  console.log(`🛡️ SAFETY TEST 2: INSUFFICIENT EVIDENCE FALLBACK`);
  console.log(`==========================================================================================`);
  const obscureQ = "How do users trade Brazilian commodities futures on Japanese currency exchanges?";
  console.log(`Query: "${obscureQ}"`);
  const obscureRes = await askEngine(obscureQ);
  console.log(`Result Type: ${obscureRes.type}`);
  console.log(`Response   : ${obscureRes.answer}`);
  console.log("\n==========================================================================================\n");
}

runAcceptanceTest().catch(console.error);
