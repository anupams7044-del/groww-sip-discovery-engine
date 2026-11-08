"use client";

import React, { useState } from "react";

interface StepDetail {
  step: number;
  name: string;
  badge: string;
  codeRole: string;
  aiRole: string;
  whyHybrid: string;
  inputs: string;
  outputs: string;
  guardrails: string;
}

const PIPELINE_STEPS: StepDetail[] = [
  {
    step: 1,
    name: "Multi-Source Raw Ingestion",
    badge: "100% Deterministic Code",
    codeRole: "Scrapes and formats reviews across 12 Indian Demat/MF apps (Play Store, App Store), Discourse community forums (TradingQnA), Reddit (r/mutualfunds, r/groww), and YouTube finance discussions.",
    aiRole: "None. Using an LLM for web scraping or network pagination wastes cost, introduces hallucinated URLs, and lacks rate-limiting control.",
    whyHybrid: "Code handles pagination, deduplication, retries, and rate limits with zero API cost and deterministic reliability.",
    inputs: "12 Indian Demat app IDs, App Store RSS, Discourse API, YouTube Data API",
    outputs: "1,088 raw JSON records in data/raw/ + data/raw/manifest.json",
    guardrails: "Strict per-app rate limiting, user-agent rotation, retry backoff."
  },
  {
    step: 2,
    name: "Cleaning & Relevance Funnel",
    badge: "100% Deterministic Code",
    codeRole: "3-stage regex & hash filter: (1) Deduplication by normalized text hash, (2) Length & noise removal (<8 words, bot spam, generic 1-word ratings), (3) Mutual Fund/SIP domain relevance keyword matching.",
    aiRole: "None. Regex and string sets can filter 1,000+ items in <10ms for free. AI tagging would cost $5+ and add 5 minutes of latency for low-signal reviews.",
    whyHybrid: "Algorithmic filtering purges 63 noisy/duplicate items instantly, ensuring the LLM in Step 3 only receives high-density, context-rich user feedback.",
    inputs: "1,088 raw records",
    outputs: "1,025 clean records (94.2% retention) + data/clean/funnel.json",
    guardrails: "Strict length threshold, non-English exclusion, keyword whitelist."
  },
  {
    step: 3,
    name: "Structured AI Tagging against Metric Tree",
    badge: "Hybrid: LLM + Zod Validation",
    codeRole: "Batches records (10 per prompt), validates LLM output against Zod schemas, enforces enum types, and programmatically verifies that extracted quotes exist verbatim in raw text.",
    aiRole: "Google Gemini 3.5 Flash-Lite parses nuanced human complaints into structured dimensions: Lifecycle Stage (5 stages), Churn Type (Voluntary vs Involuntary), Action, Trigger, and exact quote.",
    whyHybrid: "Keyword search cannot distinguish whether 'failed' refers to a UPI mandate or app crash. LLM understands semantic intent; TypeScript/Zod enforces production schema compliance.",
    inputs: "1,025 clean records + Metric Tree taxonomy prompt",
    outputs: "1,025 tagged JSON records with 97.9% verbatim quote fidelity",
    guardrails: "Strict Zod parsing, algorithmic verbatim substring check, auto-flagging to 'needs_review' on mismatch."
  },
  {
    step: 4,
    name: "Opportunity Scoring & Clustering",
    badge: "100% Deterministic Code",
    codeRole: "Aggregates 1,025 tagged items into 10 MECE thematic clusters, calculates volume shares, and computes normalized opportunity scores: Opp Score = (Volume % × Severity × Addressability) / 10.",
    aiRole: "None. Scoring formulas, percentage shares, and ranking should be 100% reproducible and auditable in unit tests, not subject to LLM stochastic drift.",
    whyHybrid: "Separates semantic classification (handled in Step 3) from mathematical prioritization. Stakeholders can inspect exact formulas and change weights instantly.",
    inputs: "1,025 tagged records + addressability criteria",
    outputs: "10 MECE thematic clusters + 10 prioritized opportunity briefs in data/insights/",
    guardrails: "SEBI compliance addressability multiplier (score 0 for restricted fund recommendations)."
  },
  {
    step: 5,
    name: "Ask-the-Engine Guardrailed Q&A",
    badge: "Hybrid: RAG + Guardrail Engine",
    codeRole: "Deterministic keyword retrieval across 1,025 tagged items, hard negative filters (refuses stock/fund advice, detects zero-evidence queries), and programmatic citation verification.",
    aiRole: "Synthesizes multi-review patterns into concise PM answers with direct verbatim quotes and source metadata.",
    whyHybrid: "Provides instant PM answers backed by real user voices, while hard programmatic guardrails prevent regulatory non-compliance.",
    inputs: "User query + top retrieved evidence records",
    outputs: "Structured answer with key takeaways, verbatim quotes, and confidence score",
    guardrails: "Auto-refusal on financial advice keywords, fallback on low evidence (<2 items), verbatim quote check."
  }
];

