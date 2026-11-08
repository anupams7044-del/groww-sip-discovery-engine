# Architecture – Groww SIP Discovery Engine

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOCAL MACHINE (Node.js Scripts)                  │
│                                                                         │
│  /scripts/ingest/     /scripts/clean.ts    /scripts/tag.ts             │
│  ┌──────────────┐     ┌───────────────┐    ┌────────────────┐          │
│  │ Play Store   │     │ Dedup         │    │ Gemini API /   │          │
│  │ Reddit       │────▶│ Length Filter │───▶│ Local AI Tag   │          │
│  │ TradingQ&A   │     │ Language      │    │ (Zod validated)│          │
│  │ YouTube      │     │ False-pos SIP │    └───────┬────────┘          │
│  │ App Store    │     └───────────────┘            │                   │
│  └──────────────┘                                  ▼                   │
│         │              /scripts/themes.ts   /data/tagged/items.json    │
│         ▼              ┌────────────────┐          │                   │
│  /data/raw/<src>.json  │ Cluster        │◀─────────┘                   │
│                        │ Score          │                               │
│                        │ Rank           │                               │
│                        └───────┬────────┘                              │
│                                ▼                                        │
│                     /data/insights/themes.json                         │
│                     /data/insights/opportunities.json                  │
│                     /data/eval/golden-set.json                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │  git push → Vercel auto-deploys
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     VERCEL (Next.js App Router)                        │
│                                                                         │
│  /app (Public Web Portal)                                              │
│  ┌────────────┬──────────────┬──────────────┬────────────────┐         │
│  │ Overview   │ Ask Engine   │ Metric Tree  │ Opportunities  │         │
│  │ Dashboard  │ (Q&A with    │ (Interactive │ (Ranked cards  │         │
│  │ (KPIs,     │  cited       │  funnel      │  with scores,  │         │
│  │  funnel    │  quotes,     │  breakdown)  │  quotes, vol%) │         │
│  │  stats)    │  fallback)   │              │                │         │
│  ├────────────┼──────────────┼──────────────┼────────────────┤         │
│  │ Sources    │ Evals &      │ Pipeline     │ Disclaimer     │         │
│  │ (Browse    │ Evidence Log │ (Visual      │ (No investment │         │
│  │  raw data) │ (Golden set, │  architecture│  advice, SEBI  │         │
│  │            │  agreement%) │  explainer)  │  links)        │         │
│  └────────────┴──────────────┴──────────────┴────────────────┘         │
│                                                                         │
│  /api/ask  →  Retrieves from /data/tagged + /data/insights             │
│               Validates quotes, declines financial advice              │
│               Falls back if <3 citations or confidence <0.5            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

| Stage | Input | Output | Tooling |
|-------|-------|--------|---------|
| **Ingest** | Public APIs / Web | `/data/raw/<source>.json` | Node scripts, fetch/cheerio |
| **Clean** | Raw JSONs | `/data/clean/items.json` + `funnel.json` | Deterministic TS filters |
| **Tag** | Clean items | `/data/tagged/items.json` | AI (Gemini or local session) + Zod |
| **Themes** | Tagged items | `/data/insights/themes.json`, `opportunities.json` | Statistical clustering + scoring |
| **Eval** | Tagged + Golden | `/data/eval/results.json` | Confusion matrix, agreement % |
| **Web Portal** | All `/data/*` | 8-view interactive site | Next.js + Tailwind on Vercel |

## Taxonomy Schema (Per Item After Tagging)

```json
{
  "id": "reddit_abc123",
  "source": "reddit",
  "text": "original post/review text",
  "lifecycle_stage": "early_experience | setup | mid_term_drift | mandate_failure",
  "churn_type": "voluntary | involuntary | considering | none",
  "action": "paused | stopped | reduced | continued | switched",
  "trigger": "negative_returns | mandate_bounce | cash_crunch | peer_influence | confusion | ...",
  "expectation_gap": "expected_quick_returns | expected_guaranteed | expected_FD_like | none",
  "verbatim_quote": "exact quote from the text",
  "user_segment": { "age_group": "...", "experience_level": "...", "platform": "..." },
  "confidence": 0.85,
  "tagged_by": "gemini | manual | session"
}
```

## Opportunity Scoring Formula

```
Opportunity Score = Volume Share (%) × Severity (1–5) × Addressability (1–5)
```

Where:
- **Volume Share** = count of items with this trigger / total tagged items
- **Severity** = how directly it causes SIP stoppage (1=mild frustration, 5=immediate cancellation)
- **Addressability** = how feasible it is for Groww's product team to solve (1=regulatory, 5=pure UX)

## Key Design Principles

1. **Traceability**: Every insight links back to exact verbatim quotes with source URLs.
2. **Safety**: Zero investment advice, financial disclaimer on every page, safe fallback for uncertain queries.
3. **Reproducibility**: All data is versioned JSON; any evaluator can re-run the pipeline and get identical results.
4. **Portability**: Universal LLM adapter means the engine works with Gemini, OpenAI, Claude, or zero API (pre-tagged mode).
