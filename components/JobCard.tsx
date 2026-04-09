"use client";

import React from "react";
import { Briefcase, ChevronRight, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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
}

interface JobCardProps {
  job: JobMatch;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  return (
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
          <div className="text-2xl font-bold text-cyan-400">{job.matchPercentage}%</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest text-right">Match</div>
        </div>
      </div>

      <p className="text-white/60 text-sm italic">
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

      <button className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-all group/btn border border-white/5">
        View Role Details
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
