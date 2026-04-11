"use client";

import React, { useState } from "react";
import {
  Briefcase, ChevronRight, Check, AlertCircle, X,
  BrainCircuit, Lightbulb, Target, ListChecks, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface JobMatch {
  id: string;
  title: string;
  category: string;
  description: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
  recommendation?: string;
  nnScore?: number | null;
  nnRankScore?: number;
  scoringMethod?: string;
  requiredSkills?: string[];
}

interface JobCardProps {
  job: JobMatch;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const [open, setOpen] = useState(false);

  const pct = job.matchPercentage ?? 0;
  const scoreColor =
    pct >= 75 ? "text-emerald-400" :
      pct >= 50 ? "text-cyan-400" :
        pct >= 30 ? "text-yellow-400" : "text-red-400";

  const barColor =
    pct >= 75 ? "bg-emerald-500" :
      pct >= 50 ? "bg-cyan-500" :
        pct >= 30 ? "bg-yellow-500" : "bg-red-500";

  return (
    <>
      {/* ── Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card p-6 flex flex-col gap-4 group"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-white/40 text-sm">{job.category}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${scoreColor}`}>{pct}%</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest text-right">Match</div>
          </div>
        </div>

        {/* Match bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
            className={`h-full ${barColor} rounded-full`}
          />
        </div>

        <p className="text-white/60 text-sm italic line-clamp-2">
          "{job.reasoning}"
        </p>

        {job.recommendation && (
          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[12px] text-cyan-300">
            <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Tip to match:</span>
            {job.recommendation}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-auto">
          {job.matchedSkills.slice(0, 4).map((skill, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[11px]">
              <Check className="w-3 h-3" />
              {skill}
            </span>
          ))}
          {job.missingSkills.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-[11px]">
              <AlertCircle className="w-3 h-3" />
              {job.missingSkills.length} missing
            </span>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-white/80 hover:text-cyan-300 text-sm font-medium transition-all group/btn border border-white/5"
        >
          View Role Details
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* ── Modal Drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Centered Modal */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] z-50 overflow-hidden flex flex-col rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(15,15,30,0.98) 0%, rgba(30,15,50,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              <div className="overflow-y-auto w-full custom-scrollbar">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6"
                style={{ background: "inherit", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{job.title}</h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest">{job.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-8 py-6 space-y-8">

                {/* Match Score */}
                <div className="flex items-center justify-between p-5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">AI Match Score</p>
                    <div className={`text-5xl font-bold ${scoreColor}`}>{pct}%</div>
                    {job.nnScore != null && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <BrainCircuit className="w-3 h-3 text-purple-400" />
                        <span className="text-[11px] text-purple-300 font-bold uppercase tracking-wider">
                          NN Score: {(job.nnScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={pct >= 75 ? "#10b981" : pct >= 50 ? "#06b6d4" : pct >= 30 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${pct} 100`}
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${pct} 100` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Role Overview</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{job.description}</p>
                </div>

                {/* AI Reasoning */}
                <div className="p-4 rounded-xl"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-xs uppercase tracking-widest font-bold text-purple-400">AI Analysis</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed italic">"{job.reasoning}"</p>
                </div>

                {/* Matched Skills */}
                {job.matchedSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                        Matched Skills ({job.matchedSkills.length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.matchedSkills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[12px] font-medium border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {job.missingSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                        Skills to Develop ({job.missingSkills.length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-300 text-[12px] font-medium border border-yellow-500/20">
                          <AlertCircle className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills (full list from catalog) */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">All Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, i) => {
                        const matched = job.matchedSkills.some(
                          m => m.toLowerCase() === skill.toLowerCase()
                        );
                        return (
                          <span key={i} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border ${matched
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : "bg-white/5 text-white/40 border-white/10"
                            }`}>
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {job.recommendation && (
                  <div className="p-4 rounded-xl"
                    style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs uppercase tracking-widest font-bold text-cyan-400">Top Recommendation</span>
                    </div>
                    <p className="text-cyan-200 text-sm leading-relaxed">{job.recommendation}</p>
                  </div>
                )}

                {/* Close CTA */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
