# Architectural & Strategic Decisions (ADRs)

## ADR 001: Next.js (App Router) + TypeScript on Vercel
- **Status:** Accepted
- **Context:** Need an interactive, production-deployed web portal where reviewers and mentors can test the Discovery Engine live without running local code.
- **Decision:** Use Next.js (App Router) + TypeScript + Tailwind CSS deployed on Vercel's free tier.
- **Consequences:** Front-end is highly responsive and clean; heavy compute jobs (crawling, bulk batch LLM tagging) must run locally in `/scripts/` to stay within Vercel's serverless execution limits.

## ADR 002: Lightweight File-Based JSON Storage
- **Status:** Accepted
- **Context:** Project requires fast iteration and reproducible datasets without spinning up expensive or slow cloud database infrastructure.
- **Decision:** Store versioned raw, cleaned, tagged, and eval datasets in local and committed JSON files (`/data/raw`, `/data/clean`, `/data/tagged`, `/data/insights`, `/data/eval`).
- **Consequences:** Zero external database dependency, high portability, fast file-based reads on Vercel edge/serverless routes.

## ADR 003: LLM Provider - Google Gemini with Universal Adapter
- **Status:** Accepted
- **Context:** We need high-quality structured tagging, quote extraction, and PM question answering at zero upfront API cost.
- **Decision:** Use Google Gemini 1.5 Flash / Pro via Google AI Studio (`GEMINI_API_KEY`) as the default engine behind `/lib/llm.ts`, maintaining full plug-and-play compatibility with OpenAI and Claude.
- **Consequences:** Free tier API usage, 1M context window, robust JSON mode; requires rate-limit spacing (15 RPM) during batch tagging scripts.

## ADR 004: Ingestion Strategy - Keyword-Centric on "SIP"
- **Status:** Accepted
- **Context:** To understand why first-time investors drop off, we cannot bias collection with terms like "stopped" or "paused" upfront.
- **Decision:** Collect broadly on the keyword "SIP" (and variants) across Play Store, App Store, Reddit, TradingQ&A, and YouTube. Narrowing to churn and break points happens via taxonomy tagging in Phase 3.
