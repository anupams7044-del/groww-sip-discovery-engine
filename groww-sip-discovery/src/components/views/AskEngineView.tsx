"use client";

import React, { useState, useEffect } from "react";

interface Message {
  sender: "user" | "engine";
  text: string;
  supporting_quotes?: Array<{
    id: string;
    quote: string;
    url: string;
    source: string;
  }>;
  item_count_used?: number;
  sources_split?: Record<string, number>;
  confidence?: "High" | "Medium" | "Low";
  confidence_score?: number;
  insufficient_evidence?: boolean;
  refusal_type?: string;
  official_resources?: Array<{ name: string; url: string }>;
  follow_ups?: string[];
}

interface AskEngineViewProps {
  initialQuery?: string;
  onQueryHandled?: () => void;
}

export function AskEngineView({ initialQuery, onQueryHandled }: AskEngineViewProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const handledQueryRef = React.useRef<string | null>(null);

  const STARTER_QUESTIONS = [
    "Why do people start a SIP, and what do they expect to happen?",
    "What changes in their behaviour in the months after starting?",
    "What leads investors to pause, reduce or stop a SIP?",
    "What do investors check, and how often, once they have started?",
    "What confuses or worries them inside the app?",
    "What do they do outside the app when they feel unsure?",
    "What separates investors who continue from those who quietly drop off?",
    "How do these patterns differ across user segments (income stability, age)?",
    "What unmet needs emerge consistently across conversations?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || loading) return;

    const userMsg: Message = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          filters: {
            source: selectedSource !== "all" ? selectedSource : undefined,
            lifecycle_stage: selectedStage !== "all" ? selectedStage : undefined
          }
        })
      });

      const data = await res.json();

      const engineMsg: Message = {
        sender: "engine",
        text: data.answer || "No response generated.",
        supporting_quotes: data.supporting_quotes || [],
        item_count_used: data.item_count_used || 0,
        sources_split: data.sources_split,
        confidence: data.confidence || "Medium",
        confidence_score: data.confidence_score,
        insufficient_evidence: data.insufficient_evidence,
        refusal_type: data.refusal_type,
        official_resources: data.official_resources,
        follow_ups: data.follow_ups
      };

      setMessages((prev) => [...prev, engineMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "engine",
          text: `⚠️ Error retrieving insights: ${err.message}. Please try another question.`,
          confidence: "Low"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-execute query passed from the Groww Navbar search bar
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && handledQueryRef.current !== initialQuery.trim()) {
      handledQueryRef.current = initialQuery.trim();
      handleSend(initialQuery.trim());
      if (onQueryHandled) {
        onQueryHandled();
      }
    }
  }, [initialQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="bg-[#1C2028] rounded-2xl p-6 border border-[#282D3D] shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00D09C]">💬</span> Ask Groww Discovery Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#9EA0A8] mt-1">
              Query 1,025 verified user feedback items with exact quote citations &amp; SEBI regulatory guardrails.
            </p>
          </div>

          {/* Filters styled in Groww select inputs */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-[#232734] border border-[#282D3D] rounded-xl px-3 py-1.5 text-gray-200 focus:outline-hidden focus:border-[#00D09C] cursor-pointer"
            >
              <option value="all">All Sources (5)</option>
              <option value="playstore">Play Store</option>
              <option value="appstore">App Store</option>
              <option value="tradingqna">TradingQ&amp;A</option>
              <option value="youtube">YouTube</option>
              <option value="reddit">Reddit</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs bg-[#232734] border border-[#282D3D] rounded-xl px-3 py-1.5 text-gray-200 focus:outline-hidden focus:border-[#00D09C] cursor-pointer"
            >
              <option value="all">All Lifecycle Stages</option>
              <option value="setup">Setup &amp; KYC</option>
              <option value="payment_reliability">Payment Reliability</option>
              <option value="early_experience_m1_3">Early Experience (M1-M3)</option>
              <option value="voluntary_decision_m3_12">Retention (M3-M12)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Starter Questions (Shown initially) */}
      {messages.length === 0 && (
        <div className="bg-[#1C2028] rounded-2xl p-6 border border-[#282D3D] shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#00D09C] bg-[#00D09C]/10 border border-[#00D09C]/30 px-2.5 py-0.5 rounded-full uppercase">
              Fellowship Research Prompts
            </span>
            <span className="text-xs text-[#9EA0A8]">Click any question chip to generate evidence-backed insights:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {STARTER_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left p-3 rounded-xl border border-[#282D3D] bg-[#232734] hover:border-[#00D09C]/50 hover:bg-[#2A2F3E] text-xs text-gray-200 font-medium transition-all group flex items-start gap-2 cursor-pointer"
              >
                <span className="text-[#00D09C] font-bold shrink-0">#{idx + 1}</span>
                <span className="group-hover:text-white leading-relaxed">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {msg.sender === "user" ? (
              <div className="bg-[#00D09C] text-black font-bold rounded-2xl rounded-tr-xs px-4 py-3 max-w-xl text-sm shadow-md">
                {msg.text}
              </div>
            ) : (
              <div className="bg-[#1C2028] rounded-2xl rounded-tl-xs p-5 sm:p-6 max-w-2xl border border-[#282D3D] shadow-xl space-y-4">
                {/* Refusal / Caution Banner */}
                {msg.refusal_type && (
                  <div className="bg-[#ED5533]/10 border border-[#ED5533]/30 rounded-xl p-3 text-xs text-[#ED5533] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>🛡️</span> SEBI Regulatory Guardrail Intercepted
                    </div>
                    <p className="text-[11px] text-[#ED5533]/90 leading-relaxed">
                      Under SEBI (Investment Advisers) Regulations, 2013, this engine strictly refuses to give fund/stock recommendations.
                    </p>
                  </div>
                )}

                {/* Insufficient Evidence Warning */}
                {msg.insufficient_evidence && (
                  <div className="bg-[#5367FF]/10 border border-[#5367FF]/30 rounded-xl p-3 text-xs text-[#5367FF]">
                    ℹ️ Low Evidence Notice: Fewer than 3 direct discussions were found for this query. Answer is generalized from broader lifecycle patterns.
                  </div>
                )}

                {/* Main Response Text */}
                <div className="text-xs sm:text-sm text-gray-100 leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Supporting Verbatim Quotes */}
                {msg.supporting_quotes && msg.supporting_quotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#282D3D]">
                    <div className="text-[11px] font-bold text-[#9EA0A8] uppercase tracking-wider flex items-center justify-between">
                      <span>Verbatim User Quotes ({msg.supporting_quotes.length})</span>
                      <span className="text-[#00D09C] font-semibold">Exact Evidence Cited</span>
                    </div>

                    <div className="space-y-2">
                      {msg.supporting_quotes.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-[#232734] border border-[#282D3D] p-3 rounded-xl text-xs space-y-1.5 border-l-3 border-l-[#00D09C]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-[#1C2028] border border-[#282D3D] text-[#9EA0A8] font-semibold text-[10px] uppercase">
                              {q.source}
                            </span>
                            {q.url && (
                              <a
                                href={q.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#00D09C] hover:underline"
                              >
                                View Source ↗
                              </a>
                            )}
                          </div>
                          <p className="text-gray-200 italic">"{q.quote}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Pill Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#282D3D] text-[11px] text-[#9EA0A8]">
                  <div className="flex items-center gap-2">
                    <span>Confidence:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        msg.confidence === "High"
                          ? "bg-[#00D09C]/15 text-[#00D09C] border border-[#00D09C]/30"
                          : msg.confidence === "Medium"
                          ? "bg-[#FFB61B]/15 text-[#FFB61B] border border-[#FFB61B]/30"
                          : "bg-[#ED5533]/15 text-[#ED5533] border border-[#ED5533]/30"
                      }`}
                    >
                      {msg.confidence} ({Math.round((msg.confidence_score || 0.85) * 100)}%)
                    </span>
                  </div>

                  {msg.item_count_used ? (
                    <div>Based on {msg.item_count_used} retrieved reviews</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#9EA0A8] p-4 bg-[#1C2028] rounded-2xl border border-[#282D3D] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-ping"></span>
            <span>Retrieving quotes &amp; synthesizing discovery response with Gemini...</span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Input Dock (Opaque & Clean Like Gemini in Groww Palette) */}
      <div className="sticky bottom-0 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-6 pb-6 bg-[#121212] border-t border-[#282D3D] z-30 space-y-2 relative">
        {/* Subtle Top Gradient Fade Mask */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />

        <div className="bg-[#232734] border border-[#282D3D] focus-within:border-[#00D09C] rounded-2xl p-2 shadow-2xl flex items-center gap-2 transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about first-time SIP drop-offs, mandate friction, or returns shock..."
            className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#7C7E8C] focus:outline-hidden"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="bg-[#00D09C] hover:bg-[#00B386] disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-sm shrink-0"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        <div className="text-center text-[10px] text-[#696C7C] select-none">
          Discovery Engine answers strictly from 1,025 verified user reviews • SEBI non-advisory compliant
        </div>
      </div>
    </div>
  );
}
