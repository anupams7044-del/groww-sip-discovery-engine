"use client";

import React, { useState, useEffect } from "react";
import { NavTab } from "./Navbar";

export interface TourGuideStep {
  id: string;
  milestoneNum: number;
  totalMilestones: number;
  tabId: NavTab;
  targetElementId: string;
  badge: string;
  title: string;
  shortNote: string;
  takeaway: string;
}

const TOUR_STEPS: TourGuideStep[] = [
  {
    id: "step-1",
    milestoneNum: 1,
    totalMilestones: 3,
    tabId: "home",
    targetElementId: "tour-dual-lens",
    badge: "1. Core Discovery",
    title: "The Dual-Lens Churn Reality",
    shortNote: "Separates upstream behavioral overcommitment from downstream bank bounce penalties.",
    takeaway: "Behavioral root causes drive ~72% of retention gain; operational shields drive ~28%."
  },
  {
    id: "step-2",
    milestoneNum: 2,
    totalMilestones: 3,
    tabId: "tree",
    targetElementId: "tour-root-node",
    badge: "2. Metric Funnel",
    title: "12-Month Retention KPI Tree",
    shortNote: "Decomposes 12-month active retention (28.0% → 45.4%) into 4 sequential journey stages.",
    takeaway: "Click any node in the tree to view its formula, sensitivity, and real user evidence."
  },
  {
    id: "step-3",
    milestoneNum: 3,
    totalMilestones: 3,
    tabId: "opportunities",
    targetElementId: "tour-single-solution-banner",
    badge: "3. Product Scope",
    title: "1-Solution, Dual-Impact Scope",
    shortNote: "Safe SIP Sizer directly fixes cash-flow deficits and passively eliminates bank bounce fees.",
    takeaway: "Proves high PM prioritization: zero extra banking code needed to stop ECS penalties."
  }
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export function SpotlightTour({ isOpen, onClose, onNavigateTab }: SpotlightTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  // Navigate and scroll to the target element without blocking it
  useEffect(() => {
    if (!isOpen || !step) return;

    onNavigateTab(step.tabId);

    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetElementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Flash a subtle outline on the target card to draw the eye
        el.classList.add("ring-2", "ring-[#00D09C]", "ring-offset-4", "ring-offset-[#121212]");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-[#00D09C]", "ring-offset-4", "ring-offset-[#121212]");
        }, 2200);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, step, onNavigateTab]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem("has_seen_groww_tour", "true");
    } catch {}
    onClose();
  };

  return (
    /* Pinned floating guide pill at bottom-right - ZERO dark overlays, ZERO screen blocking */
    <aside 
      aria-label="Interactive Fellowship Tour Guide"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] bg-[#1C2028]/95 backdrop-blur-md border border-[#00D09C] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-4 sm:p-5 space-y-3 animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Top row: step progress & close button */}
      <div className="flex items-center justify-between border-b border-[#282D3D] pb-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#00D09C]">
          <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></span>
          <span>{step.badge}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9EA0A8] font-mono">
            {step.milestoneNum} of {step.totalMilestones}
          </span>
          <button
            onClick={handleComplete}
            aria-label="Close tour"
            className="text-[#9EA0A8] hover:text-white p-1 rounded-md hover:bg-[#232734] transition-colors cursor-pointer text-sm font-bold leading-none ml-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Title & Short 1-2 line Note */}
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-white leading-tight">
          {step.title}
        </h4>
        <p className="text-xs text-[#C5C7D0] leading-snug">
          {step.shortNote}
        </p>
      </div>

      {/* Mini PM takeaway callout */}
      <div className="bg-[#232734] border border-[#282D3D] rounded-lg p-2.5 text-[11px] text-gray-300 leading-snug">
        <strong className="text-[#00D09C] block text-[10px] uppercase tracking-wider mb-0.5">
          Key Takeaway:
        </strong>
        {step.takeaway}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleComplete}
          className="text-[11px] text-[#696C7C] hover:text-[#9EA0A8] transition-colors cursor-pointer"
        >
          Dismiss
        </button>

        <div className="flex items-center gap-1.5">
          {currentStepIndex > 0 && (
            <button
              onClick={handleBack}
              className="px-2.5 py-1 text-xs font-semibold text-gray-300 bg-[#232734] hover:bg-[#2A2F3E] rounded-md border border-[#282D3D] transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-3.5 py-1 text-xs font-bold text-black bg-[#00D09C] hover:bg-[#00B386] rounded-md transition-colors shadow-sm cursor-pointer"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? "Got it! 🚀" : "Next →"}
          </button>
        </div>
      </div>
    </aside>
  );
}
