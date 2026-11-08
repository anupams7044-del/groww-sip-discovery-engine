"use client";

import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "@/components/Navbar";
import { SpotlightTour } from "@/components/SpotlightTour";
import { FloatingHelp } from "@/components/FloatingHelp";
import { OverviewView } from "@/components/views/OverviewView";
import { AskEngineView } from "@/components/views/AskEngineView";
import { MetricTreeView } from "@/components/views/MetricTreeView";
import { OpportunitiesView } from "@/components/views/OpportunitiesView";
import { SourcesView } from "@/components/views/SourcesView";
import { EvalsView } from "@/components/views/EvalsView";
import { PipelineView } from "@/components/views/PipelineView";
import { DisclaimerView } from "@/components/views/DisclaimerView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string>("");

  // Check if first-time visitor to automatically trigger tour
  useEffect(() => {
    try {
      const hasSeenTour = localStorage.getItem("has_seen_groww_tour");
      if (!hasSeenTour) {
        setIsTourOpen(true);
      }
    } catch {
      // LocalStorage access safe fallback
    }
  }, []);

  const handleTourClose = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem("has_seen_groww_tour", "true");
    } catch {}
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-[#00D09C]/30 selection:text-white">
      {/* Groww Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReplayTour={handleStartTour}
        onGlobalSearch={(query) => {
          setPendingQuery(query);
          setActiveTab("ask");
        }}
      />

      {/* Interactive Spotlight Onboarding & UX Nudge Tour */}
      <SpotlightTour
        isOpen={isTourOpen}
        onClose={handleTourClose}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "home" && (
          <OverviewView onNavigateTab={setActiveTab} />
        )}
        {activeTab === "ask" && (
          <AskEngineView
            initialQuery={pendingQuery}
            onQueryHandled={() => setPendingQuery("")}
          />
        )}
        {activeTab === "tree" && <MetricTreeView />}
        {activeTab === "opportunities" && <OpportunitiesView />}
        {activeTab === "sources" && <SourcesView />}
        {activeTab === "evals" && <EvalsView />}
        {activeTab === "pipeline" && <PipelineView />}
        {activeTab === "disclaimer" && <DisclaimerView />}
      </main>

      {/* Floating Help & Quick-Tour Trigger in Groww Mint */}
      <FloatingHelp
        onStartTour={handleStartTour}
        onNavigateTab={(tabId) => setActiveTab(tabId as NavTab)}
      />

      {/* Groww Styled Footer */}
      <footer className="bg-[#121212] border-t border-[#282D3D] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9EA0A8]">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <span className="font-semibold text-white flex items-center gap-2">
              <img src="/groww-logo.png" alt="Groww" className="w-5 h-5 object-contain inline-block" />
              Groww AI Discovery Engine
            </span>
            <span className="hidden sm:inline text-[#696C7C]">•</span>
            <span>NextLeap Product Management Fellowship Graduation Capstone</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <button
              onClick={() => setActiveTab("disclaimer")}
              className="text-[#9EA0A8] hover:text-[#00D09C] transition-colors underline cursor-pointer"
            >
              Academic Disclaimer &amp; SEBI Notice
            </button>
            <span className="text-[#696C7C]">•</span>
            <button
              onClick={() => setActiveTab("pipeline")}
              className="text-[#9EA0A8] hover:text-[#00D09C] transition-colors cursor-pointer"
            >
              Architecture (Code vs AI)
            </button>
            <span className="text-[#696C7C]">•</span>
            <button
              onClick={() => setActiveTab("evals")}
              className="text-[#9EA0A8] hover:text-[#00D09C] transition-colors cursor-pointer"
            >
              Eval Benchmarks
            </button>
            <span className="text-[#696C7C]">•</span>
            <a
              href="/EVIDENCE_LOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D09C] hover:underline cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>AI Evidence Log (.md)</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
