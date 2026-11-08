"use client";

import React, { useState } from "react";

export function SourcesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");

  const sourcesStats = [
    { source: "Google Play Store", raw: 748, clean: 697, dropped: 51, share: "68.0%", date: "Sep 2018 – Oct 2026", details: "Scraped across 12 Indian investing apps" },
    { source: "TradingQ&A Forum", raw: 293, clean: 281, dropped: 12, share: "27.4%", date: "Jul 2014 – Oct 2026", details: "Discourse API topics & replies on SIP discussions" },
    { source: "YouTube Comments", raw: 25, clean: 25, dropped: 0, share: "2.4%", date: "Mar 2024 – Aug 2025", details: "Top personal finance creators (Warikoo, LLA, Pranjal)" },
    { source: "Reddit Communities", raw: 12, clean: 12, dropped: 0, share: "1.2%", date: "Apr 2024 – Mar 2025", details: "r/IndiaInvestments, r/mutualfunds, r/groww" },
    { source: "Apple App Store", raw: 10, clean: 10, dropped: 0, share: "1.0%", date: "Jul 2025 – Aug 2026", details: "Public customer reviews RSS JSON feed" }
  ];

  const sampleRawItems = [
    { id: "playstore_Groww_4b9a15df", source: "playstore", author: "PlayStoreUser", date: "2024-10-18", text: "My bank account has been blocked due to an unexpected transaction from Groww. As a result, my EMI and SIP payments cannot be processed, and I may not receive my salary." },
    { id: "playstore_Groww_31c6fa41", source: "playstore", author: "PlayStoreUser", date: "2024-09-12", text: "NEVER USE GROWW! Withdrawal money never credited. My first experience was terrible. I invested in an emergency liquid mutual fund, but when I placed my first withdrawal order, Groww executed it without generating a UTR." },
    { id: "reddit_groww_mandate_bounce", source: "reddit", author: "techie_investor", date: "2024-05-03", text: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge on my account! Cancelled all 4 active SIPs immediately." },
    { id: "youtube_amit_sharma_tech", source: "youtube", author: "amit_sharma_tech", date: "2024-04-02", text: "My SIP date was 5th every month. Salary gets credited on 7th. Autopay failed twice and HDFC bank charged me Rs 590 bounce fee each time! Cancelled the SIP in frustration." },
    { id: "appstore_https___apps_apple_com_review_seed_3", source: "appstore", author: "Arjun_K", date: "2025-08-20", text: "Mandate registration takes too long: I registered my autopay mandate 2 weeks ago and it is still showing pending. Because of this my SIP payment was missed this month." }
  ];

  const filteredItems = sampleRawItems.filter((i) => {
    const matchesSource = selectedSource === "all" || i.source === selectedSource;
    const matchesSearch = !searchTerm || i.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-3">
        <div className="inline-block text-xs font-bold text-[#00D09C] bg-[#00D09C]/10 border border-[#00D09C]/30 px-3 py-1 rounded-full uppercase">
          Part 1 • Data Provenance &amp; Funnel
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
          Data Collection Sources &amp; Cleaning Funnel
        </h1>
        <p className="text-sm text-[#9EA0A8] max-w-3xl leading-relaxed">
          Transparent accounting of where user feedback was gathered, how it was filtered, and the quality funnel applied before AI analysis.
        </p>
      </div>

      {/* 3-Step Cleaning Funnel Graphic */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm">3-Step Quality Cleaning Funnel</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#232734] border border-[#282D3D] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-[#9EA0A8] uppercase">Step 1: Deduplication</div>
            <div className="text-2xl font-black text-white">1,088 → 1,088</div>
            <p className="text-xs text-[#9EA0A8]">
              Normalized text hash and 80-character prefix matching across overlapping source pulls.
            </p>
            <div className="text-[11px] font-semibold text-[#00D09C]">0 duplicate items dropped</div>
          </div>

          <div className="bg-[#232734] border border-[#282D3D] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-[#9EA0A8] uppercase">Step 2: Length &amp; Pure Noise</div>
            <div className="text-2xl font-black text-white">1,088 → 1,037</div>
            <p className="text-xs text-[#9EA0A8]">
              Removed reviews with &lt; 8 words or generic phrases with zero explanatory detail (e.g., "good app", "5 stars").
            </p>
            <div className="text-[11px] font-semibold text-[#FFB61B]">51 unhelpful reviews dropped</div>
          </div>

          <div className="bg-[#232734] border border-[#00D09C]/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-[#00D09C] uppercase">Step 3: False-Match Filter</div>
            <div className="text-2xl font-black text-[#00D09C]">1,037 → 1,025</div>
            <p className="text-xs text-[#9EA0A8]">
              Filtered out non-financial or off-topic posts (e.g. unlisted private equity, Hindenburg/Adani stock news).
            </p>
            <div className="text-[11px] font-semibold text-[#00D09C]">1,025 verified clean items (94.2% retained)</div>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#282D3D] flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Volume Breakdown by Platform</h3>
          <span className="text-xs text-[#9EA0A8]">Total Clean: 1,025 items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#232734] text-[#9EA0A8] font-semibold border-b border-[#282D3D]">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-3 text-right">Raw Pull</th>
                <th className="py-3 px-3 text-right">Clean Retained</th>
                <th className="py-3 px-3 text-right">Share %</th>
                <th className="py-3 px-4">Coverage Window</th>
                <th className="py-3 px-4">Methodology Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282D3D]">
              {sourcesStats.map((src, i) => (
                <tr key={i} className="hover:bg-[#232734]/60 text-gray-200">
                  <td className="py-3.5 px-4 font-bold text-white">{src.source}</td>
                  <td className="py-3.5 px-3 text-right text-[#9EA0A8]">{src.raw}</td>
                  <td className="py-3.5 px-3 text-right font-black text-[#00D09C]">{src.clean}</td>
                  <td className="py-3.5 px-3 text-right font-semibold text-gray-200">{src.share}</td>
                  <td className="py-3.5 px-4 text-[#9EA0A8]">{src.date}</td>
                  <td className="py-3.5 px-4 text-[#9EA0A8]">{src.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Item Explorer */}
      <div className="bg-[#1C2028] rounded-2xl p-6 border border-[#282D3D] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm">Raw Feedback Item Explorer</h3>
            <p className="text-xs text-[#9EA0A8]">Sample verified items before AI tagging</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by keyword (e.g. bounce, panic)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-[#232734] border border-[#282D3D] text-white placeholder-[#7C7E8C] rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#00D09C]"
            />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-[#232734] border border-[#282D3D] text-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#00D09C]"
            >
              <option value="all">All Sources</option>
              <option value="playstore">Play Store</option>
              <option value="appstore">App Store</option>
              <option value="youtube">YouTube</option>
              <option value="reddit">Reddit</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[#232734] border border-[#282D3D] text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#696C7C] text-[11px]">
                <span className="font-mono">{item.id}</span>
                <span className="font-semibold text-[#00D09C] capitalize">Source: {item.source} • {item.date}</span>
              </div>
              <p className="text-gray-200 leading-relaxed italic">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
