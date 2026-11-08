"use client";

import React from "react";

export function DisclaimerView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1C2028] rounded-2xl p-6 sm:p-8 border border-[#282D3D] shadow-xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#FFB61B]/15 text-[#FFB61B] border border-[#FFB61B]/30">
            Mandatory Regulatory &amp; Academic Notice
          </span>
          <span className="text-xs text-[#9EA0A8]">SEBI / AMFI Compliance Framework</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          Disclaimer, Compliance &amp; Governance
        </h1>
        <p className="text-sm text-[#9EA0A8] leading-relaxed">
          This system is strictly an academic discovery and product research prototype created for the NextLeap Product Manager Fellowship graduation project.
        </p>
      </div>

      {/* Primary Caution Card */}
      <div className="p-6 rounded-2xl border border-[#FFB61B]/40 bg-[#FFB61B]/10 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#FFB61B] text-black flex items-center justify-center text-xs font-bold">
            !
          </span>
          <h2 className="text-base font-bold text-[#FFB61B]">
            Independent Student Research Project — Not Financial Advice
          </h2>
        </div>
        <p className="text-xs text-[#FFF5E0]/90 leading-relaxed">
          This platform is an independent student capstone project developed solely for academic and product research purposes under the NextLeap Product Manager Fellowship. It is <strong className="text-white">NOT</strong> affiliated with, endorsed by, or operated in partnership with <strong className="text-white">Nextbillion Technology Private Limited (Groww)</strong>, any mutual fund asset management company (AMC), or any commercial financial entity.
        </p>
        <p className="text-xs text-[#FFF5E0]/90 leading-relaxed">
          Nothing contained within this engine, its analytical visualizations, or the Ask-the-Engine AI interface constitutes financial advice, investment recommendations, securities promotion, or a solicitation to buy or sell mutual funds or securities. Mutual fund investments are subject to market risks; please read all scheme-related documents carefully before investing.
        </p>
      </div>

      {/* Regulatory Guardrails Summary */}
      <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#9EA0A8] uppercase tracking-wider">
          Engine Guardrails &amp; Non-Negotiables
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#232734] rounded-xl border border-[#282D3D] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ED5533]"></span>
              Prohibition on Fund &amp; Stock Advice
            </h4>
            <p className="text-gray-200 leading-relaxed">
              Under SEBI (Investment Advisers) Regulations, 2013, providing personalized fund recommendations or stock picks requires formal RIA registration. This discovery engine strictly refuses queries seeking recommendations and provides educational discovery insights only.
            </p>
          </div>

          <div className="p-4 bg-[#232734] rounded-xl border border-[#282D3D] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ED5533]"></span>
              Ban on Fear &amp; Urgency Nudges (FOMO)
            </h4>
            <p className="text-gray-200 leading-relaxed">
              Per SEBI and ASCI advertising standards, deceptive patterns such as countdown timers, panic-inducing loss alerts, or urgency-driven investment nudges are strictly forbidden in all proposed solution themes.
            </p>
          </div>

          <div className="p-4 bg-[#232734] rounded-xl border border-[#282D3D] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D09C]"></span>
              Public Data Only &amp; Privacy Protection
            </h4>
            <p className="text-gray-200 leading-relaxed">
              All 1,025 user review records were ingested strictly from publicly available sources (Google Play Store, Apple App Store, Reddit, YouTube comments, and Discourse forums). Personally identifiable information (phone numbers, account IDs, emails) was redacted.
            </p>
          </div>

          <div className="p-4 bg-[#232734] rounded-xl border border-[#282D3D] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D09C]"></span>
              Verbatim Evidence Traceability
            </h4>
            <p className="text-gray-200 leading-relaxed">
              Every single problem theme, chart point, and AI-generated answer is programmatically linked back to authentic, verbatim quotes with source URLs or app identifiers to prevent synthetic or hallucinated claims.
            </p>
          </div>
        </div>
      </div>

      {/* Official Industry & Regulatory Links */}
      <div className="bg-[#1C2028] rounded-2xl border border-[#282D3D] shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Official Regulatory &amp; Industry Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <a
            href="https://www.sebi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-[#282D3D] bg-[#232734] hover:border-[#00D09C] hover:bg-[#2A2F3E] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#00D09C]">Securities and Exchange Board of India (SEBI)</p>
              <p className="text-[#9EA0A8] text-[11px]">Official regulator of securities &amp; mutual funds</p>
            </div>
            <span className="text-[#9EA0A8] group-hover:text-[#00D09C]">↗</span>
          </a>

          <a
            href="https://www.amfiindia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-[#282D3D] bg-[#232734] hover:border-[#00D09C] hover:bg-[#2A2F3E] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#00D09C]">Association of Mutual Funds in India (AMFI)</p>
              <p className="text-[#9EA0A8] text-[11px]">Mutual Funds Sahi Hai &amp; Investor Education</p>
            </div>
            <span className="text-[#9EA0A8] group-hover:text-[#00D09C]">↗</span>
          </a>

          <a
            href="https://www.npci.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-[#282D3D] bg-[#232734] hover:border-[#00D09C] hover:bg-[#2A2F3E] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#00D09C]">National Payments Corporation of India (NPCI)</p>
              <p className="text-[#9EA0A8] text-[11px]">eNACH, UPI Autopay &amp; Mandate Guidelines</p>
            </div>
            <span className="text-[#9EA0A8] group-hover:text-[#00D09C]">↗</span>
          </a>

          <a
            href="https://groww.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-[#282D3D] bg-[#232734] hover:border-[#00D09C] hover:bg-[#2A2F3E] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#00D09C]">Groww Official Website</p>
              <p className="text-[#9EA0A8] text-[11px]">Nextbillion Technology Private Limited</p>
            </div>
            <span className="text-[#9EA0A8] group-hover:text-[#00D09C]">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
