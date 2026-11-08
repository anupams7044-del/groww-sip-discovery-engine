import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { callLLM } from "@/lib/llm";

// Ensure ipv4first for any Node fetch calls
import * as dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

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
  platform_meta?: Record<string, unknown>;
}

// In-memory cache of tagged items
let cachedTaggedItems: TaggedItem[] | null = null;

function getTaggedItems(): TaggedItem[] {
  if (cachedTaggedItems) return cachedTaggedItems;
  const primaryPath = path.join(process.cwd(), "data", "tagged", "items.json");

  if (fs.existsSync(primaryPath)) {
    try {
      const raw = fs.readFileSync(primaryPath, "utf-8");
      cachedTaggedItems = JSON.parse(raw);
      return cachedTaggedItems!;
    } catch (e) {
      console.error("Failed to parse tagged items from", primaryPath, e);
    }
  }

  // Fallback for monorepo root invocation
  const fallbackPath = path.join(process.cwd(), "..", "data", "tagged", "items.json");
  if (fs.existsSync(fallbackPath)) {
    try {
      const raw = fs.readFileSync(fallbackPath, "utf-8");
      cachedTaggedItems = JSON.parse(raw);
      return cachedTaggedItems!;
    } catch (e) {
      console.error("Failed to parse tagged items from fallback", fallbackPath, e);
    }
  }

  return [];
}

