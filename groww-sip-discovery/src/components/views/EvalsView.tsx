"use client";

import React, { useState } from "react";

interface CaseStudy {
  id: string;
  source: string;
  quote: string;
  aiOutput: {
    stage?: string;
    churn_type?: string;
    action?: string;
    trigger?: string;
  };
  humanLabel: {
    stage?: string;
    churn_type?: string;
    action?: string;
    trigger?: string;
  };
  pmRationale: string;
  takeaway: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "reddit_groww_mandate_bounce",
    source: "Reddit (r/groww)",
    quote: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge on my account! When I reached out to customer care, they blamed the bank and refused to reimburse. Cancelled all 4 active SIPs immediately.",
    aiOutput: {
      churn_type: "involuntary",
      trigger: "₹590 bank bounce charge",
    },
    humanLabel: {
      churn_type: "voluntary",
      trigger: "bank penalty backlash",
    },
    pmRationale: "The AI mistook the bank payment failure for involuntary churn. However, the customer did not churn because their account was closed; they churned because they made an active decision to terminate all 4 active SIPs in outrage.",
    takeaway: "Involuntary tech failure provoked a high-churn voluntary response. Involuntary churn can be mitigated with retries, but voluntary penalty churn requires proactive pre-debit notifications and a bounce fee reimbursement policy."
  },
  {
    id: "youtube_ritu_malhotra_delhi_2025_06_03T11_22_00Z",
    source: "YouTube (r/mutualfunds discussion)",
    quote: "Completed 12 months of active SIP without missing any month! The secret was keeping the debit date 2 days after salary and not opening the portfolio app for the first 6 months. Milestone tracking helped a lot.",
    aiOutput: {
      stage: "re_engagement",
      action: "restarted",
    },
    humanLabel: {
      stage: "voluntary_decision_m3_12",
      action: "continuing",
    },
    pmRationale: "The AI associated the 12-month mark with 're-engaging' a lapsed investor. In reality, this user is the exact benchmark of graduation success: an investor who maintained continuous active status for 12 consecutive months.",
    takeaway: "Highlights the primary behavioral enablers for 12-month active SIP retention: post-salary debit date alignment (+2 days) and intentional behavioral detachment from daily portfolio volatility."
  },
  {
    id: "appstore_https___apps_apple_com_review_seed_3",
    source: "Apple App Store",
    quote: "Mandate registration takes too long: I registered my autopay mandate 2 weeks ago and it is still showing pending. Because of this my SIP payment was missed this month. Very frustrating experience with the NACH registration.",
    aiOutput: {
      stage: "setup",
      trigger: "slow mandate approval",
    },
    humanLabel: {
      stage: "payment_reliability",
      trigger: "eNACH bank approval bottleneck",
    },
    pmRationale: "The AI classified this as onboarding ('setup') failure. However, KYC and account setup were completed weeks prior; the breakdown occurred specifically at the recurring mandate approval stage between Groww and NPCI/bank.",
    takeaway: "Treating mandate delays as setup issues obscures the real growth problem: the opaque 7-14 day gap between customer intent to pay and third-party bank infrastructure readiness."
  }
];

const FAILURE_PATTERNS = [
  {
    pattern: "Voluntary vs. Involuntary Churn on Bank Penalty Backlash",
    frequency: "3 out of 8 disagreements",
    severity: "High",
    aiBehavior: "AI categorized items with bank bounce fees (e.g., ₹590) as 'involuntary' because the technical failure originated at the bank.",
    pmCorrection: "Marked as 'voluntary' when the user explicitly took action to cancel their SIPs in anger.",
    remedy: "Prompt updated: If a user executes a cancellation button click in response to an automated bounce fee, tag churn_type = 'voluntary' with trigger 'mandate_penalty_backlash'."
  },
  {
    pattern: "Setup vs. Payment Reliability on Recurring Mandate Delays",
    frequency: "2 out of 8 disagreements",
    severity: "Medium",
    aiBehavior: "Tagged eNACH pending approval delays as 'setup' because registration was pending.",
    pmCorrection: "Initial account setup was finished; the failure is in the payment reliability infrastructure layer.",
    remedy: "Taxonomy rule: Reserve 'setup' exclusively for KYC and account onboarding; autopay/eNACH belongs to 'payment_reliability'."
  },
  {
    pattern: "Milestone Retention Labeled as Re-engagement",
    frequency: "1 out of 8 disagreements",
    severity: "Medium",
    aiBehavior: "Tagged 12-month milestone completion testimonials under 're_engagement'.",
    pmCorrection: "The user never lapsed; they are an exemplary retention case under voluntary_decision_m3_12.",
    remedy: "Rule: Reserve 're_engagement' exclusively for dormant, paused, or cancelled investors returning to the platform."
  },
  {
    pattern: "Neutral Feature Inquiries Tagged as Unclear Churn",
    frequency: "2 out of 8 disagreements",
    severity: "Low",
    aiBehavior: "User questions about SIP insurance or demat statements tagged as churn_type = 'unclear'.",
    pmCorrection: "Product inquiries without cancellation intent should be tagged as churn_type = 'none'.",
    remedy: "Clarified prompt: Only tag churn when user exhibits explicit drop-off signals or active intent."
  }
];

