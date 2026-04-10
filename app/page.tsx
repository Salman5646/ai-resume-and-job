"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const UploadZone = dynamic(() => import("@/components/UploadZone").then(mod => mod.UploadZone), { ssr: false });

import { ResultsView } from "@/components/ResultsView";
import { ExtractedInfo } from "@/lib/gemini";
import { JobMatch } from "@/components/JobCard";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SCAN_MESSAGES = [
  ["Deep Scanning Resume...", "AI Neural Processing"],
  ["Extracting Skills & Experience...", "Pattern Recognition Active"],
  ["Evaluating Career Trajectory...", "Insight Engine Running"],
  ["Scoring Professional Profile...", "Calibrating Algorithms"],
  ["Mapping Competency Vectors...", "Semantic Analysis"],
  ["Detecting Hidden Strengths...", "Deep Learning Model"],
  ["Building Your Career Report...", "Finalising Analysis"],
];

const MATCH_MESSAGES = [
  ["Optimizing Job Matches...", "Compatibility Engine"],
  ["Scanning 1,000+ Roles...", "Opportunity Mapping"],
  ["Ranking Best Fit Positions...", "Relevance Scoring"],
  ["Aligning Skills to Market...", "Market Intelligence"],
  ["Calculating Match Scores...", "Neural Matching"],
  ["Curating Top Opportunities...", "Results Ready Soon"],
];

function CyclingLoader({ phase }: { phase: "scan" | "match" }) {
  const pool = phase === "scan" ? SCAN_MESSAGES : MATCH_MESSAGES;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    const t = setInterval(() => setIdx(i => (i + 1) % pool.length), 2000);
    return () => clearInterval(t);
  }, [phase, pool.length]);

  const [headline, sub] = pool[idx];

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="relative">
        <Loader2 className="w-9 h-9 text-cyan-500 animate-spin" />
        <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20 animate-pulse" />
      </div>
      <div className="flex flex-col items-center text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={headline}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-white font-semibold text-sm"
          >
            {headline}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-cyan-400/60 text-[11px] mt-1 uppercase tracking-widest font-bold"
          >
            {sub}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ExtractedInfo | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);

  const handleTextExtracted = async (text: string, fileData?: { data: string; mimeType: string }) => {
    setIsProcessing(true);
    setError(null);

    try {
      // If we have no text AND no file data, then we throw
      if ((!text || text.trim().length === 0) && !fileData) {
        throw new Error("No text could be extracted and no file data available.");
      }

      // 1. Analyze Resume
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: text,
          fileData: fileData?.data,
          fileMimeType: fileData?.mimeType,
          apiKey
        }),
      });

      const data = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      const extractedInfo: ExtractedInfo = data;
      setAnalysisData(extractedInfo); // Show analysis results immediately

      // 2. Match Jobs
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedInfo, apiKey }),
      });

      const matchData = await matchRes.json();

      if (!matchRes.ok) {
        throw new Error(matchData.error || "Failed to match jobs");
      }

      const matches: JobMatch[] = matchData;
      setJobMatches(matches);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setJobMatches([]);
    setError(null);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">

      <AnimatePresence mode="wait">
        {!analysisData ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
          >
            <div className="text-center mb-12 max-w-2xl">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
              >
                <Sparkles className="w-3 h-3" />
                AI-Powered Career Matching
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 tracking-tight leading-tight">
                Unlock Your <br />
                <span className="gradient-text">Career Potential</span>
              </h1>
              <p className="text-white/60 text-lg md:text-xl leading-relaxed">
                Upload your resume and let our advanced AI analyze your skills,
                score your candidacy, and recommend your next dream role in seconds.
              </p>
            </div>

            <UploadZone onTextExtracted={handleTextExtracted} isProcessing={isProcessing} />

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 max-w-md"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {isProcessing && (
              <CyclingLoader phase={!analysisData ? "scan" : "match"} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <ResultsView data={analysisData} matches={jobMatches} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full py-12 text-center border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/20 text-xs uppercase tracking-[0.2em]">
            &copy; 2026 AINN SLA &bull; Advanced AI Resume Intelligence
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-cyan-500/50">Powered by Gemini 2.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