export function PipelineView() {
  const [selectedStep, setSelectedStep] = useState<number>(3);

  const active = PIPELINE_STEPS.find((s) => s.step === selectedStep) || PIPELINE_STEPS[2];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
            System Architecture
          </span>
          <span className="text-xs text-[#9EA0A8]">Hybrid AI &amp; Deterministic Engineering</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          How the Discovery Pipeline Works
        </h1>
        <p className="text-sm text-[#9EA0A8] max-w-3xl leading-relaxed">
          An AI discovery engine is only as good as its discipline. Explore where code provides deterministic guarantees, and where AI provides semantic understanding.
        </p>
      </div>

      {/* Interactive 5-Step Pipeline Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PIPELINE_STEPS.map((s) => {
          const isSelected = s.step === selectedStep;
          return (
            <button
              key={s.step}
              onClick={() => setSelectedStep(s.step)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#232734] border-[#00D09C] ring-1 ring-[#00D09C]/40 shadow-lg"
                  : "bg-[#1C2028] border-[#282D3D] hover:border-[#3E455B]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    isSelected ? "bg-[#00D09C] text-black" : "bg-[#232734] border border-[#282D3D] text-[#9EA0A8]"
                  }`}
                >
                  {s.step}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.badge.includes("Hybrid")
                      ? "bg-[#5367FF]/15 text-[#5367FF] border border-[#5367FF]/30"
                      : "bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30"
                  }`}
                >
                  {s.badge.includes("Hybrid") ? "Hybrid" : "Code"}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white leading-snug">{s.name}</h3>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Card for Selected Step */}
      <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#282D3D] bg-[#232734] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#00D09C] text-black font-extrabold flex items-center justify-center text-sm shadow-md">
              {active.step}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{active.name}</h2>
              <span className="text-xs text-[#9EA0A8]">Step {active.step} of 5 in Discovery Funnel</span>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
            {active.badge}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Dual Columns: Code Role vs AI Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-[#5367FF]/30 bg-[#5367FF]/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5367FF]"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5367FF]">
                  Role of Deterministic Code
                </h4>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{active.codeRole}</p>
            </div>

            <div className="p-4 rounded-xl border border-[#5367FF]/30 bg-[#5367FF]/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#84A4FF]"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#84A4FF]">
                  Role of Generative AI (LLM)
                </h4>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{active.aiRole}</p>
            </div>
          </div>

          {/* Why Hybrid Architecture Earns Its Place */}
          <div className="p-4 rounded-xl border border-[#282D3D] bg-[#232734] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Why This Architecture Earns Its Place
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed">{active.whyHybrid}</p>
          </div>

          {/* I/O and Guardrails Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-[#232734] rounded-xl border border-[#282D3D]">
              <span className="text-[11px] font-semibold text-[#9EA0A8] uppercase tracking-wider block mb-1">
                Inputs
              </span>
              <span className="text-xs text-white font-medium">{active.inputs}</span>
            </div>

            <div className="p-3 bg-[#232734] rounded-xl border border-[#282D3D]">
              <span className="text-[11px] font-semibold text-[#9EA0A8] uppercase tracking-wider block mb-1">
                Outputs
              </span>
              <span className="text-xs text-white font-medium">{active.outputs}</span>
            </div>

            <div className="p-3 bg-[#232734] rounded-xl border border-[#282D3D]">
              <span className="text-[11px] font-semibold text-[#9EA0A8] uppercase tracking-wider block mb-1">
                Active Guardrail
              </span>
              <span className="text-xs text-[#00D09C] font-semibold">{active.guardrails}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Principle Table */}
      <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Engineering Principle: Where AI vs Code Wins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#00D09C]/10 rounded-xl border border-[#00D09C]/20">
            <p className="font-bold text-[#00D09C] mb-2">Code Wins (Zero Hallucination, Free, Fast)</p>
            <ul className="space-y-1.5 text-gray-200 list-disc pl-4">
              <li>Scraping pagination, rate limits, and network retries</li>
              <li>Hash deduplication and word-count threshold filtering</li>
              <li>Zod runtime schema enforcement and quote substring checks</li>
              <li>Mathematical prioritization formulas and ranking</li>
              <li>SEBI regulatory blacklist keyword interception</li>
            </ul>
          </div>
          <div className="p-4 bg-[#5367FF]/10 rounded-xl border border-[#5367FF]/20">
            <p className="font-bold text-[#84A4FF] mb-2">AI Wins (Semantic &amp; Context Understanding)</p>
            <ul className="space-y-1.5 text-gray-200 list-disc pl-4">
              <li>Discerning voluntary vs involuntary churn in colloquial Hindi/English</li>
              <li>Extracting the exact sentence where pain was experienced</li>
              <li>Mapping messy reviews into 5 structured lifecycle stages</li>
              <li>Synthesizing multi-item user sentiment into coherent PM takeaways</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
