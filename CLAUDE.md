# CLAUDE.md – SIP Discovery Engine Master Context

You are helping me build a lightweight "SIP Discovery Engine" for a product management graduation project. Follow the architecture described in the ARCHITECTURE section of this file; if anything conflicts with it, flag the conflict and ask me before changing anything. Before writing code in any phase, read /docs/CHANGELOG.md and /docs/DECISIONS.md, propose a short plan, and wait for my OK.

## GOAL
Analyse public user feedback about SIPs and first-time mutual fund investing in India (Groww / Zerodha Coin / INDmoney) to find WHY first-time investors stop having an active SIP within 12 months. Active SIP = at least one successful instalment in the last 30 days. The engine must go beyond sentiment: identify themes, quantify them, compare opportunity areas, and cite real quotes as evidence.

## STACK AND CONSTRAINTS
- Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel free tier.
- Keep it lightweight: no heavy database. Store data as versioned JSON files in `/data` (or Vercel Blob if a file gets too big).
- Heavy jobs (scraping, bulk LLM tagging) run as local Node scripts in `/scripts`, NOT inside Vercel functions (they time out). The deployed app only reads processed data and makes small LLM calls.
- One LLM provider behind a single wrapper in `/lib/llm.ts` (configured with Google Gemini by default via `GEMINI_API_KEY`, swappable to OpenAI or Claude via environment variables). API keys only via environment variables; never hard-code or commit them.
- Every LLM call must return strict JSON validated with `zod`. On invalid output: retry once, then mark the item as "needs_review" instead of guessing.
- No investment advice anywhere. No fund or stock recommendations.

## ARCHITECTURE
1. **Ingest (`/scripts/ingest/`):** Keyword-centric ("SIP" variants) collection from Play Store, App Store, Reddit (r/IndiaInvestments, r/mutualfunds, etc.), TradingQ&A, and YouTube comments into `/data/raw/<source>.json`.
2. **Clean & Filter (`/scripts/clean.ts`):** Deduplication, minimum length, language tagging, false-positive filter ("sip of tea") logged into `/data/clean/funnel.json` and output to `/data/clean/items.json`.
3. **AI Tagging (`/scripts/tag.ts`):** Taxonomy tagging (lifecycle stage, churn type, trigger, expectation gap, verbatim quote, confidence) into `/data/tagged/items.json` using Gemini API with batching and local caching.
4. **Themes & Opportunities (`/scripts/themes.ts`):** Clusters triggers into 8–15 themes, computes volume share, segment splits, addressability, and opportunity scores into `/data/insights/`.
5. **Cited Q&A API (`/api/ask`):** Answers PM questions using only tagged data, validates verbatim quotes, declines financial advice, falls back if <3 citations or confidence <0.5.
6. **Evals & Evidence Log (`/scripts/eval.ts` & `/docs/EVIDENCE_LOG.md`):** 20-item hand-labeled golden set, agreement % confusion matrix, human correction notes.
7. **Public Web Portal (`/app`):** Groww-inspired UI (#00D09C accent, dark slate, WCAG AA, responsive), 8 views (Overview, Ask Engine, Metric Tree, Opportunities, Sources, Evals, Pipeline, Disclaimer), first-time guided tour, deployed to Vercel.

## HOW WE WORK
- Build one phase at a time. At the end of each phase: list the files created, show how to run it, show sample output, and STOP for review.
- Keep `/docs/CHANGELOG.md` and `/docs/DECISIONS.md` updated each phase.
- Prefer simple, readable code over clever code.
