# Phase-Wise Implementation Plan

## Phase 0: Initialization & Setup ✅ DONE
- [x] `problemStatement.txt` – Full project brief
- [x] `CLAUDE.md` – Master context for AI-assisted development
- [x] `docs/CHANGELOG.md` – Running change log
- [x] `docs/DECISIONS.md` – ADRs 001–004
- [x] `.env.example` – API key template
- [x] `docs/architecture.md` – System architecture & data flow
- [x] `docs/phases.md` – This file
- [x] `docs/evals.md` – Evaluation strategy

---

## Phase 1: Data Ingestion
**Goal:** Collect 500–1000+ authentic SIP-related discussions from 5+ sources.

**Tasks:**
- [ ] Set up Next.js project scaffold (`npx create-next-app`)
- [ ] Write `/scripts/ingest/playstore.ts` – Groww Play Store reviews
- [ ] Write `/scripts/ingest/reddit.ts` – r/IndiaInvestments, r/mutualfunds, r/groww
- [ ] Write `/scripts/ingest/tradingqna.ts` – TradingQ&A (Zerodha forum) SIP threads
- [ ] Write `/scripts/ingest/youtube.ts` – Comments from top SIP videos
- [ ] Write `/scripts/ingest/appstore.ts` – App Store reviews
- [ ] Normalize all outputs into unified schema in `/data/raw/<source>.json`
- [ ] Log collection stats (count per source, date range) in `/data/raw/manifest.json`

**Output:** `/data/raw/` populated with 500–1000+ raw items across sources.

---

## Phase 2: Cleaning & Filtering
**Goal:** Remove noise, duplicates, and false positives; document the funnel.

**Tasks:**
- [ ] Write `/scripts/clean.ts`
- [ ] Deduplication (exact + near-duplicate via normalized text)
- [ ] Minimum length filter (drop items < 20 words)
- [ ] Language filter (keep English + Hinglish)
- [ ] False-positive "SIP" filter (remove "sip of tea", "SIP trunk", etc.)
- [ ] Output `/data/clean/items.json` and `/data/clean/funnel.json` (counts at each step)

**Output:** Clean corpus of 300–600 high-quality items + transparent funnel stats.

---

## Phase 3: AI Tagging (Taxonomy Classification)
**Goal:** Tag every clean item with lifecycle stage, churn type, trigger, expectation gap, verbatim quote, and confidence score.

**Tasks:**
- [ ] Define Zod schema for tagged item output
- [ ] Write `/scripts/tag.ts` using AI session (or Gemini API if key available)
- [ ] Batch processing with local JSON caching (resume-safe)
- [ ] Items with confidence < 0.5 flagged as `needs_review`
- [ ] Output `/data/tagged/items.json`

**Output:** Fully tagged dataset ready for theme extraction.

---

## Phase 4: Theme Extraction & Opportunity Scoring
**Goal:** Cluster triggers into 8–15 themes, compute opportunity scores, generate ranked matrix.

**Tasks:**
- [ ] Write `/scripts/themes.ts`
- [ ] Group tagged items by trigger clusters
- [ ] Compute per-theme: volume share, severity (1–5), addressability (1–5)
- [ ] Calculate opportunity score = volume × severity × addressability
- [ ] Segment splits (by user age, experience, platform)
- [ ] Output `/data/insights/themes.json` and `/data/insights/opportunities.json`

**Output:** Ranked opportunity matrix with scores, ready for the web portal.

---

## Phase 5: Evals & Evidence Log
**Goal:** Validate AI tagging quality with a 20-item golden set and document corrections.

**Tasks:**
- [ ] Hand-label 20 representative items across sources and themes
- [ ] Write `/scripts/eval.ts` to compute agreement %, confusion matrix
- [ ] Document 2–3 AI output rejections/corrections with reasoning
- [ ] Create `/docs/EVIDENCE_LOG.md`
- [ ] Output `/data/eval/golden-set.json` and `/data/eval/results.json`

**Output:** Publishable evidence log proving AI quality and human oversight.

---

## Phase 6: Web Portal (Next.js + Tailwind on Vercel)
**Goal:** Build and deploy an 8-view interactive portal with Groww-inspired design.

**Views:**
- [ ] **Overview Dashboard** – KPIs, funnel stats, top themes at a glance
- [ ] **Ask the Engine** – Q&A with 9 starter PM questions, cited quotes, fallback
- [ ] **Metric Tree** – Interactive decomposition of 12-month SIP continuation
- [ ] **Opportunities** – Ranked cards with scores, volume %, severity, quotes
- [ ] **Sources** – Browse raw data by source, search & filter
- [ ] **Evals & Evidence** – Golden set results, agreement %, correction notes
- [ ] **Pipeline** – Visual architecture explainer (how the engine works)
- [ ] **Disclaimer** – No investment advice, SEBI/AMFI links, data provenance

**Design System:**
- Accent: `#00D09C` (Groww green)
- Background: White cards on light grey
- Text: Dark slate `#1F2937`
- WCAG AA contrast compliance
- Mobile-first responsive

**Output:** Deployed to Vercel, publicly accessible link for mentors.

---

## Phase 7: Polish & Submission Prep
**Goal:** Final QA, documentation, and deliverable packaging.

**Tasks:**
- [ ] End-to-end QA of all 8 views
- [ ] Mobile responsiveness check
- [ ] Final `CHANGELOG.md` and `DECISIONS.md` updates
- [ ] Generate final `EVIDENCE_LOG.md` with all required sections
- [ ] Prepare 1-slide discovery engine explainer for the 10-slide deck
- [ ] Ensure Vercel deployment is stable and publicly accessible

**Output:** Production-ready Discovery Engine with all deliverables linked.
