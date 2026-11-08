"use client";

import React, { useState } from "react";

export type NavTab =
  | "home"
  | "ask"
  | "tree"
  | "opportunities"
  | "sources"
  | "evals"
  | "pipeline"
  | "disclaimer";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onReplayTour: () => void;
  onGlobalSearch?: (query: string) => void;
}

export function Navbar({ activeTab, setActiveTab, onReplayTour, onGlobalSearch }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  const tabs: Array<{ id: NavTab; label: string }> = [
    { id: "home", label: "Overview" },
    { id: "ask", label: "Ask Engine" },
    { id: "tree", label: "Metric Tree" },
    { id: "opportunities", label: "Opportunities" },
    { id: "sources", label: "Data Sources" },
    { id: "evals", label: "Quality & Evals" },
    { id: "pipeline", label: "How it Works" },
    { id: "disclaimer", label: "Disclaimer" }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearch.trim();
    if (q) {
      if (onGlobalSearch) {
        onGlobalSearch(q);
      } else {
        setActiveTab("ask");
      }
      setHeaderSearch("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#282D3D] select-none">
      {/* Groww Top Regulatory Banner */}
      <div className="bg-[#0D241C] border-b border-[#143B2E] px-4 py-1 text-center text-xs text-[#00D09C] font-medium flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] animate-pulse"></span>
        <span className="tracking-wide">
          NextLeap Product Management Fellowship • Groww 12-Month Active SIP Discovery Engine • Academic Project
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Left: Official Groww Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1C2028] border border-[#282D3D] p-1.5 flex items-center justify-center shadow-sm">
              <img
                src="/groww-logo.png"
                alt="Groww"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">Groww</span>
                <span className="text-[10px] font-semibold bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30 px-1.5 py-0.5 rounded">
                  AI Discovery
                </span>
              </div>
              <span className="text-[11px] text-[#9EA0A8] font-normal leading-tight">
                12-Month SIP Retention Engine
              </span>
            </div>
          </div>

          {/* Center: Groww-Style Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C7E8C]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="What causes first-time SIP churn? Search 1,025 reviews..."
                className="w-full bg-[#1C2028] hover:bg-[#232734] focus:bg-[#232734] border border-[#282D3D] focus:border-[#00D09C] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#7C7E8C] transition-colors focus:outline-hidden"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-2.5 bg-[#282D3D] hover:bg-[#32384A] text-gray-300 rounded-lg text-[10px] font-semibold flex items-center"
              >
                Ask AI
              </button>
            </div>
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onReplayTour}
              className="bg-[#00D09C] hover:bg-[#00B386] text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>🧭</span> Guided Tour
            </button>

            {/* NextLeap Fellow Avatar Tag */}
            <div className="hidden sm:flex items-center gap-2 bg-[#1C2028] border border-[#282D3D] rounded-lg px-2.5 py-1.5 text-xs">
              <span className="w-5 h-5 rounded-full bg-[#5367FF] text-white text-[10px] font-bold flex items-center justify-center">
                NL
              </span>
              <span className="text-gray-300 text-[11px] font-medium">Fellow Capstone</span>
            </div>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-[#9EA0A8] hover:text-white hover:bg-[#1C2028]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Groww Signature Tab Bar with Active Mint Underline */}
        <nav className="hidden xl:flex items-center space-x-1 border-t border-[#1E222D]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 px-4 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-white font-bold"
                    : "text-[#9EA0A8] hover:text-white"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00D09C] rounded-t-full shadow-[0_-2px_8px_rgba(0,208,156,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#282D3D] bg-[#121212] px-4 py-3 space-y-2">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pb-2">
            <div className="relative w-full">
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search 1,025 reviews or ask a question..."
                className="w-full bg-[#1C2028] border border-[#282D3D] focus:border-[#00D09C] rounded-xl pl-3 pr-20 py-2 text-xs text-white placeholder-[#7C7E8C] focus:outline-hidden"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-3 bg-[#00D09C] hover:bg-[#00B386] text-black font-bold rounded-lg text-[11px] flex items-center"
              >
                Ask AI
              </button>
            </div>
          </form>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                  isActive
                    ? "bg-[#00D09C]/15 text-[#00D09C] font-bold"
                    : "text-[#9EA0A8] hover:bg-[#1C2028] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C]"></span>}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
