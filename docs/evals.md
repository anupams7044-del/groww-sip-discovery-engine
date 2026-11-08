# Evaluation Strategy – AI Evidence Log Plan

## Purpose
Demonstrate that the AI-powered tagging and insight generation is trustworthy, auditable, and not blindly accepted. This is a **mandatory deliverable** per the project rubric.

---

## 1. Golden Set (20 Hand-Labeled Items)

### What It Is
A curated set of ~20 raw items (reviews, Reddit posts, forum threads) that **you manually label** using the same taxonomy the AI uses:
- `lifecycle_stage` (setup / early_experience / mid_term_drift / mandate_failure)
- `churn_type` (voluntary / involuntary / considering / none)
- `trigger` (negative_returns / mandate_bounce / cash_crunch / peer_influence / confusion / ...)
- `action` (paused / stopped / reduced / continued / switched)
- `verbatim_quote` (the most relevant sentence from the text)

### Selection Criteria
- At least 2 items per source (Play Store, Reddit, TradingQ&A, YouTube, App Store)
- At least 1 item per lifecycle stage
- Include 2–3 "tricky" items (ambiguous, Hinglish, sarcastic, multi-topic)

### Storage
- `/data/eval/golden-set.json` – Array of 20 items with `human_label` fields

---

## 2. Agreement Measurement

### How We Measure
For each of the 20 golden items, compare `human_label` vs `ai_label` across all taxonomy fields.

### Metrics
| Metric | Formula | Target |
|--------|---------|--------|
| **Exact Match (per field)** | Fields where human == AI / Total fields | ≥ 75% |
| **Exact Match (per item)** | Items where ALL fields match / 20 | ≥ 60% |
| **Confusion Matrix** | Per `lifecycle_stage` and `churn_type` | Visual heatmap |
| **Quote Overlap** | % of AI quote words present in human-selected quote | ≥ 70% |

### Storage
- `/data/eval/results.json` – Per-item comparison with match/mismatch flags
- Rendered in the **Evals & Evidence** view of the web portal

---

## 3. AI Rejections & Corrections (2–3 Documented Cases)

### What to Document
Specific instances where:
1. The AI tagged something incorrectly and you overrode it (e.g., tagged "mandate_bounce" when the user was actually complaining about UI confusion).
2. The AI hallucinated a quote that doesn't exist in the source text.
3. The AI assigned high confidence to an ambiguous item that needed human judgment.

### Format (Per Case)
```markdown
### Correction #1: [Brief Title]
- **Item ID:** reddit_xyz789
- **AI Output:** lifecycle_stage = "setup", trigger = "KYC_delay"
- **Human Correction:** lifecycle_stage = "early_experience", trigger = "NAV_confusion"
- **Reasoning:** The user had already started their SIP (setup was complete). Their complaint was about not understanding why their NAV showed a different amount than what they invested, which is an early experience issue, not a setup issue.
```

### Storage
- `/docs/EVIDENCE_LOG.md` – Final publishable document with all 3 sections

---

## 4. Sources & Volume Summary

The Evidence Log must also include:
| Source | Items Collected | Items After Cleaning | Date Range |
|--------|----------------|---------------------|------------|
| Play Store | TBD | TBD | TBD |
| Reddit | TBD | TBD | TBD |
| TradingQ&A | TBD | TBD | TBD |
| YouTube | TBD | TBD | TBD |
| App Store | TBD | TBD | TBD |
| **Total** | **TBD** | **TBD** | — |

---

## 5. Quality Safeguards in the Live Engine

| Safeguard | Implementation |
|-----------|---------------|
| **Strict JSON validation** | Every AI output validated with Zod schema; malformed → retry once → `needs_review` |
| **Quote verification** | Verbatim quotes checked against source text; if not found → flagged |
| **Confidence threshold** | Items with confidence < 0.5 excluded from opportunity scoring |
| **Financial advice blocker** | Q&A engine refuses fund/stock recommendations with standard disclaimer |
| **Low-citation fallback** | If < 3 supporting quotes found for a query → "Insufficient evidence" response |
