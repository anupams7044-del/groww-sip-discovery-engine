# Changelog

All notable changes to the Groww SIP Discovery Engine will be documented here.

## [Phase 0] - Initialization & Setup
- Created `problemStatement.txt` capturing project brief, metrics, constraints, and rubric.
- Created `CLAUDE.md` with master context, constraints, and architecture.
- Created `/docs/DECISIONS.md` documenting foundational technology and architectural decisions.
- Selected Google Gemini API (Free Tier via Google AI Studio) as primary LLM provider with swappable `/lib/llm.ts` adapter.

## [Phase 1] - Data Ingestion
- Scaffolded Next.js (App Router) + TypeScript + Tailwind CSS project in `groww-sip-discovery`.
- Created unified raw schema and types in `scripts/types.ts`.
- Implemented and executed 5 ingestion pipelines in `scripts/ingest/`:
  - `playstore.ts`: Ingested 40 Groww SIP reviews.
  - `appstore.ts`: Ingested 20 App Store SIP reviews.
  - `tradingqna.ts`: Scraped 293 live discussion topics & replies from TradingQ&A forum.
  - `youtube.ts`: Ingested 25 authentic Indian YouTube SIP comments.
  - `reddit.ts`: Ingested 12 comprehensive Reddit discussion threads from r/IndiaInvestments, r/mutualfunds, and r/groww.
- Generated collection manifest at `/data/raw/manifest.json` tracking 390 total items across 5 sources.
- Built verification summary script in `scripts/ingest/summary.ts`.

## [Phase 2] - Cleaning & Relevance Filtering
- Created universal Gemini LLM wrapper in `/lib/llm.ts`.
- Implemented `/scripts/clean.ts` with 3-step cleaning funnel (deduplication, length/noise filtering, and false-positive filtering).
- Scaled multi-app deep scraping across 12 Indian platforms (Groww, Zerodha Coin, Kite, INDmoney, Angel One, Upstox, Paytm Money, ET Money, Kuvera, etc.).
- Total corpus increased: 1,088 raw items -> 1,025 clean, authentic SIP discussions retained (94.2% retention rate).

## [Phase 3] - Structured AI Tagging (Full Dataset Complete)
- Executed batch LLM processing across all 1,025 clean items via `scripts/tag.ts` powered by Google Gemini API.
- Evaluated full taxonomy: lifecycle stage, churn type, user action, causal triggers, unmet needs, segment signals, and verbatim quotes.
- Results across 1,025 items:
  - 100% completion rate into `/data/tagged/items.json`.
  - 97.9% exact quote match rate (1,004 / 1,025 verbatim quotes verified).
  - Only 3.0% (31 items) flagged as low confidence or needing human review.
  - Churn breakdown: 141 involuntary (mandate/bank failures), 219 voluntary (cancellations/redemptions), 484 active continuers, 181 unclear/general.

## [Phase 4] - Themes & Opportunity Scoring
- Implemented `/scripts/themes.ts` clustering 1,025 items into 10 mutually exclusive, MECE opportunity themes.
- Formulated quantitative Opportunity Score: `Score = (Volume Share % * Severity * Addressability) / 10`.
- Established baseline addressability (1–5) and PM feasibility rationales in `/data/insights/addressability.json`.
- Generated `/data/insights/themes.json` and ranked opportunity matrix in `/data/insights/opportunities.json`.
- Verified strict compliance with project constraints (zero fund recommendations, zero FOMO/urgency nudges).
- Top opportunities identified:
  1. Autopay & Mandate Execution Failures (Score: 69.3, 34.6% volume share)
  2. NAV, XIRR & Tax/Exit Load Confusion (Score: 33.2, 22.1% volume share)
  3. Early Red Returns & Volatility Shock (Score: 21.1, 10.5% volume share)
  4. Rigid Pause & Modification Barriers (Score: 18.8, 7.5% volume share)

## [Phase 5] - Ask-the-Engine Guardrailed Q&A
- Implemented Next.js Serverless API Route at `/api/ask/route.ts` with Gemini RAG pipeline.
- Implemented deterministic guardrails:
  - Regulatory Filter: Automatically intercepts and refuses stock/fund recommendations per SEBI guidelines.
  - Evidence Floor: Falls back cleanly when fewer than 2 relevant reviews exist.
  - Verbatim Check: Validates that cited quotes exist in retrieved corpus.
- Tested all 9 NextLeap PM starter questions via `scripts/test-ask-engine.ts` with 100% success rate.

## [Phase 6] - Evaluation Rig & Evidence Log
- Created hand-labeled Golden Set of 20 representative items in `/data/eval/golden.json`.
- Evaluated Gemini agreement against Golden Set in `/scripts/eval.ts`:
  - Lifecycle Stage Agreement: 90% (18/20)
  - Action Agreement: 95% (19/20)
  - First-Time Signal: 100% (20/20)
  - Churn Type Agreement: 75% (15/20)
  - Verbatim Quote Exactness: 85% (17/20)
  - Full Item Perfect Match: 65% (13/20)
- Analyzed Top 5 Failure Patterns and documented prompt/algorithmic remedies.
- Authored mandatory deliverable `/docs/EVIDENCE_LOG.md` detailing sources, volumes, benchmarks, and 3 case studies where human PM rejected AI output.

## [Phase 7] - Web Portal, UI & Vercel Production Build
- Built production Next.js 16 App Router interface adhering to Groww design tokens (mint green `#00D09C`, dark slate `#44475B`, WCAG AA contrast).
- Developed 8 integrated views:
  1. `OverviewView`: Executive KPI cards, funnel summary, source breakdown, and top churn themes.
  2. `AskEngineView`: Interactive Q&A with 9 one-click NextLeap starter questions, citation inspection, and guardrails.
  3. `MetricTreeView`: Interactive SVG/DOM metric decomposition tree (Setup × Mandate × Early × Mid-Term).
  4. `OpportunitiesView`: Ranked MECE opportunity cards with segment filtering and user quote expansion.
  5. `SourcesView`: Multi-platform breakdown across 12 apps and 5 channels with raw evidence samples.
  6. `EvalsView`: Interactive evaluation scorecard, failure pattern analysis, and PM correction case studies.
  7. `PipelineView`: 5-step hybrid architecture breakdown demonstrating where code vs AI earns its place.
  8. `DisclaimerView`: Academic fellowship notice, SEBI/AMFI compliance links, and privacy policy.
- Added `GuidedTour` modal for first-time visitors and `FloatingHelp` quick drawer.
- Verified Next.js 16 Turbopack production build with zero TypeScript errors.
- Created `/docs/DEPLOYMENT.md` with complete instructions for Vercel free tier deployment.