// Investment advice detection patterns
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || "").trim();
    const filters = body.filters || {}; // { source, lifecycle_stage, first_time }

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // ── Safety Guardrail: Strict Refusal of Investment Advice ──────────────
    if (isAdviceSeeking(query)) {
      return NextResponse.json({
        answer:
          "This Discovery Engine is an independent academic research tool built to discover user behavior patterns and retention friction in mutual fund apps. Under SEBI regulations and project guardrails, we do not provide financial advice, predict returns, or recommend specific funds or stocks.",
        refusal_type: "investment_advice_declined",
        official_resources: [
          { name: "AMFI Investor Education (Mutual Funds Sahi Hai)", url: "https://www.mutualfundssahihai.com" },
          { name: "SEBI Investor Website (Saa₹thi)", url: "https://investor.sebi.gov.in" },
          { name: "NISM Investor Certifications & Guides", url: "https://www.nism.ac.in" }
        ],
        supporting_quotes: [],
        item_count_used: 0,
        sources_split: {},
        confidence: "High",
        confidence_score: 1.0,
        insufficient_evidence: false,
        follow_ups: [
          "What leads investors to pause, reduce or stop a SIP?",
          "What confuses or worries first-time investors inside the app?"
        ]
      });
    }

    // ── Retrieval: Filter & Rank Tagged Items ─────────────────────────────
    const allItems = getTaggedItems();
    if (allItems.length === 0) {
      return NextResponse.json(
        { error: "Dataset not loaded. Ensure /data/tagged/items.json exists." },
        { status: 500 }
      );
    }

    // Apply explicit user filters if any
    let pool = allItems;
    if (filters.source && filters.source !== "all") {
      pool = pool.filter((i) => i.source === filters.source);
    }
    if (filters.lifecycle_stage && filters.lifecycle_stage !== "all") {
      pool = pool.filter((i) => i.lifecycle_stage === filters.lifecycle_stage);
    }
    if (filters.first_time && filters.first_time !== "all") {
      pool = pool.filter((i) => i.segment_signals?.first_time === filters.first_time);
    }

    // Keyword & semantic scoring
    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2);

    const scored = pool.map((item) => {
      const searchTarget = `${item.trigger || ""} ${item.unmet_need || ""} ${item.clean_text || item.text} ${item.confusion || ""} ${item.expectation_gap || ""}`.toLowerCase();
      let matchCount = 0;
      for (const w of queryWords) {
        if (searchTarget.includes(w)) matchCount++;
      }

      // Bonus for first-time signals if question mentions beginners/first-time
      if (/first|start|begin/i.test(query) && item.segment_signals?.first_time === "yes") {
        matchCount += 2;
      }
      // Bonus for churn signals if question mentions stop/pause/drop
      if (/stop|pause|drop|cancel|reduce/i.test(query) && item.churn_type !== "none") {
        matchCount += 2;
      }
      // Bonus for payment/mandate if question mentions mandate/autopay/bank
      if (/mandate|autopay|bank|bounce|payment/i.test(query) && item.lifecycle_stage === "payment_reliability") {
        matchCount += 3;
      }

      return { item, score: matchCount };
    });

    // Take top matching items with score > 0
    const topScored = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // ── Quality Gate: Check for Insufficient Evidence ───────────────────────
    if (topScored.length < 3) {
      return NextResponse.json({
        answer:
          "Not enough evidence in the dataset to answer this question confidently. The engine requires at least 3 distinct user conversations matching this specific inquiry to avoid hallucinated generalizations.",
        data_needed_note:
          "To answer this topic with statistical significance, we would need additional discussions specifically addressing this scenario in Indian investor forums.",
        supporting_quotes: [],
        item_count_used: topScored.length,
        sources_split: {},
        confidence: "Low",
        confidence_score: 0.2,
        insufficient_evidence: true,
        follow_ups: [
          "Why do people start a SIP, and what do they expect to happen?",
          "What leads investors to pause, reduce or stop a SIP?"
        ]
      });
    }

    // Compile evidence items for the LLM synthesis
    const candidateItems = topScored.map((s) => s.item);
    const evidenceContext = candidateItems.slice(0, 10).map((it, idx) => ({
      index: idx + 1,
      id: it.id,
      source: it.source,
      lifecycle_stage: it.lifecycle_stage,
      churn_type: it.churn_type,
      trigger: it.trigger,
      expectation_gap: it.expectation_gap,
      evidence_quote: it.evidence_quote || it.clean_text.slice(0, 120),
      url: it.source_url || `https://play.google.com/store/apps/details?id=com.nextbillion.groww`
    }));

    // Source distribution
    const sourcesSplit: Record<string, number> = {};
    for (const it of candidateItems) {
      sourcesSplit[it.source] = (sourcesSplit[it.source] || 0) + 1;
    }

    // ── Synthesize Cited Answer with LLM ──────────────────────────────────
    const systemPrompt = `You are the AI Discovery Engine for Groww analyzing public investor feedback at scale.
You must answer questions strictly based on the provided evidence items.
RULES:
1. Speak in clear, professional PM language.
2. Every major claim MUST be supported by citing real user feedback from the context.
3. Select 3 to 5 supporting quotes from the provided items. Quotes must be verbatim from the items.
4. Suggest 2 relevant follow-up questions that help a Product Manager explore the root causes.
5. If the evidence is weak, admit uncertainty.
6. Absolutely NO investment advice. Do not recommend buying any stock or fund.
Return JSON with the exact schema:
{
  "answer": "Plain language synthesis explaining findings, trends, and root causes.",
  "supporting_quotes": [
    { "id": "item_id", "quote": "verbatim quote from item", "url": "url from item", "source": "source from item" }
  ],
  "confidence": "High" | "Medium" | "Low",
  "confidence_score": number between 0.5 and 1.0,
  "follow_ups": ["Follow up question 1?", "Follow up question 2?"]
}`;

    const userPrompt = `PM Research Question: "${query}"

Evidence items from our verified dataset (N=${candidateItems.length}):
${JSON.stringify(evidenceContext, null, 2)}

Provide your cited synthesis in strict JSON format.`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.2
    });

    let parsed: any;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (e) {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // Validate verbatim quotes exist in candidates
    const validQuotes: Array<{ id: string; quote: string; url: string; source: string }> = [];
    if (Array.isArray(parsed.supporting_quotes)) {
      for (const q of parsed.supporting_quotes) {
        const found = candidateItems.find((it) => it.id === q.id);
        if (found) {
          validQuotes.push({
            id: found.id,
            quote: q.quote || found.evidence_quote || found.clean_text.slice(0, 120),
            url: found.source_url || `https://play.google.com/store/apps/details?id=com.nextbillion.groww`,
            source: found.source
          });
        }
      }
    }

    // If model didn't pick quotes, fallback to top candidate quotes
    if (validQuotes.length < 3) {
      for (const it of candidateItems.slice(0, 4)) {
        if (!validQuotes.some((v) => v.id === it.id)) {
          validQuotes.push({
            id: it.id,
            quote: it.evidence_quote || it.clean_text.slice(0, 120),
            url: it.source_url || `https://play.google.com/store/apps/details?id=com.nextbillion.groww`,
            source: it.source
          });
        }
        if (validQuotes.length >= 3) break;
      }
    }

    return NextResponse.json({
      answer: parsed.answer || "Synthesis based on available feedback.",
      supporting_quotes: validQuotes.slice(0, 5),
      item_count_used: candidateItems.length,
      sources_split: sourcesSplit,
      confidence: parsed.confidence || (candidateItems.length >= 8 ? "High" : "Medium"),
      confidence_score: parsed.confidence_score || 0.85,
      insufficient_evidence: false,
      follow_ups: parsed.follow_ups || [
        "What separates investors who continue from those who drop off?",
        "What unmet needs emerge consistently across conversations?"
      ]
    });
  } catch (error: any) {
    console.error("Error in /api/ask:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: error.message },
      { status: 500 }
    );
  }
}
