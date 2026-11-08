"use client";

import React, { useState } from "react";

interface SubDriver {
  id: string;
  name: string;
  kpiFormula: string;
  baseline: string;
  target: string;
  itemCount: number;
  sharePct: string;
  coreFriction: string;
  leadSolution: string;
  quote: string;
  quoteSource: string;
}

interface StageNode {
  id: number;
  name: string;
  lens: string;
  symbol: string;
  stageKey: string;
  userQuestion: string;
  productOutcome: string;
  volumeCount: number;
  sharePct: string;
  baselineRate: string;
  targetRate: string;
  breakLooksLike: string;
  primaryChurn: string;
  quotes: Array<{ quote: string; source: string }>;
  interventions: string[];
  subDrivers: SubDriver[];
}

export function MetricTreeView() {
  const [selectedStageId, setSelectedStageId] = useState<number>(4); // Default to Stage 4 (Behavioral Primary)
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });
  const [selectedSubDriver, setSelectedSubDriver] = useState<SubDriver | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<"tree" | "cards">("tree");

  const STAGES_DATA: StageNode[] = [
    {
      id: 1,
      name: "Stage 1: Setup & Onboarding",
      lens: "Onboarding Flow",
      symbol: "S_setup",
      stageKey: "setup",
      userQuestion: "Can the first-time user successfully establish their first SIP without drop-off?",
      productOutcome: "% of KYC-verified signups who successfully create an active SIP mandate",
      volumeCount: 277,
      sharePct: "27.0%",
      baselineRate: "82.4%",
      targetRate: "88.0%",
      breakLooksLike: "Confusing KYC verification, bank penny-drop delays, minor account demat restrictions, and failure to understand immediate first installment debit.",
      primaryChurn: "Pre-conversion abandonment",
      quotes: [
        {
          quote: "The eNACH mandate setup failed 3 times during onboarding because net banking OTP didn't arrive. Almost gave up.",
          source: "YouTube Review"
        },
        {
          quote: "Money was debited on registration day, but my chosen SIP date was 15th! Thought I was double charged.",
          source: "Play Store User"
        }
      ],
      interventions: [
        "Instant UPI Autopay onboarding (bypassing legacy netbanking eNACH forms)",
        "Zero-balance instant mandate creation with clear first debit countdown",
        "Direct mutual fund transparency and automated CAS folio import"
      ],
      subDrivers: [
        {
          id: "1.1",
          name: "KYC & Verification Latency",
          kpiFormula: "% signups completing PAN/Aadhaar verification in < 15 mins",
          baseline: "78.0%",
          target: "86.5%",
          itemCount: 112,
          sharePct: "10.9%",
          coreFriction: "Aadhaar OTP timeouts, manual address check rejections, and penny-drop bank failures.",
          leadSolution: "Instant Digilocker OCR & Automated Penny-Drop Retry Engine",
          quote: "Account opening took 10 days because bank penny drop kept failing. Support took 48h to reply.",
          quoteSource: "Play Store (Groww)"
        },
        {
          id: "1.2",
          name: "First Installment Debit Clarity",
          kpiFormula: "% of created SIPs where initial payment settles without cancellation",
          baseline: "84.5%",
          target: "91.0%",
          itemCount: 95,
          sharePct: "9.3%",
          coreFriction: "Confusion over why first installment debits immediately before the chosen monthly date.",
          leadSolution: "Zero-Balance Mandate Setup with Visual Debit Schedule Countdown",
          quote: "Money was debited immediately on 2nd July even though my chosen SIP date was 15th.",
          quoteSource: "YouTube Discussion"
        },
        {
          id: "1.3",
          name: "Direct vs Regular Transparency",
          kpiFormula: "% of users choosing Direct Growth plans with 0% intermediary leakage",
          baseline: "88.0%",
          target: "94.5%",
          itemCount: 70,
          sharePct: "6.8%",
          coreFriction: "Users migrating from bank regular plans (1.5% RM commission) encountering CAS import friction.",
          leadSolution: "1-Click External Folio Importer & Direct Savings Calculator",
          quote: "Switched my SIP from regular plan to direct plan after realizing bank RM was taking 1.5% commission.",
          quoteSource: "Reddit (r/mutualfunds)"
        }
      ]
    },
    {
      id: 2,
      name: "Stage 2: Payment & Mandate Reliability",
      lens: "Operational Shield 🛡️",
      symbol: "R_mandate",
      stageKey: "payment_reliability",
      userQuestion: "Does every monthly installment execute reliably without bank penalty shock?",
      productOutcome: "% of scheduled monthly SIP debits successfully settled without bounce penalties",
      volumeCount: 130,
      sharePct: "12.7%",
      baselineRate: "86.5%",
      targetRate: "93.0%",
      breakLooksLike: "UPI mandate silent bounce, bank ₹590 ECS penalty, salary credited 2 days after debit date, lack of retry mechanism before bank penalizes user.",
      primaryChurn: "Involuntary Churn (Leading to Outraged Voluntary Cancellation)",
      quotes: [
        {
          quote: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge on my account! Cancelled all 4 active SIPs immediately.",
          source: "Reddit (r/groww)"
        },
        {
          quote: "Salary gets credited on 7th, SIP was 5th. Autopay failed twice and HDFC bank charged me Rs 590 bounce fee each time! Cancelled the SIP in frustration.",
          source: "YouTube Comment"
        }
      ],
      interventions: [
        "Smart Pre-Debit Balance Verification (24-hour SMS/WhatsApp alert with 1-click top-up)",
        "Flexible 5-day salary window auto-retry before reporting bank failure",
        "Groww Mandate Shield (Instant waiver or reimbursement credit for broker-induced ECS bounce fees)"
      ],
      subDrivers: [
        {
          id: "2.1",
          name: "Mandate Gateway Uptime & Execution",
          kpiFormula: "% of recurring debits executing without bank gateway timeout",
          baseline: "91.2%",
          target: "97.5%",
          itemCount: 68,
          sharePct: "6.6%",
          coreFriction: "NPCI / UPI Autopay gateway timeouts on peak morning debit windows.",
          leadSolution: "Multi-Gateway Fallback & Groww Mandate Shield (ECS Fee Refund)",
          quote: "Groww UPI autopay failed yesterday... ICICI bank slapped a ₹590 ECS bounce charge. Cancelled all 4 SIPs.",
          quoteSource: "Reddit (r/groww)"
        },
        {
          id: "2.2",
          name: "Insufficient Balance Bounce Prevention",
          kpiFormula: "% of debits preceded by 24h balance verification with 0 bounce charges",
          baseline: "85.0%",
          target: "94.0%",
          itemCount: 42,
          sharePct: "4.1%",
          coreFriction: "Balance ₹200 short of installment amount triggering bank ₹590 ECS return charge.",
          leadSolution: "Pre-Debit Balance Check (WhatsApp alert + 1-click ₹500 buffer top-up)",
          quote: "UPI autopay notification arrives at 6 AM. Once my account had 4500 and SIP was 5000, bank charged 450 penalty.",
          quoteSource: "Play Store Review"
        },
        {
          id: "2.3",
          name: "Salary Date Auto-Synchronization",
          kpiFormula: "% of users whose SIP date aligns with actual salary credit (+2 days)",
          baseline: "48.0%",
          target: "78.0%",
          itemCount: 20,
          sharePct: "2.0%",
          coreFriction: "Salary credited between 1st–10th colliding with fixed 5th-of-month debit dates.",
          leadSolution: "Smart 5-Day Salary Debit Window (Dynamic debiting post-salary arrival)",
          quote: "Salary gets credited on 7th, SIP was 5th. Autopay failed twice and HDFC bank charged me Rs 590 bounce fee each time!",
          quoteSource: "YouTube Discussion"
        }
      ]
    },
    {
      id: 3,
      name: "Stage 3: Early Experience & Volatility Shock (M1–M3)",
      lens: "Cognitive Alignment",
      symbol: "E_early",
      stageKey: "early_experience_m1_3",
      userQuestion: "Does the user withstand the first market dip and understand their portfolio progress?",
      productOutcome: "% of first-time cohorts whose active SIP remains active past Month 3 without panic-stopping",
      volumeCount: 403,
      sharePct: "39.3%",
      baselineRate: "66.0%",
      targetRate: "74.5%",
      breakLooksLike: "Portfolio goes down by -2% in month 2, user expects FD-like stability, opens app 5 times a day like stock trading, panics and redeems.",
      primaryChurn: "Voluntary Panic Churn",
      quotes: [
        {
          quote: "Started SIP 3 months back and already portfolio is -4.2% down. Is this normal or did I pick bad funds? Feels like losing money.",
          source: "Reddit (r/mutualfunds)"
        },
        {
          quote: "Total returns show +12% but XIRR shows 24.8%... neither of us can calculate how much money I will get after exit load and taxes.",
          source: "YouTube Discussion"
        }
      ],
      interventions: [
        "12-Month Volatility Horizon Education (Rupee Cost Averaging visualizer showing red months as buying opportunities)",
        "Net In-Hand Calculator (disclosing exit loads and LTCG/STCG taxes in 1 click)",
        "Milestone Reflection Mode (nudging users to evaluate annual discipline rather than daily NAV ticks)"
      ],
      subDrivers: [
        {
          id: "3.1",
          name: "Early Volatility Panic & Red Returns",
          kpiFormula: "% of Month 1–3 cohorts surviving market corrections without redeeming",
          baseline: "62.0%",
          target: "73.0%",
          itemCount: 184,
          sharePct: "18.0%",
          coreFriction: "Nominal portfolio loss in Month 2 compared against guaranteed Fixed Deposit returns.",
          leadSolution: "Rupee-Cost Averaging Visualizer (Demonstrating red months buy more units)",
          quote: "Started my first SIP of 2000 in Parag Parikh 4 months ago. Portfolio is down by -2.5% while FD gives guaranteed return.",
          quoteSource: "YouTube (Warikoo)"
        },
        {
          id: "3.2",
          name: "NAV Allotment & Settlement Transparency",
          kpiFormula: "Customer support tickets regarding delayed NAV allotment (<0.5%)",
          baseline: "3.8%",
          target: "0.8%",
          itemCount: 135,
          sharePct: "13.2%",
          coreFriction: "T+1 / T+2 cut-off time confusion; user thinks broker delayed purchase intentionally.",
          leadSolution: "Live Order Timeline & Real-Time Cut-off Timers on Dashboard",
          quote: "Money debited on Monday crash, but units allotted Wednesday with higher NAV. What's the point of SIP discipline?",
          quoteSource: "TradingQ&A Forum"
        },
        {
          id: "3.3",
          name: "Metric Comprehension (XIRR vs Abs vs Exit Load)",
          kpiFormula: "% of users correctly understanding net in-hand proceeds before withdrawing",
          baseline: "42.0%",
          target: "80.0%",
          itemCount: 84,
          sharePct: "8.2%",
          coreFriction: "XIRR divergence from total returns; surprise 1-year FIFO exit load clock per installment.",
          leadSolution: "Net In-Hand Withdrawal Calculator with FIFO Exit Load Date Countdown",
          quote: "Total returns show +12% but XIRR shows 24.8%... neither can calculate net money after exit load and taxes.",
          quoteSource: "Reddit (r/groww)"
        }
      ]
    },
    {
      id: 4,
      name: "Stage 4: Mid-Term Retention & Lifecycle Shocks (M3–M12)",
      lens: "Behavioral Primary 🎯",
      symbol: "V_retention",
      stageKey: "voluntary_decision_m3_12",
      userQuestion: "Can the user navigate life events (job transition, festival expenses, wedding) without canceling permanently?",
      productOutcome: "% of month 3 retained SIPs that successfully complete at least 1 debit between months 11 and 12",
      volumeCount: 215,
      sharePct: "21.0%",
      baselineRate: "74.0%",
      targetRate: "82.5%",
      breakLooksLike: "Aspirational Day-1 overcommitment with zero emergency buffer. When medical emergencies, festival spending, or salary freezes hit, users have no cash cushion, forcing permanent cancellation.",
      primaryChurn: "Cash-Crunch Induced Voluntary Cancellation",
      quotes: [
        {
          quote: "Selected a 15% annual step-up SIP when optimistic during appraisal. Fast forward to today: salary frozen, rent up 20%... had to cancel the entire SIP.",
          source: "Reddit (r/mutualfunds)"
        },
        {
          quote: "SIP pause in Groww only allows 3 months maximum. I had an unexpected medical expense and needed 6 months break. Had to stop permanently.",
          source: "YouTube Comment"
        },
        {
          quote: "Giving 1 star just because I tried a lot to skip my SIPs for a month... recently operated on my knee and cannot go to work... doesn't work.",
          source: "Play Store Review"
        }
      ],
      interventions: [
        "Safe SIP Sizer (6-Month statement cash-flow calibration & 3-month liquid emergency buffer ringfencing to eliminate overcommitment)",
        "One-Click SIP Snooze (Flexible 1–6 month emergency pause without terminating mandate)",
        "Smart Debit Date Auto-Alignment (Syncing installment debit to salary credit date +2 days)",
        "Annual Discipline Milestone Celebration (Badging & milestone certificate on 12th consecutive installment)"
      ],
      subDrivers: [
        {
          id: "4.1",
          name: "Cash-Flow Overcommitment & Buffer Deficit",
          kpiFormula: "% of new SIPs calibrated against 6-month disposable cash surplus",
          baseline: "22.0%",
          target: "70.0%",
          itemCount: 118,
          sharePct: "11.5%",
          coreFriction: "Aspirational Day-1 commitment (₹10,000) with zero emergency buffer; rent hike or medical bill forces total cancellation.",
          leadSolution: "Safe SIP Sizer (6-Month statement cash-flow calibration & 3-month buffer ringfencing)",
          quote: "Selected a 15% annual step-up SIP when optimistic during appraisal. Fast forward to today: salary frozen, rent up 20%... had to cancel the entire SIP.",
          quoteSource: "Reddit (r/mutualfunds)"
        },
        {
          id: "4.2",
          name: "Emergency Pause & Modification Barriers",
          kpiFormula: "% of users pausing instead of canceling during temporary cash crunches",
          baseline: "14.0%",
          target: "45.0%",
          itemCount: 65,
          sharePct: "6.3%",
          coreFriction: "30-day notice required to pause; pause capped at 3 months; inability to reduce installment to ₹500 for Diwali.",
          leadSolution: "One-Click SIP Snooze (Flexible 1–6 month emergency pause with zero mandate penalty)",
          quote: "SIP pause button in Groww only allows pausing for 3 months maximum. I had an unexpected medical expense and needed 6 months break.",
          quoteSource: "YouTube Review"
        },
        {
          id: "4.3",
          name: "12-Month Graduation & Discipline Affirmation",
          kpiFormula: "% of Month 3 retained users who complete all 12 consecutive monthly debits",
          baseline: "58.0%",
          target: "72.0%",
          itemCount: 32,
          sharePct: "3.1%",
          coreFriction: "Discretionary lifestyle leaks (spending on gadgets), peer noise hyping 30% weekly F&O options.",
          leadSolution: "Discipline Milestone Certificates, Goal Ringfencing & F&O Risk Education",
          quote: "Completed 12 months of active SIP without missing any month! The secret was keeping debit date 2 days after salary and milestone tracking.",
          quoteSource: "YouTube Discussion"
        }
      ]
    }
  ];

  const currentStage = STAGES_DATA.find((s) => s.id === selectedStageId) || STAGES_DATA[3];

  const toggleStageExpand = (stageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00D09C] bg-[#00D09C]/10 border border-[#00D09C]/30 px-3 py-1 rounded-full uppercase">
            <span>🌳</span> Part 2 • Unified Metric &amp; KPI Decomposition Tree
          </div>

          <div className="flex items-center gap-2 bg-[#121212] p-1 rounded-xl border border-[#282D3D]">
            <button
              onClick={() => setActiveViewMode("tree")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeViewMode === "tree"
                  ? "bg-[#00D09C] text-black font-bold shadow-sm"
                  : "text-[#9EA0A8] hover:text-white"
              }`}
            >
              🌳 Interactive Node Tree
            </button>
            <button
              onClick={() => setActiveViewMode("cards")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeViewMode === "cards"
                  ? "bg-[#00D09C] text-black font-bold shadow-sm"
                  : "text-[#9EA0A8] hover:text-white"
              }`}
            >
              📋 Stage Cards &amp; Detail
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
          12-Month Active SIP Retention KPI Tree
        </h1>
        <p className="text-sm text-[#9EA0A8] max-w-4xl leading-relaxed">
          Every single complaint (1,025 clean items) is mapped directly into this unified 4-stage hierarchy. 
          The North Star Metric expands into 4 sequential journey stages, which branch into 12 measurable driver KPIs, 
          connecting user complaints directly to root causes and product solutions.
        </p>

        {/* Mathematical Equation Card */}
        <div className="bg-[#121212] border border-[#282D3D] text-white rounded-xl p-4 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[#00D09C] font-bold block mb-0.5">// Mathematical Funnel Decomposition</span>
            <span className="text-gray-100 font-semibold">
              A₁₂M = S_setup (88%) × R_mandate (93%) × E_early (74.5%) × V_retention (82.5%) = ~45.4% Target
            </span>
          </div>
          <div className="text-[11px] text-[#9EA0A8] bg-[#1C2028] px-3 py-1.5 rounded-lg border border-[#282D3D]">
            Baseline: ~38.5% → Target: <strong>45.4% (+6.9% Net Uplift)</strong>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE NODE TREE GRAPH */}
      {activeViewMode === "tree" && (
        <div className="space-y-6">
          {/* North Star Root Node */}
          <div id="tour-root-node" className="max-w-2xl mx-auto scroll-mt-24">
            <div className="bg-[#1C2028] border-2 border-[#00D09C] rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D09C]/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30 uppercase tracking-wide">
                    ⭐ North Star Metric (Root Node)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] animate-pulse"></span>
                    Milestone 2 • Onboarding Spotlight
                  </span>
                </div>
                <span className="text-xs text-[#9EA0A8]">
                  Corpus: <strong>1,025 Verified Items (100%)</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    12-Month Active SIP Retention Rate
                  </h3>
                  <p className="text-xs text-[#9EA0A8] mt-0.5">
                    % of 1st-time investors maintaining ≥ 1 successful installment debit in Month 12
                  </p>
                </div>
                <div className="text-right sm:pl-4">
                  <div className="text-2xl font-black text-[#00D09C]">45.4%</div>
                  <div className="text-[10px] text-[#9EA0A8]">Baseline: ~38.5%</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#282D3D] flex items-center justify-between text-xs text-[#9EA0A8]">
                <span>Decomposes into 4 sequential journey stages ↓</span>
                <span className="text-[#00D09C] font-semibold">Click any stage or sub-driver node to inspect</span>
              </div>
            </div>

            {/* Tree Branch Line from Root down to Stages */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#00D09C] to-[#282D3D] mx-auto"></div>
          </div>

          {/* 4 Stage Nodes (Level 1) & Their Sub-Driver Nodes (Level 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            {STAGES_DATA.map((st) => {
              const isSelected = selectedStageId === st.id;
              const isExpanded = expandedStages[st.id] !== false;

              return (
                <div key={st.id} className="space-y-3">
                  {/* Stage Node (Level 1) */}
                  <div
                    onClick={() => setSelectedStageId(st.id)}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer relative space-y-3 ${
                      isSelected
                        ? "bg-[#232734] border-[#00D09C] shadow-xl ring-2 ring-[#00D09C]/30"
                        : "bg-[#1C2028] border-[#282D3D] hover:border-[#3E455B]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-[#696C7C] uppercase tracking-wider">
                        STAGE {st.id} • {st.symbol}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#121212] text-[#00D09C] border border-[#282D3D]">
                        {st.volumeCount} items ({st.sharePct})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#121212] text-gray-300 border border-[#282D3D] inline-block mb-1">
                        {st.lens}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-snug">{st.name}</h4>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#282D3D]">
                      <span className="text-[#9EA0A8]">Target Rate:</span>
                      <strong className="text-white">{st.targetRate}</strong>
                    </div>

                    {/* Expand / Collapse Sub-Drivers Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleStageExpand(st.id, e)}
                        className="text-[11px] font-semibold text-[#00D09C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "▾ Hide 3 Drivers" : "▸ Expand 3 Drivers"}</span>
                      </button>
                      <span className="text-[10px] text-[#696C7C]">
                        {isSelected ? "● Active View" : "Click to view"}
                      </span>
                    </div>
                  </div>

                  {/* Connecting Line to Sub-Drivers */}
                  {isExpanded && (
                    <div className="w-0.5 h-4 bg-[#282D3D] mx-auto"></div>
                  )}

                  {/* Level 2 Sub-Driver Nodes */}
                  {isExpanded && (
                    <div className="space-y-2.5 pl-2 border-l-2 border-[#282D3D]">
                      {st.subDrivers.map((sub) => {
                        const isSubSelected = selectedSubDriver?.id === sub.id;

                        return (
                          <div
                            key={sub.id}
                            onClick={() => {
                              setSelectedStageId(st.id);
                              setSelectedSubDriver(sub);
                            }}
                            className={`p-3 rounded-xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                              isSubSelected
                                ? "bg-[#232734] border-[#5367FF] shadow-md ring-1 ring-[#5367FF]/50"
                                : "bg-[#181B22] border-[#282D3D] hover:border-[#3E455B]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#5367FF]">DRIVER {sub.id}</span>
                              <span className="text-[10px] text-[#9EA0A8] bg-[#121212] px-1.5 py-0.5 rounded">
                                {sub.itemCount} items
                              </span>
                            </div>

                            <div className="font-semibold text-white leading-snug">{sub.name}</div>
                            <p className="text-[11px] text-[#9EA0A8] line-clamp-2">{sub.coreFriction}</p>

                            <div className="pt-1 flex items-center justify-between text-[10px] text-[#00D09C] font-medium border-t border-[#232734]">
                              <span className="truncate max-w-[130px]">💡 {sub.leadSolution}</span>
                              <span className="text-gray-400">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Node Inspector Drawer for Selected Stage or Sub-Driver */}
          <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-2xl space-y-5">
            <div className="border-b border-[#282D3D] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30">
                    Node Inspector
                  </span>
                  <span className="text-xs text-[#9EA0A8]">
                    {selectedSubDriver ? `Sub-Driver ${selectedSubDriver.id}` : `Stage ${currentStage.id}`} Focus
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                  {selectedSubDriver ? selectedSubDriver.name : currentStage.name}
                </h3>
              </div>

              <div className="text-xs text-right">
                <span className="text-[#9EA0A8] block">Corpus Volume</span>
                <strong className="text-white text-sm">
                  {selectedSubDriver ? `${selectedSubDriver.itemCount} items (${selectedSubDriver.sharePct})` : `${currentStage.volumeCount} items (${currentStage.sharePct})`}
                </strong>
              </div>
            </div>

            {selectedSubDriver ? (
              /* Sub-Driver Deep Dive */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">KPI Formula &amp; Targets</h5>
                    <p className="text-xs text-white font-mono bg-[#121212] p-2.5 rounded-lg border border-[#282D3D] mt-1">
                      {selectedSubDriver.kpiFormula}
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-2 text-[#9EA0A8]">
                      <span>Baseline: <strong className="text-gray-300">{selectedSubDriver.baseline}</strong></span>
                      <span>→</span>
                      <span>Target: <strong className="text-[#00D09C]">{selectedSubDriver.target}</strong></span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Root Cause Breakdown</h5>
                    <p className="text-xs text-[#ED5533] bg-[#ED5533]/10 p-3 rounded-xl border border-[#ED5533]/30 mt-1">
                      {selectedSubDriver.coreFriction}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Lead Product Intervention</h5>
                    <div className="bg-[#00D09C]/10 p-3 rounded-xl border border-[#00D09C]/30 text-xs text-white mt-1">
                      <strong className="text-[#00D09C] block mb-0.5">Solution:</strong>
                      {selectedSubDriver.leadSolution}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">
                    Scraped Evidence from Discovery Corpus:
                  </h5>
                  <div className="bg-[#232734] p-4 rounded-xl border-l-4 border-[#00D09C] text-xs text-gray-200 space-y-2">
                    <p className="italic leading-relaxed">"{selectedSubDriver.quote}"</p>
                    <div className="text-[10px] text-[#00D09C] font-semibold text-right">
                      Source: {selectedSubDriver.quoteSource} • Verified Public Feedback
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSubDriver(null)}
                    className="text-xs text-[#9EA0A8] hover:text-white underline cursor-pointer pt-2 block"
                  >
                    ← Back to Stage Overview
                  </button>
                </div>
              </div>
            ) : (
              /* Stage Deep Dive */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Stage Outcome Question</h5>
                    <p className="text-sm font-semibold text-white mt-1">{currentStage.userQuestion}</p>
                    <p className="text-xs text-[#9EA0A8] mt-0.5">{currentStage.productOutcome}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">What A Breakdown Looks Like</h5>
                    <p className="text-xs text-[#ED5533] mt-1 leading-relaxed bg-[#ED5533]/10 p-3 rounded-xl border border-[#ED5533]/30">
                      {currentStage.breakLooksLike}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Recommended Product Interventions</h5>
                    <ul className="text-xs text-gray-200 mt-1.5 space-y-1.5">
                      {currentStage.interventions.map((inv, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#00D09C] font-bold shrink-0">✓</span>
                          <span>{inv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">
                    Verbatim Scraped Voice of Customer Quotes:
                  </h5>
                  <div className="space-y-3">
                    {currentStage.quotes.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-[#232734] p-3.5 rounded-xl border-l-3 border-[#00D09C] text-xs text-gray-200 space-y-1"
                      >
                        <p className="italic leading-relaxed">"{q.quote}"</p>
                        <div className="text-[10px] text-[#00D09C] font-semibold text-right">
                          Verified from {q.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: STAGE-BY-STAGE CARDS VIEW */}
      {activeViewMode === "cards" && (
        <div className="space-y-6">
          {/* 4 Interactive Journey Stage Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES_DATA.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStageId(st.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedStageId === st.id
                    ? "bg-[#232734] border-[#00D09C] shadow-lg ring-1 ring-[#00D09C]/40"
                    : "bg-[#1C2028] border-[#282D3D] hover:border-[#3E455B]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#696C7C]">STAGE {st.id}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedStageId === st.id
                        ? "bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30"
                        : "bg-[#121212] text-[#9EA0A8]"
                    }`}
                  >
                    {st.volumeCount} items ({st.sharePct})
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1C2028] text-gray-300 border border-[#282D3D]">
                    {st.lens}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug">{st.name}</h3>
                <p className="text-xs text-[#9EA0A8] line-clamp-2">{st.userQuestion}</p>

                <div className="text-[11px] font-semibold text-[#00D09C] pt-1">
                  Symbol: <span className="font-mono text-gray-200">{st.symbol}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Stage Deep Dive */}
          <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-6">
            <div className="border-b border-[#282D3D] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#00D09C] uppercase tracking-wider">Selected Stage Details</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{currentStage.name}</h2>
              </div>
              <div className="text-xs text-[#9EA0A8]">
                Tagged Corpus Volume: <strong className="text-white">{currentStage.volumeCount} items</strong> ({currentStage.sharePct} of clean items)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Metrics & Break Points */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Target Product Outcome</h4>
                  <p className="text-sm font-semibold text-white mt-1">{currentStage.productOutcome}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">What A Breakdown Looks Like</h4>
                  <p className="text-xs text-[#ED5533] mt-1 leading-relaxed bg-[#ED5533]/10 p-3.5 rounded-xl border border-[#ED5533]/30">
                    {currentStage.breakLooksLike}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Primary Churn Classification</h4>
                  <p className="text-xs font-medium text-gray-200 mt-1">{currentStage.primaryChurn}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">Recommended Product Interventions</h4>
                  <ul className="text-xs text-gray-200 mt-1.5 space-y-1.5">
                    {currentStage.interventions.map((inv, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#00D09C] font-bold shrink-0">✓</span>
                        <span>{inv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Voice of Customer Quotes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">
                  Real User Voice from Discovery Engine (Verbatim Quotes):
                </h4>
                <div className="space-y-3">
                  {currentStage.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-[#232734] p-4 rounded-xl border-l-3 border-[#00D09C] text-xs text-gray-200 space-y-1"
                    >
                      <p className="italic leading-relaxed">"{q.quote}"</p>
                      <div className="text-[10px] text-[#00D09C] font-semibold text-right">
                        Verified from {q.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
