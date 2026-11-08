"use client";

import React from "react";
import { NavTab } from "../Navbar";

interface OverviewViewProps {
  onNavigateTab: (tab: NavTab) => void;
}

export function OverviewView({ onNavigateTab }: OverviewViewProps) {
  const behavioralOpportunities = [
    {
      rank: 1,
      title: "Cash-Flow Overcommitment & Emergency Buffer Deficit",
      share: "11.5%",
      items: 118,
      score: "70.8",
      stage: "Stage 4 (Months 3–12)",
      churn: "Voluntary",
      solution: "Safe SIP Sizer (6-Month statement analysis + 3-month buffer)",
      quote: "Selected a 15% annual step-up SIP when optimistic during appraisal. Fast forward to today: salary frozen, rent up 20%... had to cancel the entire SIP."
    },
    {
      rank: 2,
      title: "Rigid Pause Barriers during Medical & Life Crises",
      share: "6.3%",
      items: 65,
      score: "18.8",
      stage: "Stage 4 (Months 3–12)",
      churn: "Voluntary",
      solution: "One-Click SIP Snooze (Flexible 1–6 month emergency pause)",
      quote: "SIP pause button in Groww only allows 3 months maximum. I had an unexpected medical expense and needed 6 months break. Had to stop permanently."
    },
    {
      rank: 3,
      title: "Early Red Returns & Volatility Panic (M1–M3)",
      share: "18.0%",
      items: 184,
      score: "21.1",
      stage: "Stage 3 (Months 1–3)",
      churn: "Voluntary",
      solution: "Rupee-Cost Averaging visualizer & Milestone Mode",
      quote: "Portfolio is down by -2.5% after 4 months while FD gives guaranteed return. Nobody told us SIP can be negative in first year!"
    }
  ];

  const operationalOpportunities = [
    {
      rank: 1,
      title: "Autopay & Mandate Execution Failures",
      share: "6.6%",
      items: 68,
      score: "69.3",
      stage: "Stage 2 (Payment Reliability)",
      churn: "Involuntary",
      solution: "Safe Balance Floor (Passively insulated by Sizer) + Mandate Shield",
      quote: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge... Cancelled all 4 active SIPs immediately."
    },
    {
      rank: 2,
      title: "Insufficient Balance Bounce Prevention",
      share: "4.1%",
      items: 42,
      score: "33.2",
      stage: "Stage 2 (Payment Reliability)",
      churn: "Involuntary",
      solution: "Pre-Debit Balance Verification (24-Hour WhatsApp Alert + Top-up)",
      quote: "UPI autopay notification arrives at 6 AM. Once my account had 4500 and SIP was 5000, bank charged 450 penalty."
    },
    {
      rank: 3,
      title: "Salary Cycle & Debit Date Mismatch",
      share: "2.0%",
      items: 20,
      score: "2.3",
      stage: "Stage 2 (Payment Reliability)",
      churn: "Involuntary",
      solution: "Smart 5-Day Salary Debit Window (Dynamic debiting post salary credit)",
      quote: "Salary gets credited on 7th, SIP was 5th. Autopay failed twice and HDFC bank charged me Rs 590 bounce fee each time! Cancelled the SIP in frustration."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Groww Hero Discovery Card */}
      <div className="bg-[#1C2028] border border-[#282D3D] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        {/* Brand Tag Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#232734] border border-[#282D3D] p-1 flex items-center justify-center shrink-0">
            <img
              src="/groww-logo.png"
              alt="Groww"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5367FF]/30 bg-[#5367FF]/10 text-[#5367FF] text-xs px-3.5 py-1 font-semibold tracking-wide">
            <span>NEXTLEAP FELLOWSHIP • EXECUTIVE PRODUCT DISCOVERY</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Why do first-time investors stop their SIPs within 12 months?
        </h1>

        {/* Subtitle Description */}
        <p className="text-[#9EA0A8] text-sm sm:text-base leading-relaxed max-w-4xl">
          Analyzing 1,025 verified user feedback items across 12 Indian platforms (Play Store, App Store, Reddit, YouTube &amp; TradingQnA) to decompose 12-month active SIP retention, root causes, and high-impact product opportunities.
        </p>

        {/* Action CTAs in Groww Design Language */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateTab("ask")}
            className="bg-[#00D09C] hover:bg-[#00B386] text-black font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>💬</span> Ask Discovery Engine
          </button>
          <button
            onClick={() => onNavigateTab("tree")}
            className="bg-[#232734] hover:bg-[#2A2F3E] border border-[#282D3D] hover:border-[#3E455B] text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🌳</span> Metric Decomposition Tree
          </button>
          <button
            onClick={() => onNavigateTab("opportunities")}
            className="bg-[#232734] hover:bg-[#2A2F3E] border border-[#282D3D] hover:border-[#3E455B] text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🏆</span> Ranked Opportunities
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards - Groww Financial Dashboard Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL INGESTED DATA */}
        <div className="bg-[#1C2028] border border-[#282D3D] hover:border-[#3E455B] rounded-2xl p-5 space-y-2 transition-all">
          <span className="text-[11px] font-bold text-[#9EA0A8] uppercase tracking-wider block">
            TOTAL INGESTED DATA
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight">1,088</div>
          <div className="text-xs text-[#00D09C] font-semibold flex items-center gap-1.5 pt-1">
            <span>▲</span> Multi-Source Verified
          </div>
        </div>

        {/* Card 2: SIP-RELEVANT ITEMS */}
        <div className="bg-[#1C2028] border border-[#282D3D] hover:border-[#3E455B] rounded-2xl p-5 space-y-2 transition-all">
          <span className="text-[11px] font-bold text-[#9EA0A8] uppercase tracking-wider block">
            SIP-RELEVANT ITEMS
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight">1,025</div>
          <div className="text-xs text-[#5367FF] font-semibold flex items-center gap-1.5 pt-1">
            <span>🎯</span> Isolated Pain Points
          </div>
        </div>

        {/* Card 3: PRIMARY DROP-OFF HORIZON (BEHAVIORAL) */}
        <div className="bg-[#1C2028] border border-[#ED5533]/40 hover:border-[#ED5533] rounded-2xl p-5 space-y-2 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ED5533]/10 rounded-full blur-xl pointer-events-none"></div>
          <span className="text-[11px] font-bold text-[#ED5533] uppercase tracking-wider block">
            STAGE 4 LIFECYCLE DECISIONS
          </span>
          <div className="text-3xl font-extrabold text-[#ED5533] tracking-tight">21.0%</div>
          <div className="text-xs text-[#9EA0A8] font-semibold flex items-center gap-1.5 pt-1">
            <span>🕒</span> Months 3–12 (215 items)
          </div>
        </div>

        {/* Card 4: TOP OPERATIONAL BREAKPOINT */}
        <div className="bg-[#1C2028] border border-[#ED5533]/30 hover:border-[#ED5533] rounded-2xl p-5 space-y-2 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ED5533]/10 rounded-full blur-xl pointer-events-none"></div>
          <span className="text-[11px] font-bold text-[#ED5533] uppercase tracking-wider block">
            STAGE 2 MANDATE BREAKPOINT
          </span>
          <div className="text-3xl font-extrabold text-[#ED5533] tracking-tight">12.7%</div>
          <div className="text-xs text-[#FFB61B] font-semibold flex items-center gap-1.5 pt-1">
            <span>⚡</span> Payment Reliability (130 items)
          </div>
        </div>
      </div>

      {/* Option C: Dual-Lens Churn Discovery Framework (Behavioral on Left, Operational on Right) */}
      <div id="tour-dual-lens" className="bg-[#1C2028] border border-[#282D3D] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#282D3D] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
                Core Discovery Synthesis
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#5367FF]/15 text-[#5367FF] border border-[#5367FF]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5367FF] animate-pulse"></span>
                Milestone 1 • Onboarding Spotlight
              </span>
              <span className="text-xs text-[#9EA0A8]">Root Disease vs. Observable Symptom</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              The Dual-Lens Churn Reality: Behavioral Root Cause &amp; Operational Shield
            </h2>
            <p className="text-xs sm:text-sm text-[#9EA0A8] mt-1 max-w-4xl">
              Decomposing why first-time investors churn reveals two interconnected dimensions: an upstream behavioral vulnerability (uncalibrated commitments) that triggers downstream operational payment disasters.
            </p>
          </div>
        </div>

        {/* 2-Column Dual-Lens Grid: Behavioral Lens on Left, Operational Lens on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: The Behavioral Lens (Primary Focus) */}
          <div className="bg-[#232734] border-2 border-[#5367FF]/50 hover:border-[#5367FF] rounded-2xl p-5 sm:p-6 space-y-4 relative transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#5367FF]/15 text-[#5367FF] border border-[#5367FF]/30 uppercase tracking-wide">
                Primary Focus • The Root Cause
              </span>
              <span className="text-xs font-extrabold text-white bg-[#1C2028] px-2.5 py-1 rounded-lg border border-[#282D3D]">
                ~72% of Retention Gain
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🎯</span> The Behavioral Lens (Months 3–12 Drop-offs)
              </h3>
              <p className="text-xs text-[#9EA0A8] mt-1">
                <strong className="text-white">21.0% of all corpus items (215 discussions)</strong> occur during the mid-term journey due to unhedged life shocks.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#C5C7D0]">
              <div className="flex items-start gap-2.5 bg-[#1C2028] p-3 rounded-xl border border-[#282D3D]">
                <span className="text-[#ED5533] text-sm shrink-0">✕</span>
                <div>
                  <strong className="text-white block mb-0.5">Aspirational Overcommitment on Day 1:</strong>
                  Users pick arbitrary numbers (₹5,000–₹10,000) based on influencer hype without measuring actual disposable surplus.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#1C2028] p-3 rounded-xl border border-[#282D3D]">
                <span className="text-[#ED5533] text-sm shrink-0">✕</span>
                <div>
                  <strong className="text-white block mb-0.5">Zero Liquid Emergency Buffer:</strong>
                  When medical bills, knee surgery, or festival expenses strike, users have zero cushion. The SIP competes directly with survival cash, forcing permanent cancellation.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#00D09C]/10 p-3 rounded-xl border border-[#00D09C]/30 text-white">
                <span className="text-[#00D09C] text-sm shrink-0">✓</span>
                <div>
                  <strong className="text-[#00D09C] block mb-0.5">Core Product Fix (Safe SIP Sizer):</strong>
                  Analyzes 6-month bank statements, ringfences a 3-month liquid emergency corpus, plugs lifestyle leaks, and anchors installments to real cash surplus.
                </div>
              </div>
            </div>

            <div className="bg-[#1C2028] p-3 rounded-xl border border-[#282D3D] text-xs text-[#9EA0A8] italic">
              "SIP pause in Groww only allows 3 months... had an unexpected medical expense and needed 6 months break. Had to stop permanently."
              <span className="block text-[10px] text-[#696C7C] font-semibold mt-1">— YouTube Review (r/mutualfunds)</span>
            </div>
          </div>

          {/* RIGHT: The Operational Lens (Secondary Structural Shield) */}
          <div className="bg-[#232734] border border-[#282D3D] hover:border-[#ED5533]/50 rounded-2xl p-5 sm:p-6 space-y-4 relative transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ED5533]/15 text-[#ED5533] border border-[#ED5533]/30 uppercase tracking-wide">
                Secondary Shield • The Breaking Point
              </span>
              <span className="text-xs font-extrabold text-[#9EA0A8] bg-[#1C2028] px-2.5 py-1 rounded-lg border border-[#282D3D]">
                ~28% of Retention Gain
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🛡️</span> The Operational Lens (Mandate &amp; Autopay Bounces)
              </h3>
              <p className="text-xs text-[#9EA0A8] mt-1">
                <strong className="text-white">34.6% of user complaints (355 discussions)</strong> cite technical payment bounces and bank penalty rage-quits.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#C5C7D0]">
              <div className="flex items-start gap-2.5 bg-[#1C2028] p-3 rounded-xl border border-[#282D3D]">
                <span className="text-[#ED5533] text-sm shrink-0">✕</span>
                <div>
                  <strong className="text-white block mb-0.5">The Technical Breaking Point:</strong>
                  When tight balances meet recurring debits on the 5th, the mandate fails. Banks slap a harsh ₹450 to ₹590 ECS bounce charge.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#1C2028] p-3 rounded-xl border border-[#282D3D]">
                <span className="text-[#ED5533] text-sm shrink-0">✕</span>
                <div>
                  <strong className="text-white block mb-0.5">Penalty-Induced Outrage Churn:</strong>
                  Users blame Groww for the bank fee, lose trust, and immediately cancel all active SIPs in frustration.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#00D09C]/10 p-3 rounded-xl border border-[#00D09C]/30 text-white">
                <span className="text-[#00D09C] text-sm shrink-0">✓</span>
                <div>
                  <strong className="text-[#00D09C] block mb-0.5">Passive Operational Protection:</strong>
                  By sizing SIPs safely below the historical 10th-percentile minimum cash balance, the bank balance floor never dips to zero—passively stopping bounce penalties.
                </div>
              </div>
            </div>

            <div className="bg-[#1C2028] p-3 rounded-xl border border-[#282D3D] text-xs text-[#9EA0A8] italic">
              "Groww UPI autopay failed... ICICI bank slapped a ₹590 ECS bounce charge... Cancelled all 4 active SIPs immediately."
              <span className="block text-[10px] text-[#696C7C] font-semibold mt-1">— Reddit Discussion (r/groww)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Groww Cleaning Funnel Card */}
      <div className="bg-[#1C2028] border border-[#282D3D] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#282D3D] pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🧹</span> 3-Stage Data Ingestion &amp; Filtration Funnel
            </h2>
            <p className="text-xs text-[#9EA0A8] mt-0.5">
              Strict algorithmic noise filtering retaining only high-signal investor feedback
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
            94.2% Funnel Retention Rate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#232734] border border-[#282D3D] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9EA0A8] font-semibold uppercase tracking-wider text-[10px]">Stage 1 • Raw Crawl</span>
              <span className="font-bold text-white">1,088 items</span>
            </div>
            <p className="text-[#9EA0A8] text-xs">
              Raw multi-platform ingestion across 12 Indian Demat/MF apps, Reddit, YouTube, and TradingQnA.
            </p>
          </div>

          <div className="bg-[#232734] border border-[#282D3D] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#9EA0A8] font-semibold uppercase tracking-wider text-[10px]">Stage 2 • Deduplication</span>
              <span className="font-bold text-[#ED5533]">-24 duplicates</span>
            </div>
            <p className="text-[#9EA0A8] text-xs">
              Normalized text hash matching removed repeated cross-postings and bot duplicates.
            </p>
          </div>

          <div className="bg-[#232734] border border-[#00D09C]/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#00D09C] font-semibold uppercase tracking-wider text-[10px]">Stage 3 • Domain Relevance</span>
              <span className="font-bold text-[#00D09C]">1,025 clean items</span>
            </div>
            <p className="text-[#9EA0A8] text-xs">
              Excluded one-word spam, non-SIP feedback, and off-topic app reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Dual-Track Prioritized Churn Opportunity Areas (Approach 1) */}
      <div className="bg-[#1C2028] border border-[#282D3D] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#282D3D] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
                Prioritized Action Matrix
              </span>
              <span className="text-xs text-[#9EA0A8]">Approach 1: Dual-Track Ranking</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>🏆</span> Top Prioritized Churn Opportunity Areas
            </h2>
            <p className="text-xs text-[#9EA0A8] mt-1">
              Separating actionable problem spaces into upstream behavioral vulnerabilities (Left) vs downstream operational failure points (Right).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("opportunities")}
            className="text-xs font-semibold text-[#00D09C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All 10 Themes in Matrix</span>
            <span>→</span>
          </button>
        </div>

        {/* 2-Column Grid: Left Track (Behavioral) vs Right Track (Operational) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Track A: Behavioral Track (Left) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#282D3D] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5367FF]"></span>
                <h3 className="text-sm font-bold text-white">The Behavioral Track (Primary Focus 🎯)</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#5367FF] bg-[#5367FF]/10 px-2 py-0.5 rounded border border-[#5367FF]/30">
                ~72% of Retention Uplift
              </span>
            </div>

            <div className="space-y-3">
              {behavioralOpportunities.map((opp) => (
                <div
                  key={opp.rank}
                  className="bg-[#232734] border border-[#282D3D] hover:border-[#5367FF]/50 rounded-xl p-4 transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#5367FF]/20 text-[#5367FF] text-xs font-bold flex items-center justify-center">
                        {opp.rank}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{opp.title}</h4>
                    </div>
                    <span className="font-extrabold text-[#00D09C] text-xs">
                      Score: {opp.score}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#1C2028] border border-[#282D3D] text-[#9EA0A8]">
                      {opp.stage}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#ED5533]/15 text-[#ED5533] border border-[#ED5533]/30 font-semibold">
                      {opp.churn} Churn
                    </span>
                    <span className="text-[#9EA0A8] text-[10px]">
                      Vol: <strong>{opp.items} items</strong> ({opp.share})
                    </span>
                  </div>

                  <div className="bg-[#1C2028] p-2.5 rounded-lg border border-[#00D09C]/25 text-[11px] text-[#00D09C] flex items-center gap-1.5 font-medium">
                    <span>💡</span>
                    <span><strong>Solution:</strong> {opp.solution}</span>
                  </div>

                  <div className="bg-[#1C2028] p-3 rounded-lg border border-[#282D3D] text-xs text-[#9EA0A8] italic">
                    "{opp.quote}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track B: Operational Track (Right) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#282D3D] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ED5533]"></span>
                <h3 className="text-sm font-bold text-white">The Operational Track (Structural Shield 🛡️)</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#ED5533] bg-[#ED5533]/10 px-2 py-0.5 rounded border border-[#ED5533]/30">
                ~28% of Retention Uplift
              </span>
            </div>

            <div className="space-y-3">
              {operationalOpportunities.map((opp) => (
                <div
                  key={opp.rank}
                  className="bg-[#232734] border border-[#282D3D] hover:border-[#ED5533]/50 rounded-xl p-4 transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#ED5533]/20 text-[#ED5533] text-xs font-bold flex items-center justify-center">
                        {opp.rank}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{opp.title}</h4>
                    </div>
                    <span className="font-extrabold text-[#00D09C] text-xs">
                      Score: {opp.score}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#1C2028] border border-[#282D3D] text-[#9EA0A8]">
                      {opp.stage}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                        opp.churn === "Involuntary"
                          ? "bg-[#ED5533]/15 text-[#ED5533] border-[#ED5533]/30"
                          : "bg-[#FFB61B]/15 text-[#FFB61B] border-[#FFB61B]/30"
                      }`}
                    >
                      {opp.churn} Churn
                    </span>
                    <span className="text-[#9EA0A8] text-[10px]">
                      Vol: <strong>{opp.items} items</strong> ({opp.share})
                    </span>
                  </div>

                  <div className="bg-[#1C2028] p-2.5 rounded-lg border border-[#00D09C]/25 text-[11px] text-[#00D09C] flex items-center gap-1.5 font-medium">
                    <span>💡</span>
                    <span><strong>Solution:</strong> {opp.solution}</span>
                  </div>

                  <div className="bg-[#1C2028] p-3 rounded-lg border border-[#282D3D] text-xs text-[#9EA0A8] italic">
                    "{opp.quote}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Platform Coverage Grid in Groww Design Language */}
      <div className="bg-[#1C2028] border border-[#282D3D] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#282D3D] pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Cross-Platform Indian Ecosystem Coverage</h2>
            <p className="text-xs text-[#9EA0A8] mt-0.5">Benchmarked across 12 Demat/Mutual Fund apps and 5 channels</p>
          </div>
          <button
            onClick={() => onNavigateTab("sources")}
            className="text-xs font-medium text-[#00D09C] hover:underline cursor-pointer"
          >
            Explore Sources →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {[
            { name: "Groww", count: "40+ items", type: "Core App" },
            { name: "Zerodha Coin", count: "40+ items", type: "Demat direct" },
            { name: "INDmoney", count: "40+ items", type: "Super money app" },
            { name: "Angel One", count: "40+ items", type: "Full-service demat" },
            { name: "Upstox", count: "40+ items", type: "Discount broker" },
            { name: "TradingQnA", count: "293 threads", type: "Discourse forum" },
            { name: "Reddit India", count: "12 threads", type: "r/mutualfunds" },
            { name: "YouTube", count: "25 videos", type: "Finance creators" },
            { name: "ET Money", count: "40+ items", type: "MF direct app" },
            { name: "Paytm Money", count: "40+ items", type: "Discount MF" },
            { name: "Kuvera", count: "40+ items", type: "Zero commission" },
            { name: "App Store", count: "10 items", type: "iOS reviews" },
          ].map((app, idx) => (
            <div key={idx} className="bg-[#232734] border border-[#282D3D] hover:border-[#3E455B] p-3 rounded-xl space-y-1 transition-all">
              <span className="font-bold text-white block truncate">{app.name}</span>
              <span className="text-[11px] text-[#00D09C] font-semibold block">{app.count}</span>
              <span className="text-[10px] text-[#696C7C] block">{app.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
