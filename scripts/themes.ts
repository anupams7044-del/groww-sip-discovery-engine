import * as fs from "fs";
import * as path from "path";
import { EnrichedTaggedItem } from "./tag";

const TAGGED_ITEMS_PATH = path.resolve(__dirname, "../data/tagged/items.json");
const INSIGHTS_DIR = path.resolve(__dirname, "../data/insights");
const THEMES_PATH = path.join(INSIGHTS_DIR, "themes.json");
const OPPORTUNITIES_PATH = path.join(INSIGHTS_DIR, "opportunities.json");
const ADDRESSABILITY_PATH = path.join(INSIGHTS_DIR, "addressability.json");

if (!fs.existsSync(INSIGHTS_DIR)) {
  fs.mkdirSync(INSIGHTS_DIR, { recursive: true });
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  stage_alignment: string;
  primary_churn_type: "involuntary" | "voluntary" | "mixed";
  rules_guardrail: {
    no_fund_recommendation: boolean;
    no_fomo_urgency: boolean;
    guardrail_note: string;
  };
  keywords: RegExp[];
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "THEME_MANDATE_AUTOPAY",
    name: "Autopay & Mandate Execution Failures",
    description: "UPI Autopay, eNACH mandate bounces, bank server timeouts, and surprise bank penalty charges triggering involuntary drop-off.",
    stage_alignment: "payment_reliability",
    primary_churn_type: "involuntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Pure payment infrastructure & notification UX. Zero fund advice or FOMO."
    },
    keywords: [/mandate/i, /autopay/i, /auto-debit/i, /enach/i, /nach/i, /bounce/i, /debit failed/i, /bank charge/i, /deducted twice/i, /payment fail/i]
  },
  {
    id: "THEME_EARLY_RED_RETURNS",
    name: "Early Red Returns & Volatility Shock (Months 1–3)",
    description: "First-time investors panicking upon seeing negative returns during early months, expecting FD-like linear stability.",
    stage_alignment: "early_experience_m1_3",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Must use portfolio journey visualization and rupee-cost averaging education, NOT 'market is going up buy now' urgency."
    },
    keywords: [/negative return/i, /in red/i, /loss/i, /market down/i, /fd gives/i, /minus/i, /falling/i, /crash/i, /bear market/i, /losing money/i]
  },
  {
    id: "THEME_COMPULSIVE_MONITORING",
    name: "Compulsive Portfolio Over-Monitoring & Anxiety",
    description: "Checking portfolio multiple times daily like day trading, leading to emotional fatigue, mood swings, and premature SIP cancellation.",
    stage_alignment: "early_experience_m1_3",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "UX friction on intraday p&l checks for SIPs; milestones instead of daily tick flashes."
    },
    keywords: [/check daily/i, /open app/i, /every day/i, /times a day/i, /anxiety/i, /watching/i, /fluctuate/i, /casino/i, /overmonitoring/i, /mood/i]
  },
  {
    id: "THEME_CASHFLOW_TIMING",
    name: "Salary Cycle & Debit Date Mismatch",
    description: "Fixed SIP debit dates colliding with delayed, variable, or gig salaries, causing bounced debits and bank overdraft penalties.",
    stage_alignment: "payment_reliability",
    primary_churn_type: "involuntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Smart debit window UX based on salary arrival. Compliant and helpful."
    },
    keywords: [/salary/i, /credited on/i, /credit date/i, /debit date/i, /timing/i, /insufficient balance/i, /end of month/i, /cash crunch/i]
  },
  {
    id: "THEME_INFLEXIBLE_PAUSE",
    name: "Rigid Pause & Modification Barriers",
    description: "Inability to easily pause for more than 1–3 months, reduce installment size dynamically during emergencies, or 30-day notice friction.",
    stage_alignment: "voluntary_decision_m3_12",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Provides emergency financial breathers without permanently canceling the SIP discipline."
    },
    keywords: [/pause/i, /skip/i, /medical emergency/i, /reduce amount/i, /flexible/i, /cancel instead/i, /notice period/i, /modify sip/i]
  },
  {
    id: "THEME_YEAR1_UNDERWHELMING",
    name: "Underwhelming Year-1 Progress (Expectation Gap)",
    description: "Investors completing 10–12 months but feeling demotivated by modest nominal gains (e.g. ₹6k–₹8k), unaware compounding takes 4+ years.",
    stage_alignment: "voluntary_decision_m3_12",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Focus on capital accumulated (habit) rather than speculative future return promises."
    },
    keywords: [/1 year/i, /12 month/i, /after 1 year/i, /underwhelmed/i, /modest/i, /compounding/i, /barely/i, /not worth/i, /inflation/i]
  },
  {
    id: "THEME_METRIC_JARGON_CONFUSION",
    name: "NAV, XIRR & Tax/Exit Load Confusion",
    description: "Confusion over delayed NAV allotment (T+1/T+2), divergence between XIRR vs Absolute Returns, and hidden FIFO 1-year exit load clocks.",
    stage_alignment: "early_experience_m1_3",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "In-app plain English explanations, visual net withdrawal calculators."
    },
    keywords: [/nav/i, /xirr/i, /cagr/i, /allotment/i, /t\+1/i, /t\+2/i, /exit load/i, /lock-in/i, /capital gain/i, /stcg/i, /folio/i, /cut-off/i]
  },
  {
    id: "THEME_PEER_SPECULATION_NOISE",
    name: "Peer Noise & Speculative FOMO (F&O / IPO Distraction)",
    description: "Colleagues and social media hyping 30% weekly gains in options trading or small caps, causing investors to abandon slow SIP compounding.",
    stage_alignment: "voluntary_decision_m3_12",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Highlights wealth survival, SEBI 90% F&O loss statistics, and milestone celebration."
    },
    keywords: [/options/i, /f&o/i, /trading/i, /sme ipo/i, /friend made/i, /colleague/i, /crypto/i, /quick money/i, /gambling/i, /intraday/i]
  },
  {
    id: "THEME_UNANCHORED_GOALS",
    name: "Unanchored Discretionary SIPs (No Goal Identity)",
    description: "Starting SIPs without named goals, making the accumulated funds easy targets for impulse consumption, gadget sales, or vacations.",
    stage_alignment: "voluntary_decision_m3_12",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Enables goal naming (e.g. 'Emergency Buffer', 'Parents Anniversary') without fund steering."
    },
    keywords: [/goal/i, /gadget/i, /shopping/i, /vacation/i, /without goal/i, /impulse/i, /withdrew to buy/i, /diwali/i]
  },
  {
    id: "THEME_PLATFORM_SWITCHING",
    name: "Broker Friction, Charges & Regular vs Direct Migration",
    description: "Users discovering direct plans on other platforms or frustrated with account transfer and support response times.",
    stage_alignment: "setup",
    primary_churn_type: "voluntary",
    rules_guardrail: {
      no_fund_recommendation: true,
      no_fomo_urgency: true,
      guardrail_note: "Direct mutual fund transparency and seamless account switching."
    },
    keywords: [/regular vs direct/i, /commission/i, /expense ratio/i, /kuvera/i, /zerodha/i, /coin/i, /switch platform/i, /move to/i, /change broker/i]
  }
];

