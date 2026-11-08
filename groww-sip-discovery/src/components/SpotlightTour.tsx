"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavTab } from "./Navbar";

export interface SpotlightStep {
  id: string;
  milestoneNum: number;
  totalMilestones: number;
  milestoneBadge: string;
  targetTab: NavTab;
  targetElementId: string;
  title: string;
  subtitle: string;
  description: string;
  keyTakeaway: string;
  badgeColor: string;
}

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: "step-dual-lens",
    milestoneNum: 1,
    totalMilestones: 3,
    milestoneBadge: "Milestone 1 • Discovery Synthesis",
    targetTab: "home",
    targetElementId: "tour-dual-lens",
    title: "The Dual-Lens Churn Reality: Behavioral vs. Operational",
    subtitle: "Root Disease vs. Observable Breaking Point",
    badgeColor: "bg-[#5367FF]/15 text-[#5367FF] border-[#5367FF]/30",
    description:
      "Decomposing 1,025 public investor complaints reveals two interconnected dimensions: an upstream behavioral vulnerability (uncalibrated commitments & zero emergency buffer) that triggers downstream operational payment disasters.",
    keyTakeaway:
      "Behavioral Root Cause (Left, ~72% of retention gain) vs. Operational Shield (Right, ~28% of retention gain)."
  },
  {
    id: "step-metric-tree",
    milestoneNum: 2,
    totalMilestones: 3,
    milestoneBadge: "Milestone 2 • Mathematical Funnel",
    targetTab: "tree",
    targetElementId: "tour-root-node",
    title: "12-Month Active SIP Retention KPI Tree",
    subtitle: "Root North Star Node → 4 Stages → 12 Sub-Drivers",
    badgeColor: "bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30",
    description:
      "Mathematically decomposes the North Star metric (28.0% baseline → 45.4% target) into 4 sequential journey stages. Each stage expands into 3 measurable driver leaf nodes with KPI formulas and authentic scraped quotes.",
    keyTakeaway:
      "Click any node in the tree to slide open the deep-dive inspector drawer with exact mathematical sensitivity and user quotes."
  },
  {
    id: "step-opportunities",
    milestoneNum: 3,
    totalMilestones: 3,
    milestoneBadge: "Milestone 3 • PM Prioritization",
    targetTab: "opportunities",
    targetElementId: "tour-single-solution-banner",
    title: "The 1-Solution, Dual-Impact Framework",
    subtitle: "Safe SIP Sizer • Active Focus & Passive Shield",
    badgeColor: "bg-[#FFB61B]/15 text-[#FFB61B] border-[#FFB61B]/30",
    description:
      "Instead of building 10 disjointed features or rewriting bank gateways, we deploy ONE core solution: Safe SIP Sizer. It directly solves Track A (cash-flow buffer) and passively eliminates Track B (bank bounce penalties), while intentionally scoping out uncontrollable external noise.",
    keyTakeaway:
      "Direct Active Focus (Safe SIP Sizer) + Passive Operational Shield + Deliberately Out of Scope (SEBI T+1/T+2 & Bank Host Outages)."
  }
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  initialStepIndex?: number;
}

export function SpotlightTour({
  isOpen,
  onClose,
  onNavigateTab,
  initialStepIndex = 0
}: SpotlightTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = SPOTLIGHT_STEPS[currentStepIndex];

  // Measure and align target element spotlight position
  const updateSpotlightPosition = useCallback(() => {
    if (!step) return;
    const el = document.getElementById(step.targetElementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Ensure element actually has layout width and height
      if (rect.width > 50 && rect.height > 50) {
        setTargetRect(rect);
        setIsReady(true);
        return;
      }
    }
    setTargetRect(null);
    setIsReady(false);
  }, [step]);

  // Synchronize tab switch and scroll to target element
  useEffect(() => {
    if (!isOpen || !step) return;

    setIsReady(false);
    onNavigateTab(step.targetTab);

    // Give Next.js DOM enough time to mount the view and calculate real bounds
    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetElementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          updateSpotlightPosition();
        }, 300);
      } else {
        updateSpotlightPosition();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, step, onNavigateTab, updateSpotlightPosition]);

  // Re-measure on window resize and scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      updateSpotlightPosition();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, updateSpotlightPosition]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < SPOTLIGHT_STEPS.length - 1) {
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
      localStorage.setItem("has_seen_spotlight_tour", "true");
      localStorage.setItem("has_seen_groww_tour", "true");
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* 1. Backdrop Overlay */}
      <div 
        onClick={handleComplete}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* 2. Spotlight Cutout & Glowing Halo around Target Element (strictly when element is ready) */}
      {targetRect && isReady && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.78), 0 0 32px rgba(0, 208, 156, 0.5)",
            borderRadius: "16px",
            border: "2px solid #00D09C",
            pointerEvents: "none",
            zIndex: 55,
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Animated Pulsing Beacon Pin at Top-Left */}
          <div className="absolute -top-3.5 -left-3.5 flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-[#00D09C]/40 animate-ping absolute"></span>
            <span className="w-6 h-6 rounded-full bg-[#00D09C] text-black font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-[#121212] z-10">
              {step.milestoneNum}
            </span>
          </div>

          {/* Pulse Ripple Pill Label */}
          <div className="absolute -bottom-3.5 right-4 bg-[#1C2028] border border-[#00D09C]/60 text-[#00D09C] px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md tracking-wider uppercase">
            Focus Area
          </div>
        </div>
      )}

      {/* 3. High-Contrast Spotlight Popover Card (Centered Modal for optimal readability) */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={popoverRef}
          className="bg-[#1C2028] border-2 border-[#00D09C] rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
        >
          {/* Milestone Indicator & Step Progress */}
          <div className="flex items-center justify-between gap-2 border-b border-[#282D3D] pb-3">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${step.badgeColor} uppercase tracking-wide`}>
                {step.milestoneBadge}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#00D09C] font-bold">
                {step.milestoneNum} / {step.totalMilestones}
              </span>
              <span className="text-[#696C7C]">Milestones</span>
            </div>
          </div>

          {/* Milestone Progress Bar */}
          <div className="w-full bg-[#232734] h-1.5 rounded-full overflow-hidden border border-[#282D3D]">
            <div
              className="bg-[#00D09C] h-full transition-all duration-300"
              style={{ width: `${(step.milestoneNum / step.totalMilestones) * 100}%` }}
            />
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-[#9EA0A8] font-semibold">{step.subtitle}</div>
            <h3 className="text-lg font-extrabold text-white leading-snug tracking-tight">
              {step.title}
            </h3>
            <p className="text-xs text-[#C5C7D0] leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Key Takeaway Callout Box */}
          <div className="bg-[#232734] border border-[#282D3D] rounded-xl p-3.5 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#00D09C] font-bold text-[11px] uppercase tracking-wide">
              <span>💡</span> Key PM Takeaway:
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {step.keyTakeaway}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-[#282D3D]">
            <button
              onClick={handleComplete}
              className="text-xs text-[#9EA0A8] hover:text-white transition-colors cursor-pointer font-medium"
            >
              Skip Onboarding
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-200 bg-[#232734] hover:bg-[#2A2F3E] border border-[#282D3D] rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold text-black bg-[#00D09C] hover:bg-[#00B386] rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>{currentStepIndex === SPOTLIGHT_STEPS.length - 1 ? "Complete Tour 🚀" : "Next Milestone →"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
