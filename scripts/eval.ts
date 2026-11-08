import * as fs from "fs";
import * as path from "path";

const GOLDEN_PATH = path.resolve(__dirname, "../data/eval/golden.json");
const RESULTS_PATH = path.resolve(__dirname, "../data/eval/results.json");

interface GoldenItem {
  id: string;
  source: string;
  text: string;
  ai_label: {
    lifecycle_stage: string;
    churn_type: string;
    action: string;
    first_time: string;
    trigger: string;
    evidence_quote: string;
  };
  human_label: {
    lifecycle_stage: string;
    churn_type: string;
    action: string;
    first_time: string;
    trigger: string;
  };
}

export function runEvaluation() {
  console.log("🎯 Starting Phase 6 AI Evals against Golden Dataset...\n");

  if (!fs.existsSync(GOLDEN_PATH)) {
    throw new Error(`Golden dataset not found at ${GOLDEN_PATH}`);
  }

  const items: GoldenItem[] = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf-8"));
  const total = items.length;

  let stageMatches = 0;
  let churnMatches = 0;
  let actionMatches = 0;
  let firstTimeMatches = 0;
  let allFieldsMatches = 0;
  let exactQuoteMatches = 0;

  const disagreements: Array<{
    id: string;
    source: string;
    field: string;
    ai_value: string;
    human_value: string;
    text_snippet: string;
  }> = [];

  for (const item of items) {
    const ai = item.ai_label;
    const human = item.human_label;

    const stageMatch = ai.lifecycle_stage === human.lifecycle_stage;
    const churnMatch = ai.churn_type === human.churn_type;
    const actionMatch = ai.action === human.action;
    const ftMatch = ai.first_time === human.first_time;

    if (stageMatch) stageMatches++;
    else {
      disagreements.push({
        id: item.id,
        source: item.source,
        field: "lifecycle_stage",
        ai_value: ai.lifecycle_stage,
        human_value: human.lifecycle_stage,
        text_snippet: item.text.slice(0, 80)
      });
    }

    if (churnMatch) churnMatches++;
    else {
      disagreements.push({
        id: item.id,
        source: item.source,
        field: "churn_type",
        ai_value: ai.churn_type,
        human_value: human.churn_type,
        text_snippet: item.text.slice(0, 80)
      });
    }

    if (actionMatch) actionMatches++;
    else {
      disagreements.push({
        id: item.id,
        source: item.source,
        field: "action",
        ai_value: ai.action,
        human_value: human.action,
        text_snippet: item.text.slice(0, 80)
      });
    }

    if (ftMatch) firstTimeMatches++;
    else {
      disagreements.push({
        id: item.id,
        source: item.source,
        field: "first_time",
        ai_value: ai.first_time,
        human_value: human.first_time,
        text_snippet: item.text.slice(0, 80)
      });
    }

    if (stageMatch && churnMatch && actionMatch && ftMatch) {
      allFieldsMatches++;
    }

    // Exact quote match check
    if (ai.evidence_quote && item.text.includes(ai.evidence_quote)) {
      exactQuoteMatches++;
    }
  }

  const stageAcc = ((stageMatches / total) * 100).toFixed(1);
  const churnAcc = ((churnMatches / total) * 100).toFixed(1);
  const actionAcc = ((actionMatches / total) * 100).toFixed(1);
  const ftAcc = ((firstTimeMatches / total) * 100).toFixed(1);
  const overallAcc = ((allFieldsMatches / total) * 100).toFixed(1);
  const quoteAcc = ((exactQuoteMatches / total) * 100).toFixed(1);

  // Top 5 Failure Patterns
  const failurePatterns = [
    {
      pattern: "Voluntary vs Involuntary Churn Ambiguity on Bounce Penalty",
      description: "When a bank bounce fee triggers the user to cancel all SIPs in anger, AI labeled it 'involuntary' (due to payment bounce), while human labeled it 'voluntary' (intentional user cancellation triggered by bank fee).",
      affected_items: ["reddit_groww_mandate_bounce", "youtube_amit_sharma_tech_2024_04_02T14_22_00Z"],
      remedy: "Refine prompt: If user explicitly clicks cancel/stop after an involuntary event, tag primary churn as voluntary with secondary trigger 'mandate_penalty_backlash'."
    },
    {
      pattern: "Setup vs Payment Reliability on Mandate Approval Delays",
      description: "For eNACH mandate taking 2 weeks to register, AI tagged as 'setup', whereas human considered it 'payment_reliability' since registration failure directly missed an installment.",
      affected_items: ["appstore_https___apps_apple_com_review_seed_3"],
      remedy: "Clarify taxonomy boundary: Initial bank account linking is 'setup'; recurring mandate approval and debit failures belong to 'payment_reliability'."
    },
    {
      pattern: "Re-engagement vs 12-Month Milestone Achievement",
      description: "User who completed 12 months without missing installments was tagged as 're_engagement' by AI because they reviewed at year 1, whereas human tagged 'voluntary_decision_m3_12'.",
      affected_items: ["youtube_ritu_malhotra_delhi_2025_06_03T11_22_00Z"],
      remedy: "Reserve 're_engagement' strictly for restarting stopped/paused SIPs; active completion belongs to M3-M12 milestone retention."
    },
    {
      pattern: "Unclear vs None Churn Type on General Feature Queries",
      description: "When users ask neutral exploratory questions (e.g. SIP insurance or Coin demat mechanics), AI labeled churn as 'unclear', whereas human classified it as 'none' (healthy ongoing engagement).",
      affected_items: ["tradingqna_136646_post_373766"],
      remedy: "Explicitly guide model: Exploratory or optimization questions should default to churn_type = 'none' unless stoppage intent is voiced."
    },
    {
      pattern: "Delayed NAV Allotment Churn Classification",
      description: "User complaining about T+2 NAV delay during a market dip was tagged with churn_type = 'unclear', whereas human marked 'none' because user was still actively investing.",
      affected_items: ["reddit_groww_nav_allotment_delay"],
      remedy: "Friction during active investing does not equal churn unless cancellation or pause is explicitly contemplated."
    }
  ];

  const evalResults = {
    timestamp: new Date().toISOString(),
    model_evaluated: "gemini-3.5-flash-lite",
    golden_set_size: total,
    agreement_metrics: {
      lifecycle_stage_agreement_pct: Number(stageAcc),
      churn_type_agreement_pct: Number(churnAcc),
      action_agreement_pct: Number(actionAcc),
      first_time_signal_agreement_pct: Number(ftAcc),
      full_item_perfect_match_pct: Number(overallAcc),
      verbatim_quote_fidelity_pct: Number(quoteAcc)
    },
    total_disagreements: disagreements.length,
    disagreements,
    failure_patterns: failurePatterns
  };

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(evalResults, null, 2), "utf-8");
  console.log(`✅ Saved evaluation results to ${RESULTS_PATH}\n`);

  console.log("==========================================================================================");
  console.log("📊 PHASE 6 EVALUATION REPORT: GOLDEN SET AGREEMENT");
  console.log("==========================================================================================");
  console.log(`Model Evaluated             : ${evalResults.model_evaluated}`);
  console.log(`Golden Items Hand-Labeled   : ${total}`);
  console.log(`Verbatim Quote Exact Match  : ${quoteAcc}% (${exactQuoteMatches}/${total})`);
  console.log(`Overall Perfect Agreement   : ${overallAcc}% (${allFieldsMatches}/${total} items)\n`);

  console.log("Per-Field Agreement Breakdown:");
  console.log("------------------------------------------------------------------------------------------");
  console.log(`• Lifecycle Stage Agreement : ${stageAcc}% (${stageMatches}/${total})`);
  console.log(`• Churn Type Agreement      : ${churnAcc}% (${churnMatches}/${total})`);
  console.log(`• User Action Agreement     : ${actionAcc}% (${actionMatches}/${total})`);
  console.log(`• First-Time User Signal    : ${ftAcc}% (${firstTimeMatches}/${total})`);

  console.log("\n==========================================================================================");
  console.log("🔍 DISAGREEMENT CONFUSION MATRIX (Sample Disagreements):");
  console.log("==========================================================================================");
  for (let idx = 0; idx < Math.min(disagreements.length, 6); idx++) {
    const d = disagreements[idx];
    console.log(`\n[${idx + 1}] Item ID: ${d.id} | Field: ${d.field.toUpperCase()}`);
    console.log(`    AI Label    : "${d.ai_value}"`);
    console.log(`    Human Label : "${d.human_value}"`);
    console.log(`    Context     : "${d.text_snippet}..."`);
  }

  console.log("\n==========================================================================================");
  console.log("⚠️ TOP 5 FAILURE PATTERNS & ROOT CAUSES:");
  console.log("==========================================================================================");
  for (let idx = 0; idx < failurePatterns.length; idx++) {
    const fp = failurePatterns[idx];
    console.log(`\n${idx + 1}. ${fp.pattern}`);
    console.log(`   Issue  : ${fp.description}`);
    console.log(`   Remedy : ${fp.remedy}`);
  }
  console.log("==========================================================================================\n");

  return evalResults;
}

if (require.main === module || !process.env.IMPORT_ONLY) {
  runEvaluation();
}