export function EvalsView() {
  const [activeTab, setActiveTab] = useState<"scorecard" | "case_studies" | "failure_modes">("scorecard");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
              Phase 6 Evaluation Rig
            </span>
            <span className="text-xs text-[#9EA0A8]">20 Hand-Labeled Golden Items • Dual Ground Truth</span>
          </div>

          <a
            href="/EVIDENCE_LOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#232734] hover:bg-[#2A2F3E] border border-[#282D3D] hover:border-[#00D09C]/50 text-white hover:text-[#00D09C] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm w-fit"
          >
            <span>📄</span>
            <span>View Full AI Evidence Log (.md)</span>
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Model Evaluation &amp; Quality Evidence
          </h1>
          <p className="text-sm text-[#9EA0A8] max-w-3xl leading-relaxed mt-1">
            To ensure production-grade reliability, we benchmarked Google Gemini 3.5 Flash-Lite against a human-validated Golden Benchmark across 6 critical taxonomy dimensions.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-[#282D3D]">
        <button
          onClick={() => setActiveTab("scorecard")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "scorecard"
              ? "border-[#00D09C] text-[#00D09C]"
              : "border-transparent text-[#9EA0A8] hover:text-white"
          }`}
        >
          Accuracy Scorecard
        </button>
        <button
          onClick={() => setActiveTab("case_studies")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "case_studies"
              ? "border-[#00D09C] text-[#00D09C]"
              : "border-transparent text-[#9EA0A8] hover:text-white"
          }`}
        >
          PM Correction Case Studies (3)
        </button>
        <button
          onClick={() => setActiveTab("failure_modes")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "failure_modes"
              ? "border-[#00D09C] text-[#00D09C]"
              : "border-transparent text-[#9EA0A8] hover:text-white"
          }`}
        >
          Top Failure Patterns &amp; Fixes
        </button>
      </div>

      {/* Tab 1: Accuracy Scorecard */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">First-Time Signal</span>
              <p className="text-2xl font-bold text-[#00D09C] mt-1">100%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">20/20 Perfect</p>
            </div>
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">Action Agreement</span>
              <p className="text-2xl font-bold text-[#00D09C] mt-1">95%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">19/20 Matches</p>
            </div>
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">Lifecycle Stage</span>
              <p className="text-2xl font-bold text-[#00D09C] mt-1">90%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">18/20 Matches</p>
            </div>
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">Quote Exactness</span>
              <p className="text-2xl font-bold text-[#5367FF] mt-1">85%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">Verbatim substring</p>
            </div>
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">Churn Type</span>
              <p className="text-2xl font-bold text-[#FFB61B] mt-1">75%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">15/20 Matches</p>
            </div>
            <div className="bg-[#1C2028] p-4 rounded-xl border border-[#282D3D] shadow-sm">
              <span className="text-[11px] text-[#9EA0A8] font-medium">Strict All-Field</span>
              <p className="text-2xl font-bold text-[#5367FF] mt-1">65%</p>
              <p className="text-[10px] text-[#696C7C] mt-1">13/20 Zero Error</p>
            </div>
          </div>

          {/* Golden Set Table Card */}
          <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#282D3D] bg-[#232734] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Evaluation Dataset Summary</h3>
                <p className="text-xs text-[#9EA0A8] mt-0.5">Benchmarked against real multi-channel user reviews</p>
              </div>
              <span className="text-xs bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30 font-semibold px-2.5 py-1 rounded-full">
                Model: Gemini 3.5 Flash-Lite
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#9EA0A8] uppercase tracking-wider">Evaluation Methodology</h4>
                  <ul className="text-xs text-gray-200 space-y-2 list-disc pl-4">
                    <li><strong className="text-white">Stratified Sampling:</strong> Golden set selected items across all 5 life-cycle stages and 5 acquisition channels (Play Store, App Store, YouTube, Reddit, TradingQnA).</li>
                    <li><strong className="text-white">Zero-Shot Instruction Tuning:</strong> AI prompt enriched with strict Zod enum definitions, lifecycle transitions, and verbatim quote instructions.</li>
                    <li><strong className="text-white">Algorithmic Exact-Match Validation:</strong> Verbatim quotes programmatically checked with <code>raw_text.includes(quote)</code>; failed quotes rejected.</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#9EA0A8] uppercase tracking-wider">Disagreement Breakdown</h4>
                  <p className="text-xs text-gray-200">
                    Of the 8 total field disagreements recorded across the 20 golden items, <strong className="text-white">5 were in Churn Type categorization</strong> where involuntary payment glitches triggered angry voluntary terminations.
                  </p>
                  <div className="p-3 bg-[#FFB61B]/10 rounded-xl border border-[#FFB61B]/30 text-xs text-[#FFB61B]">
                    <strong className="text-white">Key Evaluation Lesson:</strong> Human PM intervention is essential for understanding secondary emotional reactions (canceling out of spite) vs pure technical failures (account auto-paused).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PM Case Studies */}
      {activeTab === "case_studies" && (
        <div className="space-y-6">
          <p className="text-xs text-[#9EA0A8]">
            Documenting the exact instances where human product intuition overrode AI classification to protect product strategy integrity:
          </p>

          <div className="grid grid-cols-1 gap-6">
            {CASE_STUDIES.map((study, idx) => (
              <div key={study.id} className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#282D3D] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#00D09C]/15 text-[#00D09C] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{study.id}</h3>
                    <span className="text-xs px-2 py-0.5 bg-[#232734] text-gray-200 border border-[#282D3D] rounded">
                      {study.source}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#ED5533] bg-[#ED5533]/15 px-2.5 py-0.5 rounded border border-[#ED5533]/30">
                    Human PM Overruled AI
                  </span>
                </div>

                <div className="bg-[#232734] p-3.5 rounded-xl border border-[#282D3D] text-xs text-gray-200 italic">
                  "{study.quote}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#ED5533]/10 rounded-xl border border-[#ED5533]/30 space-y-1">
                    <p className="text-xs font-bold text-[#ED5533] uppercase tracking-wider mb-1">AI Output (Rejected)</p>
                    <div className="text-xs text-gray-200 space-y-1">
                      {study.aiOutput.stage && <div>Stage: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#ED5533]">{study.aiOutput.stage}</code></div>}
                      {study.aiOutput.churn_type && <div>Churn: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#ED5533]">{study.aiOutput.churn_type}</code></div>}
                      {study.aiOutput.action && <div>Action: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#ED5533]">{study.aiOutput.action}</code></div>}
                      {study.aiOutput.trigger && <div>Trigger: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#ED5533]">{study.aiOutput.trigger}</code></div>}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#00D09C]/10 rounded-xl border border-[#00D09C]/30 space-y-1">
                    <p className="text-xs font-bold text-[#00D09C] uppercase tracking-wider mb-1">Human PM Correction (Accepted)</p>
                    <div className="text-xs text-gray-200 space-y-1">
                      {study.humanLabel.stage && <div>Stage: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#00D09C]">{study.humanLabel.stage}</code></div>}
                      {study.humanLabel.churn_type && <div>Churn: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#00D09C]">{study.humanLabel.churn_type}</code></div>}
                      {study.humanLabel.action && <div>Action: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#00D09C]">{study.humanLabel.action}</code></div>}
                      {study.humanLabel.trigger && <div>Trigger: <code className="bg-[#1C2028] px-1 py-0.5 rounded text-[#00D09C]">{study.humanLabel.trigger}</code></div>}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-white mb-1">PM Rationale:</p>
                  <p className="text-xs text-[#9EA0A8] leading-relaxed">{study.pmRationale}</p>
                </div>

                <div className="bg-[#00D09C]/10 p-3 rounded-xl border border-[#00D09C]/30 text-xs text-[#00D09C]">
                  <strong className="text-white">Strategic Takeaway:</strong> {study.takeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Failure Modes */}
      {activeTab === "failure_modes" && (
        <div className="space-y-4">
          <p className="text-xs text-[#9EA0A8]">
            Systematic pattern analysis of LLM edge cases, misclassifications, and the algorithmic/prompt fixes deployed:
          </p>

          <div className="grid grid-cols-1 gap-4">
            {FAILURE_PATTERNS.map((item, idx) => (
              <div key={idx} className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#232734] border border-[#282D3D] text-gray-200 text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {item.pattern}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9EA0A8]">{item.frequency}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      item.severity === "High" ? "bg-[#ED5533]/15 text-[#ED5533] border border-[#ED5533]/30" :
                      item.severity === "Medium" ? "bg-[#FFB61B]/15 text-[#FFB61B] border border-[#FFB61B]/30" :
                      "bg-[#5367FF]/15 text-[#5367FF] border border-[#5367FF]/30"
                    }`}>
                      {item.severity} Severity
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#ED5533]/10 rounded-xl border border-[#ED5533]/20">
                    <span className="font-semibold text-[#ED5533] block mb-1">AI Misinterpretation</span>
                    <p className="text-gray-200">{item.aiBehavior}</p>
                  </div>
                  <div className="p-3 bg-[#00D09C]/10 rounded-xl border border-[#00D09C]/20">
                    <span className="font-semibold text-[#00D09C] block mb-1">PM Ground Truth</span>
                    <p className="text-gray-200">{item.pmCorrection}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#232734] rounded-xl border border-[#282D3D] text-xs text-gray-200 flex items-center gap-2">
                  <span className="font-semibold text-white shrink-0">Engineering Fix:</span>
                  <span className="text-[#9EA0A8]">{item.remedy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
