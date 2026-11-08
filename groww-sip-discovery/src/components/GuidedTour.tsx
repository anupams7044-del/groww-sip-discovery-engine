"use client";

import React, { useState } from "react";
import { NavTab } from "./Navbar";

interface GuidedTourProps {
  onNavigateTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function GuidedTour({ onNavigateTab, isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to the Groww SIP Discovery Engine",
      subtitle: "Capstone PM Research • Executive Synthesis",
      targetTab: "home" as NavTab,
      badge: "Discovery Overview",
      badgeColor: "bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30",
      content:
        "Analyzes 1,025 real public feedback discussions across 12 platforms (Play Store, App Store, Reddit, YouTube, TradingQ&A) to uncover WHY first-time investors churn before Month 12.",
      highlights: [
        { label: "Behavioral Lens (Left)", text: "The root cause: aspirational overcommitment and lack of an emergency cash buffer (~72% of retention gain)." },
        { label: "Operational Lens (Right)", text: "The breaking point: bank mandate bounces and ₹590 penalty rage-quits (~28% of retention gain)." }
      ],
      actionLabel: "Next: AI Query Engine →"
    },
    {
      title: "Ask the Engine (Cited Secondary Research)",
      subtitle: "RAG Engine with Verbatim Attribution",
      targetTab: "ask" as NavTab,
      badge: "RAG Q&A Engine",
      badgeColor: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
      content:
        "Query any of the 9 NextLeap PM research questions or type custom prompts. The engine retrieves answers directly from the 1,025 public reviews with verbatim quotes and verified external URLs.",
      highlights: [
        { label: "Verbatim Citations", text: "Every claim links back to authentic user quotes with source platform provenance." },
        { label: "Strict SEBI Guardrails", text: "Zero fund or stock steering; strict educational cash-flow compliance." }
      ],
      actionLabel: "Next: Interactive Metric Tree →"
    },
    {
      title: "Hierarchical Node-Based KPI Tree",
      subtitle: "Decomposing 12-Month Retention ($28.0% → 45.4%)",
      targetTab: "tree" as NavTab,
      badge: "KPI Decomposition",
      badgeColor: "bg-[#FFB61B]/15 text-[#FFB61B] border-[#FFB61B]/30",
      content:
        "A multi-level mathematical decomposition: Root North Star Node expands into 4 Lifecycle Stage Nodes, which further branch out into 12 Sub-Driver Leaf Nodes.",
      highlights: [
        { label: "Interactive Expand/Collapse", text: "Toggle drivers for each stage with branch lines and metric targets." },
        { label: "Deep-Dive Drawer", text: "Click any node to inspect KPI formulas, sensitivity, and verbatim evidence." }
      ],
      actionLabel: "Next: 1-Solution Prioritization →"
    },
    {
      title: "The 1-Solution, Dual-Impact Framework",
      subtitle: "Safe SIP Sizer • Active Focus & Passive Shield",
      targetTab: "opportunities" as NavTab,
      badge: "Product Prioritization",
      badgeColor: "bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30",
      content:
        "Rather than spreading engineering thin across 10 disjointed features, we deploy ONE core solution: Safe SIP Sizer (Cash-Flow Calibration & Buffer Ringfencing).",
      highlights: [
        { label: "Track A (Direct)", text: "Directly prevents voluntary cancellations by sizing SIPs to real disposable surplus." },
        { label: "Track B (Passive)", text: "Passively eliminates ₹590 Autopay bounce penalties by ensuring account balance never runs dry." },
        { label: "Deliberately Out of Scope", text: "Regulatory constraints (SEBI T+1/T+2) and external bank downtimes are intentionally scoped out." }
      ],
      actionLabel: "Next: Quality & Benchmarks →"
    },
    {
      title: "Quality Benchmarks & System Integrity",
      subtitle: "Golden Test Sets & Human-in-the-Loop Evals",
      targetTab: "evals" as NavTab,
      badge: "Scientific Rigor",
      badgeColor: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
      content:
        "Evaluates the discovery engine against a 20-item Golden Benchmark hand-labeled by PM intuition, achieving 90% Stage Classification match and 95% Action match.",
      highlights: [
        { label: "Human PM Corrections", text: "Case studies showing where human PM intuition corrected subtle AI classification misattributions." },
        { label: "Zero Advice Policy", text: "Verified refusal tests against investment recommendations." }
      ],
      actionLabel: "Finish Tour & Explore Portal 🚀"
    }
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigateTab(steps[next].targetTab);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigateTab(steps[prev].targetTab);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem("has_seen_groww_tour", "true");
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C2028] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#282D3D] space-y-5">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#9EA0A8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></span>
            <span className="uppercase tracking-wider text-white font-bold">Guided Walkthrough</span>
          </div>
          <span className="text-[#00D09C] font-mono font-bold">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#232734] h-1.5 rounded-full overflow-hidden border border-[#282D3D]">
          <div
            className="bg-[#00D09C] h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.badgeColor} uppercase tracking-wide`}>
              {step.badge}
            </span>
            <span className="text-xs text-[#9EA0A8]">• {step.subtitle}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {step.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#C5C7D0] leading-relaxed">
            {step.content}
          </p>

          {/* Structured Highlights Box */}
          <div className="space-y-2 bg-[#232734] p-3.5 rounded-xl border border-[#282D3D] text-xs">
            {step.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#00D09C] font-bold shrink-0">▸</span>
                <div>
                  <strong className="text-white mr-1.5">{h.label}:</strong>
                  <span className="text-[#9EA0A8]">{h.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#282D3D]">
          <button
            onClick={handleComplete}
            className="text-xs font-semibold text-[#696C7C] hover:text-white transition-colors cursor-pointer"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 text-xs font-semibold text-gray-200 bg-[#232734] hover:bg-[#2A2F3E] border border-[#282D3D] rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-bold text-black bg-[#00D09C] hover:bg-[#00B386] rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>{step.actionLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