export interface ThemeInsight {
  id: string;
  name: string;
  description: string;
  stage_alignment: string;
  item_count: number;
  volume_share_pct: number;
  severity_score: number; // 1-5 (churn impact)
  addressability_score: number; // 1-5 (feasibility for Groww product team)
  opportunity_score: number; // volume_share * severity * addressability
  stage_split: Record<string, number>;
  churn_split: Record<string, number>;
  segment_signals_split: {
    first_time_users: number;
    variable_income: number;
    stable_income: number;
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

export function assignTheme(item: EnrichedTaggedItem): string {
  const text = `${item.clean_text || item.text} ${item.trigger || ""} ${item.unmet_need || ""}`.toLowerCase();

  // 1. Direct keyword pattern matching
  for (const theme of THEME_DEFINITIONS) {
    if (theme.keywords.some((rx) => rx.test(text))) {
      return theme.id;
    }
  }

  // 2. Fallback stage alignment
  if (item.lifecycle_stage === "payment_reliability" || item.churn_type === "involuntary") {
    return "THEME_MANDATE_AUTOPAY";
  }
  if (item.lifecycle_stage === "early_experience_m1_3") {
    return "THEME_EARLY_RED_RETURNS";
  }
  if (item.lifecycle_stage === "voluntary_decision_m3_12") {
    return "THEME_INFLEXIBLE_PAUSE";
  }

  return "THEME_MANDATE_AUTOPAY";
}

export function runThemeClustering(): {
  themes: ThemeInsight[];
  rankedOpportunities: ThemeInsight[];
} {
  console.log("🧩 Starting Phase 4 Theme Clustering & Opportunity Scoring...\n");

  const taggedItems: EnrichedTaggedItem[] = JSON.parse(
    fs.readFileSync(TAGGED_ITEMS_PATH, "utf-8")
  );

  console.log(`Analyzing ${taggedItems.length} tagged items across all sources.`);

  // Load or initialize addressability config
  let addressabilityConfig: Record<string, { addressability: number; rationale: string }> = {};
  if (fs.existsSync(ADDRESSABILITY_PATH)) {
    try {
      addressabilityConfig = JSON.parse(fs.readFileSync(ADDRESSABILITY_PATH, "utf-8"));
    } catch (e) {}
  }

  const defaultAddressability: Record<string, { addressability: number; rationale: string }> = {
    THEME_MANDATE_AUTOPAY: {
      addressability: 4,
      rationale: "High product addressability: Smart pre-debit notifications, retry automation, and fallback payment links prevent mandate drops."
    },
    THEME_EARLY_RED_RETURNS: {
      addressability: 5,
      rationale: "Very high UX addressability: Milestone-based affirmations, portfolio health shields, and volatility reframing without advice."
    },
    THEME_COMPULSIVE_MONITORING: {
      addressability: 4,
      rationale: "High product addressability: Intentional slow-cadence digest mode, replacing day-trading red/green flashes with SIP accumulation milestone badges."
    },
    THEME_CASHFLOW_TIMING: {
      addressability: 4,
      rationale: "High product addressability: Flexible 5-day debit window synced with salary credit instead of rigid single-day debit."
    },
    THEME_INFLEXIBLE_PAUSE: {
      addressability: 5,
      rationale: "Extremely high UX addressability: One-tap instant 1-6 month pause and partial installment scaling during emergencies."
    },
    THEME_YEAR1_UNDERWHELMING: {
      addressability: 4,
      rationale: "High UX addressability: 12-month completion milestone certificate, habit-streak tracker, celebrating total principal saved."
    },
    THEME_METRIC_JARGON_CONFUSION: {
      addressability: 5,
      rationale: "Pure UX/content addressability: Interactive 'Net in Hand' return visualizer and tooltips explaining XIRR and FIFO tax rules."
    },
    THEME_PEER_SPECULATION_NOISE: {
      addressability: 3,
      rationale: "Medium addressability: In-app investor literacy nudges showing historical patience vs F&O risk statistics."
    },
    THEME_UNANCHORED_GOALS: {
      addressability: 5,
      rationale: "Very high product addressability: One-click goal labeling ('Emergency Fund', 'House Down Payment') providing emotional retention."
    },
    THEME_PLATFORM_SWITCHING: {
      addressability: 3,
      rationale: "Moderate addressability: Direct plan comparison calculator and zero-friction external portfolio import."
    }
  };

  if (Object.keys(addressabilityConfig).length === 0) {
    addressabilityConfig = defaultAddressability;
    fs.writeFileSync(ADDRESSABILITY_PATH, JSON.stringify(addressabilityConfig, null, 2), "utf-8");
    console.log("📝 Generated /data/insights/addressability.json with baseline scores & PM rationales.");
  }

  // Pre-configured severity mapping based on churn causality
  const severityMap: Record<string, number> = {
    THEME_MANDATE_AUTOPAY: 5,        // Direct immediate involuntary churn
    THEME_INFLEXIBLE_PAUSE: 5,       // Causes immediate cancellation when pause is blocked
    THEME_EARLY_RED_RETURNS: 4,      // High panic cancellation trigger in M1-M3
    THEME_CASHFLOW_TIMING: 4,        // Leads to repeated bounce penalties and drop-off
    THEME_YEAR1_UNDERWHELMING: 4,    // Primary reason users quietly stop at month 12
    THEME_UNANCHORED_GOALS: 3,       // Causes discretionary cash-out
    THEME_COMPULSIVE_MONITORING: 3,  // Chronic emotional friction leading to burnout
    THEME_METRIC_JARGON_CONFUSION: 3,// Trust deficit and support load
    THEME_PEER_SPECULATION_NOISE: 3, // Capital diversion to quick-trade bets
    THEME_PLATFORM_SWITCHING: 3      // Migration to competitors
  };

  // Group items by theme
  const itemsByTheme = new Map<string, EnrichedTaggedItem[]>();
  for (const def of THEME_DEFINITIONS) {
    itemsByTheme.set(def.id, []);
  }

  for (const item of taggedItems) {
    const themeId = assignTheme(item);
    if (itemsByTheme.has(themeId)) {
      itemsByTheme.get(themeId)!.push(item);
    } else {
      itemsByTheme.get("THEME_MANDATE_AUTOPAY")!.push(item);
    }
  }

  const themes: ThemeInsight[] = [];
  const totalRelevant = taggedItems.length;

  for (const def of THEME_DEFINITIONS) {
    const items = itemsByTheme.get(def.id) || [];
    const count = items.length;
    const volShare = (count / totalRelevant) * 100;
    const severity = severityMap[def.id] || 3;
    const addr = addressabilityConfig[def.id]?.addressability || 3;
    const opportunityScore = Number(((volShare * severity * addr) / 10).toFixed(1));

    // Stage split
    const stageSplit: Record<string, number> = {};
    for (const it of items) {
      stageSplit[it.lifecycle_stage] = (stageSplit[it.lifecycle_stage] || 0) + 1;
    }

    // Churn split
    const churnSplit: Record<string, number> = {};
    for (const it of items) {
      churnSplit[it.churn_type] = (churnSplit[it.churn_type] || 0) + 1;
    }

    // Segment signals
    let firstTimeCount = 0;
    let variableIncomeCount = 0;
    let stableIncomeCount = 0;

    for (const it of items) {
      if (it.segment_signals?.first_time === "yes") firstTimeCount++;
      if (it.segment_signals?.income_stability === "variable") variableIncomeCount++;
      if (it.segment_signals?.income_stability === "stable") stableIncomeCount++;
    }

    // Representative quotes (up to 3 best quotes)
    const sortedByLength = [...items].sort(
      (a, b) => (b.evidence_quote?.length || 0) - (a.evidence_quote?.length || 0)
    );
    const quotes = sortedByLength.slice(0, 3).map((it) => ({
      quote: it.evidence_quote || it.clean_text.slice(0, 120),
      source: it.source,
      item_id: it.id,
      source_url: it.source_url
    }));

    themes.push({
      id: def.id,
      name: def.name,
      description: def.description,
      stage_alignment: def.stage_alignment,
      item_count: count,
      volume_share_pct: Number(volShare.toFixed(1)),
      severity_score: severity,
      addressability_score: addr,
      opportunity_score: opportunityScore,
      stage_split: stageSplit,
      churn_split: churnSplit,
      segment_signals_split: {
        first_time_users: firstTimeCount,
        variable_income: variableIncomeCount,
        stable_income: stableIncomeCount
      },
      representative_quotes: quotes,
      guardrail_compliance: {
        compliant: def.rules_guardrail.no_fund_recommendation && def.rules_guardrail.no_fomo_urgency,
        note: def.rules_guardrail.guardrail_note
      }
    });
  }

  // Rank opportunities by Opportunity Score descending
  const ranked = [...themes].sort((a, b) => b.opportunity_score - a.opportunity_score);

  fs.writeFileSync(THEMES_PATH, JSON.stringify(themes, null, 2), "utf-8");
  fs.writeFileSync(OPPORTUNITIES_PATH, JSON.stringify(ranked, null, 2), "utf-8");

  console.log(`✅ Saved ${themes.length} themes to ${THEMES_PATH}`);
  console.log(`🏆 Saved ranked opportunity matrix to ${OPPORTUNITIES_PATH}\n`);

  return { themes, rankedOpportunities: ranked };
}

export function displayRankedTable() {
  const oppPath = OPPORTUNITIES_PATH;
  if (!fs.existsSync(oppPath)) return;

  const ranked: ThemeInsight[] = JSON.parse(fs.readFileSync(oppPath, "utf-8"));

  console.log("\n==========================================================================================");
  console.log("🏆 PHASE 4: RANKED OPPORTUNITY MATRIX (12-Month SIP Continuation)");
  console.log("==========================================================================================");
  console.log(
    "Rank".padEnd(6) +
    "Theme Name".padEnd(38) +
    "Items".padEnd(8) +
    "Share%".padEnd(10) +
    "Sev(1-5)".padEnd(10) +
    "Addr(1-5)".padEnd(11) +
    "Opp Score"
  );
  console.log("-".repeat(90));

  for (let i = 0; i < ranked.length; i++) {
    const t = ranked[i];
    console.log(
      `#${i + 1}`.padEnd(6) +
      t.name.slice(0, 36).padEnd(38) +
      String(t.item_count).padEnd(8) +
      `${t.volume_share_pct}%`.padEnd(10) +
      String(t.severity_score).padEnd(10) +
      String(t.addressability_score).padEnd(11) +
      String(t.opportunity_score)
    );
  }
  console.log("==========================================================================================\n");
}

if (require.main === module || !process.env.IMPORT_ONLY) {
  const result = runThemeClustering();
  displayRankedTable();
}
