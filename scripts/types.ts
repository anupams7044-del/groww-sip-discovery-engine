// Shared types for the entire Discovery Engine pipeline

/** Raw item as collected from any source */
export interface RawItem {
  id: string;
  source: Source;
  source_url: string;
  author: string;
  date: string; // ISO 8601
  text: string;
  rating?: number; // 1-5 for app store reviews
  upvotes?: number;
  reply_count?: number;
  platform_meta?: Record<string, unknown>;
}

export type Source =
  | "playstore"
  | "appstore"
  | "reddit"
  | "tradingqna"
  | "youtube";

/** Cleaning funnel stats */
export interface FunnelStats {
  source: Source | "all";
  raw_count: number;
  after_dedup: number;
  after_length_filter: number;
  after_language_filter: number;
  after_false_positive_filter: number;
  final_count: number;
}

/** Taxonomy labels applied by AI tagging */
export interface TaggedItem extends RawItem {
  lifecycle_stage: LifecycleStage;
  churn_type: ChurnType;
  action: UserAction;
  trigger: Trigger;
  expectation_gap: ExpectationGap;
  verbatim_quote: string;
  user_segment: UserSegment;
  confidence: number; // 0-1
  tagged_by: "gemini" | "openai" | "claude" | "manual" | "session";
  needs_review: boolean;
}

export type LifecycleStage =
  | "setup"
  | "early_experience"
  | "mid_term_drift"
  | "mandate_failure"
  | "general";

export type ChurnType =
  | "voluntary"
  | "involuntary"
  | "considering"
  | "none";

export type UserAction =
  | "paused"
  | "stopped"
  | "reduced"
  | "continued"
  | "switched"
  | "started"
  | "unclear";

export type Trigger =
  | "negative_returns"
  | "mandate_bounce"
  | "cash_crunch"
  | "peer_influence"
  | "confusion_nav"
  | "confusion_ui"
  | "underwhelming_returns"
  | "market_crash_fear"
  | "emergency_withdrawal"
  | "better_alternative"
  | "trust_issues"
  | "kyc_delay"
  | "app_bugs"
  | "lack_of_guidance"
  | "overmonitoring"
  | "salary_timing"
  | "family_pressure"
  | "goal_unclear"
  | "other";

export type ExpectationGap =
  | "expected_quick_returns"
  | "expected_guaranteed"
  | "expected_fd_like"
  | "expected_stock_like"
  | "expected_passive"
  | "none";

export interface UserSegment {
  age_group?: "18-24" | "25-30" | "31-40" | "40+";
  experience_level?: "first_time" | "beginner" | "intermediate" | "experienced";
  platform?: "groww" | "zerodha" | "indmoney" | "other" | "unknown";
}

/** Theme / Opportunity */
export interface Theme {
  id: string;
  name: string;
  description: string;
  triggers: Trigger[];
  volume_count: number;
  volume_share_pct: number;
  severity: number; // 1-5
  addressability: number; // 1-5
  opportunity_score: number;
  representative_quotes: Array<{
    item_id: string;
    quote: string;
    source: Source;
  }>;
  segment_splits: Record<string, number>;
}

/** Manifest tracking what was collected */
export interface CollectionManifest {
  last_updated: string;
  sources: Array<{
    source: Source;
    count: number;
    date_range: { earliest: string; latest: string };
    keywords_used: string[];
  }>;
  total_items: number;
}
