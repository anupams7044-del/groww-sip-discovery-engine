import { z } from "zod";

export const LifecycleStageEnum = z.enum([
  "setup",
  "payment_reliability",
  "early_experience_m1_3",
  "voluntary_decision_m3_12",
  "re_engagement",
  "not_applicable"
]);
export type LifecycleStage = z.infer<typeof LifecycleStageEnum>;

export const ChurnTypeEnum = z.enum([
  "involuntary",
  "voluntary",
  "none",
  "unclear"
]);
export type ChurnType = z.infer<typeof ChurnTypeEnum>;

export const ActionEnum = z.enum([
  "started",
  "continuing",
  "paused",
  "reduced",
  "stopped",
  "redeemed",
  "restarted",
  "considering_stopping",
  "unclear"
]);
export type Action = z.infer<typeof ActionEnum>;

export const SegmentSignalsSchema = z.object({
  first_time: z.enum(["yes", "no", "unknown"]).catch("unknown").default("unknown"),
  income_stability: z.enum(["stable", "variable", "student", "unknown"]).catch("unknown").default("unknown"),
  age_hint: z.string().nullish().default(null),
  money_source: z.string().nullish().default(null),
  influenced_by: z.string().nullish().default(null)
});
export type SegmentSignals = z.infer<typeof SegmentSignalsSchema>;

export const TaggedItemSchema = z.object({
  id: z.string(),
  lifecycle_stage: LifecycleStageEnum.catch("not_applicable").default("not_applicable"),
  churn_type: ChurnTypeEnum.catch("none").default("none"),
  action: ActionEnum.catch("unclear").default("unclear"),
  trigger: z.string().nullish().transform((v) => v || "general_feedback").default("general_feedback"),
  expectation_gap: z.string().nullish().default(null),
  checking_behaviour: z.string().nullish().default(null),
  confusion: z.string().nullish().default(null),
  outside_app_action: z.string().nullish().default(null),
  segment_signals: SegmentSignalsSchema.default({
    first_time: "unknown",
    income_stability: "unknown",
    age_hint: null,
    money_source: null,
    influenced_by: null
  }),
  unmet_need: z.string().nullish().default(null),
  evidence_quote: z.string().nullish().transform((v) => v || "").default(""),
  confidence: z.number().nullish().transform((v) => (v != null && v >= 0 && v <= 1 ? v : 0.85)).default(0.85),
  needs_review: z.boolean().default(false)
});
export type TaggedItemResult = z.infer<typeof TaggedItemSchema>;
