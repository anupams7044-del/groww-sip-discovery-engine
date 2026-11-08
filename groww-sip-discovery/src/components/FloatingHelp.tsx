"use client";

import React, { useState } from "react";
import { colors } from "@/styles/tokens";

interface FloatingHelpProps {
  onStartTour: () => void;
  onNavigateTab: (tabId: string) => void;
}

export function FloatingHelp({ onStartTour, onNavigateTab }: FloatingHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help & Quick Start Guide"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#00D09C] hover:bg-[#00B386] text-black shadow-lg flex items-center justify-center font-black text-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#00D09C]/30 cursor-pointer"
      >
        {isOpen ? "✕" : "?"}
      </button>

      {/* Slide-over Help Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-[#1C2028] rounded-2xl shadow-2xl border border-[#282D3D] w-full sm:max-w-md p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#282D3D] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00D09C]/15 text-[#00D09C] text-xs font-bold flex items-center justify-center">
                  💡
                </span>
                <h3 className="text-base font-bold text-white">Groww Discovery Engine Help</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#9EA0A8] hover:text-white text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#9EA0A8] leading-relaxed">
              <p>
                Welcome to the <strong className="text-white">Groww 12-Month Active SIP Discovery Engine</strong>! This portal synthesizes 1,025 multi-app investor reviews to pinpoint why first-time SIP subscribers churn.
              </p>

              <div className="bg-[#232734] rounded-xl p-3 border border-[#282D3D] space-y-2">
                <p className="font-bold text-white text-xs">Recommended Actions:</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onStartTour();
                    }}
                    className="w-full text-left px-3 py-2 bg-[#1C2028] rounded-lg border border-[#282D3D] hover:border-[#00D09C] hover:bg-[#2A2F3E] text-xs font-semibold text-[#00D09C] flex items-center justify-between cursor-pointer"
                  >
                    <span>🎯 Launch Spotlight Onboarding Tour (3 Milestones)</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("ask");
                    }}
                    className="w-full text-left px-3 py-2 bg-[#1C2028] rounded-lg border border-[#282D3D] hover:border-[#00D09C] hover:bg-[#2A2F3E] text-xs font-semibold text-gray-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>💬 Ask the AI Engine (9 Starter Queries)</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("pipeline");
                    }}
                    className="w-full text-left px-3 py-2 bg-[#1C2028] rounded-lg border border-[#282D3D] hover:border-[#00D09C] hover:bg-[#2A2F3E] text-xs font-semibold text-gray-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>⚙️ See How Code vs AI Earns Its Place</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#FFB61B]/10 rounded-lg border border-[#FFB61B]/30 text-[#FFB61B] text-[11px]">
                <strong>Academic Prototype:</strong> NextLeap PM Fellowship graduation project. Not affiliated with Groww. Zero fund/stock recommendations.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#232734] hover:bg-[#2A2F3E] text-gray-200 border border-[#282D3D] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
