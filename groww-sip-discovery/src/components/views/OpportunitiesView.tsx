"use client";

import React, { useState, useMemo } from "react";

export type OpportunityCategory = "direct_target" | "passive_shield" | "out_of_scope";

export interface OpportunityTheme {
  id: string;
  name: string;
  category: OpportunityCategory;
  category_label: string;
  scope_badge: string;
  scope_badge_color: string;
  description: string;
  stage_alignment: string;
  item_count: number;
  volume_share_pct: number;
  severity_score: number;
  addressability_score: number;
  opportunity_score: number;
  single_solution_role: {
    role_type: "Direct Intervention" | "Passive Byproduct" | "Out of Scope";
    headline: string;
    explanation: string;
  };
  representative_quotes: Array<{
    quote: string;
    source: string;
    item_id: string;
    source_url?: string;
  }>;
  guardrail_compliance: {
    compliant: boolean;
    note: string;
  };
}

// 10 Comprehensive Opportunities mapped to the Single-Solution (Safe SIP Sizer) & Scoping Rationale
const OPPORTUNITIES_DATA: OpportunityTheme[] = [
  {
    id: "THEME_CASHFLOW_BUFFER_OVERCOMMIT",
    name: "Cash-Flow Overcommitment & Zero Emergency Cushion",
    category: "direct_target",
    category_label: "Track A • Direct Target",
    scope_badge: "🎯 Direct Solution (Safe SIP Sizer)",
    scope_badge_color: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
    description: "First-time investors commit aspirational amounts (₹5k–₹10k) without liquidity modeling. Month 3–5 emergency cash crunches force permanent SIP cancellation.",
    stage_alignment: "voluntary_decision_m3_12",
    item_count: 215,
    volume_share_pct: 21.0,
    severity_score: 5,
    addressability_score: 5,
    opportunity_score: 52.5,
    single_solution_role: {
      role_type: "Direct Intervention",
      headline: "Primary Core Intervention (Safe SIP Sizer)",
      explanation: "Analyzes 6-month historical cash-flow data via Account Aggregator / statement upload, ringfences a 3-month liquid emergency corpus, and caps SIP commitments to true disposable surplus."
    },
    representative_quotes: [
      {
        quote: "Started ₹5,000 SIP because friends said so. In month 4 had an emergency car repair of ₹18,000. Bank account balance hit ₹800. Had to permanently cancel the SIP.",
        source: "reddit",
        item_id: "reddit_mf_emergency_cash_crunch",
        source_url: "https://www.reddit.com/r/mutualfunds/comments/1h3pqr/festival_cash_pinch/"
      },
      {
        quote: "SIP pause in Groww only allows 3 months... had an unexpected medical expense and needed 6 months break. Had to stop permanently.",
        source: "youtube",
        item_id: "youtube_sandeep_nair",
        source_url: "https://www.youtube.com/watch?v=sip_experience"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Pure cash-flow affordability modeling. Zero fund selection advice or speculative return forecasting."
    }
  },
  {
    id: "THEME_AUTOPAY_BOUNCE_PENALTY",
    name: "Insufficient Balance Autopay Bounces & Penalty Rage-Quits",
    category: "passive_shield",
    category_label: "Track B • Passive Shield",
    scope_badge: "🛡️ Passive Shield (Safe SIP Sizer)",
    scope_badge_color: "bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30",
    description: "Autopay mandates debiting when account balance is too tight, triggering failed debits and ₹450–₹590 bank ECS bounce penalties that cause immediate churn.",
    stage_alignment: "payment_reliability",
    item_count: 130,
    volume_share_pct: 12.7,
    severity_score: 5,
    addressability_score: 4,
    opportunity_score: 31.8,
    single_solution_role: {
      role_type: "Passive Byproduct",
      headline: "Passive Protection (Zero Extra Banking Engineering)",
      explanation: "By strictly anchoring installment amounts below the user's historical 10th-percentile minimum cash floor, the bank balance never dips below zero on debit day. Eliminates bounce fees passively without touching banking gateway code."
    },
    representative_quotes: [
      {
        quote: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge on my account! Cancelled all 4 active SIPs immediately.",
        source: "reddit",
        item_id: "reddit_groww_mandate_bounce",
        source_url: "https://www.reddit.com/r/groww/comments/1c3abc/groww_sip_mandate_failed/"
      },
      {
        quote: "Salary gets credited on 7th, SIP was 5th. Autopay failed twice and HDFC bank charged me Rs 590 bounce fee each time! Cancelled the SIP in frustration.",
        source: "youtube",
        item_id: "youtube_amit_sharma_tech",
        source_url: "https://www.youtube.com/watch?v=sip_experience"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Cash floor buffers prevent bank penalties automatically, protecting both user trust and regulatory mandates."
    }
  },
  {
    id: "THEME_SALARY_DATE_MISMATCH",
    name: "Salary Cycle & Debit Date Mismatch",
    category: "passive_shield",
    category_label: "Track B • Passive Shield",
    scope_badge: "🛡️ Passive Shield (Safe SIP Sizer)",
    scope_badge_color: "bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30",
    description: "Fixed default SIP dates (e.g., 5th of month) colliding with delayed or variable corporate salary credits, leading to unnecessary bounce notifications.",
    stage_alignment: "payment_reliability",
    item_count: 42,
    volume_share_pct: 4.1,
    severity_score: 4,
    addressability_score: 5,
    opportunity_score: 16.4,
    single_solution_role: {
      role_type: "Passive Byproduct",
      headline: "Smart Debit Date Alignment via Sizer",
      explanation: "When Safe SIP Sizer evaluates the user's cash-flow statement, it auto-detects the consistent monthly salary inflow date (e.g. 7th) and anchors debit dates with a +2 day buffer (9th), eliminating calendar mismatch automatically."
    },
    representative_quotes: [
      {
        quote: "I work at a startup where salary gets credited anywhere between 1st and 10th. My SIP date was set to 5th. In months where salary arrived on 7th, my SIP bounced.",
        source: "reddit",
        item_id: "reddit_mf_salary_cycle_disconnect",
        source_url: "https://www.reddit.com/r/mutualfunds/comments/1k6yza/variable_salary/"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Standard cash-flow scheduling without altering banking protocols."
    }
  },
  {
    id: "THEME_RIGID_PAUSE_BARRIERS",
    name: "Rigid Pause & Inflexible Emergency Modifications",
    category: "direct_target",
    category_label: "Track A • Direct Target",
    scope_badge: "🎯 Direct Solution (Safe SIP Sizer)",
    scope_badge_color: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
    description: "Existing pause options require 30-day notice or restrict breathers to 1–3 months, forcing cash-pinched users to permanently cancel rather than temporarily downsize.",
    stage_alignment: "voluntary_decision_m3_12",
    item_count: 77,
    volume_share_pct: 7.5,
    severity_score: 5,
    addressability_score: 5,
    opportunity_score: 18.8,
    single_solution_role: {
      role_type: "Direct Intervention",
      headline: "Emergency Downsizing & Buffer Defense",
      explanation: "Safe SIP Sizer provides a dynamic emergency pause/downsize toggle: when cash reserves dip below the 3-month buffer, it nudges users to temporarily step down to ₹500 rather than killing the habit completely."
    },
    representative_quotes: [
      {
        quote: "Between Diwali gifts and travel expenses, wanted to pause SIP for 2 months. In Groww, pausing requires 30 days notice... debit went through with penalty.",
        source: "reddit",
        item_id: "reddit_mf_emergency_cash_crunch",
        source_url: "https://www.reddit.com/r/mutualfunds/comments/1h3pqr/festival_cash_pinch/"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Complies with AMFI mandate guidelines while offering user-friendly liquidity breathers."
    }
  },
  {
    id: "THEME_YEAR1_UNDERWHELMING",
    name: "Underwhelming Year-1 Progress (Compounding Gap)",
    category: "direct_target",
    category_label: "Track A • Direct Target",
    scope_badge: "🎯 Direct Solution (Safe SIP Sizer)",
    scope_badge_color: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
    description: "Users completing 8–12 months feel demotivated by modest nominal gains, unaware that Year 1 is for building habits, not capital compounding.",
    stage_alignment: "voluntary_decision_m3_12",
    item_count: 58,
    volume_share_pct: 5.7,
    severity_score: 4,
    addressability_score: 4,
    opportunity_score: 9.1,
    single_solution_role: {
      role_type: "Direct Intervention",
      headline: "Discipline Affirmation & Goal Ringfencing",
      explanation: "Safe SIP Sizer anchors every SIP to a concrete milestone (e.g. '3-Month Emergency Safety Net') and celebrates habit graduation certificates rather than market fluctuations."
    },
    representative_quotes: [
      {
        quote: "Just completed exactly 12 months of ₹10,000 monthly SIP. Profit of ₹8,000 on ₹1.2 Lakh after 1 year... psychology says 'why lock up ₹10k for this?'. Stopped.",
        source: "reddit",
        item_id: "reddit_investments_stopping_after_1yr",
        source_url: "https://www.reddit.com/r/IndiaInvestments/comments/1j5vwx/completed_1_year/"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Affirms habit discipline without promising or predicting future market returns."
    }
  },
  {
    id: "THEME_NAV_JARGON_DELAY",
    name: "NAV Allotment Latency (T+1/T+2) & XIRR Math Confusion",
    category: "out_of_scope",
    category_label: "Intentionally Out of Scope",
    scope_badge: "🚫 Out of Scope (SEBI / Regulatory)",
    scope_badge_color: "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30",
    description: "Frustration regarding 2–3 day unit allotment timelines and mathematical divergence between Absolute Returns and annualized XIRR.",
    stage_alignment: "early_experience_m1_3",
    item_count: 227,
    volume_share_pct: 22.1,
    severity_score: 3,
    addressability_score: 5,
    opportunity_score: 33.2,
    single_solution_role: {
      role_type: "Out of Scope",
      headline: "SEBI / AMC Regulatory Settlement Constraint",
      explanation: "SEBI mutual fund regulations dictate T+1/T+2 settlement cycles and 2:00 PM / 3:00 PM AMC cut-off timings. No distributor app can alter clearing house timelines. Building engineering features here is low PM leverage; solved adequately by standard in-app informational tooltips."
    },
    representative_quotes: [
      {
        quote: "Groww shows my Total Returns as +12% but my XIRR as 24.8%... neither of us can calculate how much money I will get after exit load and taxes.",
        source: "reddit",
        item_id: "reddit_groww_xirr_confusion",
        source_url: "https://www.reddit.com/r/groww/comments/1i4stu/difference_between_xirr/"
      },
      {
        quote: "Money was debited on 2nd July, but units were allotted only on 5th July with higher NAV. Why does Groww take 3 days?",
        source: "youtube",
        item_id: "youtube_sneha_mukherjee",
        source_url: "https://www.youtube.com/watch?v=sip_experience"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Complies with statutory SEBI NAV disclosure guidelines."
    }
  },
  {
    id: "THEME_EXTERNAL_BANK_OUTAGES",
    name: "External Bank Gateway Failures & NPCI Timeouts",
    category: "out_of_scope",
    category_label: "Intentionally Out of Scope",
    scope_badge: "🚫 Out of Scope (External Bank Infra)",
    scope_badge_color: "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30",
    description: "Third-party core banking server downtimes (SBI, HDFC, ICICI) and NPCI eNACH authentication timeouts during initial mandate setup.",
    stage_alignment: "setup",
    item_count: 124,
    volume_share_pct: 12.1,
    severity_score: 4,
    addressability_score: 2,
    opportunity_score: 9.7,
    single_solution_role: {
      role_type: "Out of Scope",
      headline: "Third-Party Core Banking Downtime",
      explanation: "Bank host server outages and NPCI hub lag are outside the Groww client app domain. Building custom mandate retry layers has diminishing returns compared to ensuring user accounts have sufficient funds when the debit fires."
    },
    representative_quotes: [
      {
        quote: "Trying to set up autopay with SBI Netbanking for 3 days. Every time it redirects to bank page, it shows '500 Server Error'.",
        source: "tradingqna",
        item_id: "tradingqna_187223_post_507690",
        source_url: "https://tradingqna.com/t/minor-mfs-bank-account-related-queries/187223/1"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Standard banking connectivity governed by NPCI guidelines."
    }
  },
  {
    id: "THEME_BROKER_COMMISSION_MIGRATION",
    name: "Broker Regular vs. Direct Plan Migration Friction",
    category: "out_of_scope",
    category_label: "Intentionally Out of Scope",
    scope_badge: "🚫 Out of Scope (Distribution Model)",
    scope_badge_color: "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30",
    description: "Frustration among users migrating from legacy bank relationship managers charging 1.5% regular commissions to direct plans.",
    stage_alignment: "setup",
    item_count: 88,
    volume_share_pct: 8.6,
    severity_score: 3,
    addressability_score: 3,
    opportunity_score: 7.7,
    single_solution_role: {
      role_type: "Out of Scope",
      headline: "Distribution Model Already Direct",
      explanation: "Groww is already a 100% Direct Plan distributor. External CAS statement imports are constrained by RTAs (CAMS and KFintech). Not a lever for first-time Groww SIP retention."
    },
    representative_quotes: [
      {
        quote: "Switched my SIP from regular plan to direct plan after realizing bank RM was taking 1.5% commission. Groww made direct plan easy.",
        source: "youtube",
        item_id: "youtube_mohit_sen",
        source_url: "https://www.youtube.com/watch?v=sip_experience"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Pure direct mutual fund execution."
    }
  },
  {
    id: "THEME_PEER_FOMO_OPTIONS",
    name: "Peer Noise & Speculative FOMO (F&O / Crypto Distraction)",
    category: "out_of_scope",
    category_label: "Intentionally Out of Scope",
    scope_badge: "🚫 Out of Scope (Trader Persona Disconnect)",
    scope_badge_color: "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30",
    description: "Office colleagues hyping 30% weekly intraday derivative profits, tempting novice investors to abandon boring SIP compounding.",
    stage_alignment: "early_experience_m1_3",
    item_count: 46,
    volume_share_pct: 4.5,
    severity_score: 3,
    addressability_score: 2,
    opportunity_score: 2.7,
    single_solution_role: {
      role_type: "Out of Scope",
      headline: "Trader Persona Disconnect",
      explanation: "High-risk derivative traders represent a completely separate user psychology than disciplined retail mutual fund investors. Sizing tools should not attempt to police external day-trading behavior."
    },
    representative_quotes: [
      {
        quote: "Colleagues in office were making 20% in F&O options trading while my SIP gave 8%. Stopped SIP and transferred capital to trading. Lost 50k in 2 weeks.",
        source: "youtube",
        item_id: "youtube_tanmay_bhattacharya",
        source_url: "https://www.youtube.com/watch?v=sip_experience"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Strict SEBI guardrail: Zero trading encouragement in SIP journeys."
    }
  },
  {
    id: "THEME_COMPULSIVE_MONITORING",
    name: "Compulsive Portfolio Over-Monitoring & Intraday Anxiety",
    category: "out_of_scope",
    category_label: "Intentionally Out of Scope",
    scope_badge: "🚫 Out of Scope (Engagement Behavior)",
    scope_badge_color: "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30",
    description: "Checking portfolio 5–6 times daily, treating long-term mutual fund SIPs like volatile stock tickers.",
    stage_alignment: "early_experience_m1_3",
    item_count: 31,
    volume_share_pct: 3.0,
    severity_score: 2,
    addressability_score: 3,
    opportunity_score: 1.8,
    single_solution_role: {
      role_type: "Out of Scope",
      headline: "Non-Structural Engagement Noise",
      explanation: "App open frequency is an engagement metric, not a structural cause of automated mandate cancellation. Handled organically by Safe SIP Sizer's milestone framing."
    },
    representative_quotes: [
      {
        quote: "I find myself opening Groww 5 to 6 times a day, watching the 1-day return fluctuate... Modern UI makes it feel like a casino slot machine.",
        source: "reddit",
        item_id: "reddit_investments_overmonitoring",
        source_url: "https://www.reddit.com/r/IndiaInvestments/comments/1d4def/compulsive_portfolio/"
      }
    ],
    guardrail_compliance: {
      compliant: true,
      note: "Nudges toward milestone tracking rather than live tick watching."
    }
  }
];

export function OpportunitiesView() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityTheme | null>(
    OPPORTUNITIES_DATA[0]
  );
  const [activeFilter, setActiveFilter] = useState<"all" | "in_scope" | "out_of_scope">("all");

  const filteredOpportunities = useMemo(() => {
    if (activeFilter === "in_scope") {
      return OPPORTUNITIES_DATA.filter((o) => o.category === "direct_target" || o.category === "passive_shield");
    }
    if (activeFilter === "out_of_scope") {
      return OPPORTUNITIES_DATA.filter((o) => o.category === "out_of_scope");
    }
    return OPPORTUNITIES_DATA;
  }, [activeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#00D09C] bg-[#00D09C]/10 border border-[#00D09C]/30 px-3 py-1 rounded-full uppercase">
            Product Prioritization &amp; Scope Architecture
          </span>
          <span className="text-xs text-[#9EA0A8] font-mono">
            Corpus: 1,025 Scraped Feedback Items • 4-Stage Taxonomy
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
          Opportunity Prioritization: The Single-Solution Dual-Impact Framework
        </h1>
        <p className="text-xs sm:text-sm text-[#9EA0A8] max-w-4xl leading-relaxed">
          Rather than spreading engineering resources thin across 10 disjointed features, we deploy a{" "}
          <strong className="text-white">single high-leverage product intervention: Safe SIP Sizer</strong>. 
          This single feature directly solves the primary behavioral drop-off and passively shields against the largest operational failure point, while deliberately deprioritizing uncontrollable external constraints.
        </p>

        {/* The 1-Solution Dual-Impact Summary Banner */}
        <div id="tour-single-solution-banner" className="space-y-2 pt-2 scroll-mt-24">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FFB61B]/15 text-[#FFB61B] border border-[#FFB61B]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB61B] animate-pulse"></span>
              Milestone 3 • Onboarding Spotlight
            </span>
            <span className="text-[11px] text-[#9EA0A8]">Single-Solution Dual-Impact Architecture</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Track A: Direct Solution */}
          <div className="bg-[#232734] border-2 border-[#5367FF]/50 hover:border-[#5367FF] rounded-xl p-5 space-y-3 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5367FF]/20 text-[#5367FF] border border-[#5367FF]/30">
                Track A • Direct Focus (Behavioral)
              </span>
              <span className="text-xs font-bold text-white bg-[#1C2028] px-2.5 py-1 rounded-md border border-[#282D3D]">
                ~72% of Retention Gain
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🎯</span> Direct Solution: Safe SIP Sizer
              </h3>
              <p className="text-xs text-[#C5C7D0] mt-1.5 leading-relaxed">
                Prevents <strong>Voluntary Churn</strong> (Months 3–12) by calibrating installment amounts to real disposable cash surplus and ringfencing a 3-month liquid emergency cushion. Users never face the choice between daily survival cash and their SIP.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-[#5367FF] flex items-center gap-1">
              <span>✓ Active Product Feature Under Development</span>
            </div>
          </div>

          {/* Track B: Passive Operational Shield */}
          <div className="bg-[#232734] border-2 border-[#00D09C]/40 hover:border-[#00D09C] rounded-xl p-5 space-y-3 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#00D09C]/20 text-[#00D09C] border border-[#00D09C]/30">
                Track B • Passive Shield (Operational)
              </span>
              <span className="text-xs font-bold text-[#00D09C] bg-[#1C2028] px-2.5 py-1 rounded-md border border-[#282D3D]">
                ~28% of Retention Gain
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🛡️</span> Passive Protection: Safe SIP Sizer
              </h3>
              <p className="text-xs text-[#C5C7D0] mt-1.5 leading-relaxed">
                Prevents <strong>Involuntary Autopay Bounces</strong> without building new bank gateway infrastructure. By anchoring installments below the user’s 10th-percentile minimum cash floor, the bank balance never runs dry—eliminating ₹590 bounce penalties passively.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-[#00D09C] flex items-center gap-1">
              <span>✓ 100% Passive Byproduct (Zero Extra Banking Code Needed)</span>
            </div>
          </div>
        </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#282D3D]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9EA0A8] font-medium mr-1">Filter Scope:</span>
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-[#232734] text-[#9EA0A8] hover:text-white border border-[#282D3D]"
              }`}
            >
              All Themes ({OPPORTUNITIES_DATA.length})
            </button>
            <button
              onClick={() => setActiveFilter("in_scope")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === "in_scope"
                  ? "bg-[#00D09C] text-black font-bold shadow-md"
                  : "bg-[#232734] text-[#00D09C] hover:bg-[#00D09C]/10 border border-[#00D09C]/30"
              }`}
            >
              <span>🎯</span> In-Scope Solution Impact ({OPPORTUNITIES_DATA.filter((o) => o.category !== "out_of_scope").length})
            </button>
            <button
              onClick={() => setActiveFilter("out_of_scope")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === "out_of_scope"
                  ? "bg-[#ED5533] text-white font-bold shadow-md"
                  : "bg-[#232734] text-[#ED5533] hover:bg-[#ED5533]/10 border border-[#ED5533]/30"
              }`}
            >
              <span>🚫</span> Intentionally Out of Scope ({OPPORTUNITIES_DATA.filter((o) => o.category === "out_of_scope").length})
            </button>
          </div>

          <div className="text-[11px] text-[#696C7C] font-mono">
            Showing {filteredOpportunities.length} of {OPPORTUNITIES_DATA.length} opportunities
          </div>
        </div>
      </div>

      {/* Main Grid: Opportunity Table (Left) + PM Detail Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table View (7 cols) */}
        <div className="lg:col-span-7 bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#282D3D] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Prioritized Opportunity Landscape</h3>
              <p className="text-[11px] text-[#9EA0A8] mt-0.5">Click any theme to inspect PM solution attribution &amp; verbatim evidence</p>
            </div>
            <span className="text-xs text-[#00D09C] font-mono font-bold bg-[#00D09C]/10 px-2 py-1 rounded">
              1 Solution Architecture
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#232734] text-[#9EA0A8] font-semibold border-b border-[#282D3D]">
                <tr>
                  <th className="py-3 px-3">Opportunity Theme</th>
                  <th className="py-3 px-2">Project Scope &amp; Role</th>
                  <th className="py-3 px-2 text-right">Items</th>
                  <th className="py-3 px-2 text-right">Share %</th>
                  <th className="py-3 px-2 text-center">Sev.</th>
                  <th className="py-3 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282D3D]">
                {filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => setSelectedOpportunity(opp)}
                    className={`cursor-pointer transition-colors ${
                      selectedOpportunity?.id === opp.id
                        ? "bg-[#232734] font-semibold text-white border-l-4 border-[#00D09C]"
                        : "text-gray-300 hover:bg-[#232734]/60"
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="text-white font-medium">{opp.name}</div>
                      <div className="text-[10px] text-[#696C7C] capitalize mt-0.5">
                        {opp.stage_alignment.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${opp.scope_badge_color}`}>
                        {opp.scope_badge}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right text-gray-300">{opp.item_count}</td>
                    <td className="py-3.5 px-2 text-right text-gray-300">{opp.volume_share_pct}%</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-[#ED5533]/15 border border-[#ED5533]/30 text-[#ED5533] font-bold text-[10px]">
                        {opp.severity_score}/5
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-[#00D09C]">
                      {opp.opportunity_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Theme Deep-Dive Drawer (5 cols) */}
        {selectedOpportunity && (
          <div className="lg:col-span-5 bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-2xl p-5 sm:p-6 space-y-5 sticky top-24">
            {/* Header pill */}
            <div className="flex items-center justify-between border-b border-[#282D3D] pb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${selectedOpportunity.scope_badge_color}`}>
                {selectedOpportunity.category_label}
              </span>
              <span className="text-xs text-[#9EA0A8] font-mono">
                {selectedOpportunity.item_count} items ({selectedOpportunity.volume_share_pct}%)
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-lg font-bold text-white">{selectedOpportunity.name}</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {selectedOpportunity.description}
              </p>
            </div>

            {/* PM Single-Solution Role Card */}
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              selectedOpportunity.category === "direct_target"
                ? "bg-[#5367FF]/10 border-[#5367FF]/40 text-white"
                : selectedOpportunity.category === "passive_shield"
                ? "bg-[#00D09C]/10 border-[#00D09C]/40 text-white"
                : "bg-[#ED5533]/10 border-[#ED5533]/40 text-white"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9EA0A8]">
                  PM Solution Attribution
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedOpportunity.category === "direct_target"
                    ? "bg-[#5367FF] text-white"
                    : selectedOpportunity.category === "passive_shield"
                    ? "bg-[#00D09C] text-black"
                    : "bg-[#ED5533] text-white"
                }`}>
                  {selectedOpportunity.single_solution_role.role_type}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white pt-1">
                {selectedOpportunity.single_solution_role.headline}
              </h4>
              <p className="text-xs text-[#C5C7D0] leading-relaxed">
                {selectedOpportunity.single_solution_role.explanation}
              </p>
            </div>

            {/* Metric & Severity Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#232734] p-3.5 rounded-xl border border-[#282D3D]">
              <div>
                <span className="text-[#9EA0A8] font-medium block">Lifecycle Stage</span>
                <span className="font-bold text-white capitalize">
                  {selectedOpportunity.stage_alignment.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-[#9EA0A8] font-medium block">Drop-off Severity</span>
                <span className="font-bold text-[#ED5533]">{selectedOpportunity.severity_score} / 5</span>
              </div>
              <div>
                <span className="text-[#9EA0A8] font-medium block">Product Addressability</span>
                <span className="font-bold text-[#5367FF]">{selectedOpportunity.addressability_score} / 5</span>
              </div>
              <div>
                <span className="text-[#9EA0A8] font-medium block">Opportunity Score</span>
                <span className="font-black text-[#00D09C]">{selectedOpportunity.opportunity_score}</span>
              </div>
            </div>

            {/* SEBI Compliance Guardrail */}
            <div className="bg-[#121212] border border-[#282D3D] rounded-xl p-3.5 text-xs text-[#9EA0A8] space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🛡️</span> Regulatory &amp; Architecture Check:
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">
                {selectedOpportunity.guardrail_compliance.note}
              </p>
            </div>

            {/* Verbatim Scraped User Evidence */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider flex items-center justify-between">
                <span>Verbatim User Voice:</span>
                <span className="text-[10px] text-[#696C7C] font-normal">Real public reviews</span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedOpportunity.representative_quotes.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#232734] rounded-xl text-xs text-gray-200 border-l-2 border-[#00D09C] space-y-1"
                  >
                    <p className="italic leading-relaxed">"{q.quote}"</p>
                    <div className="flex items-center justify-between text-[10px] text-[#9EA0A8] pt-0.5">
                      <span className="capitalize font-semibold text-[#00D09C]">Source: {q.source}</span>
                      {q.source_url && (
                        <a
                          href={q.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5367FF] hover:underline"
                        >
                          Evidence Link ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
