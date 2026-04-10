"use client";

import React from "react";
import { User, Mail, Phone, GraduationCap, Briefcase, Sparkles, Wand2, Loader2 } from "lucide-react";
import { CheckCircle2, AlertTriangle, Terminal } from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";
import { JobCard, JobMatch } from "./JobCard";
import { ExtractedInfo } from "@/lib/gemini";
import { motion } from "framer-motion";

interface ResultsViewProps {
  data: ExtractedInfo;
  matches: JobMatch[];
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, matches, onReset }) => {
  const hasSkills = data.skills?.length > 0;
  const hasSoftSkills = data.softSkills?.length > 0;
  const hasEducation = data.education?.length > 0;
  const hasExperience = data.experience?.length > 0;
  const hasProjects = data.projects?.length > 0;
  const hasStrengths = data.strengths?.length > 0;
  const hasImprovements = data.areasForImprovement?.length > 0;
  const hasSummary = !!data.summary?.trim();
  const hasScoreBreakdown =
    data.scoreBreakdown &&
    (data.scoreBreakdown.technical || data.scoreBreakdown.experience ||
      data.scoreBreakdown.education || data.scoreBreakdown.presentation);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Resume <span className="gradient-text">Screening</span></h1>
          <p className="text-white/40">AI-powered deep analysis of your professional profile</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
        >
          Analyze Another
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Profile Card & Scores */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{data.name || "Candidate Name"}</h2>
              {hasExperience && (
                <p className="text-white/40 text-sm mt-1">{data.experience[0]?.role}</p>
              )}
            </div>

            <div className="space-y-4">
              {data.email && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  {data.phone}
                </div>
              )}
            </div>

            {(data.overallScore > 0 || hasScoreBreakdown) && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-6">Overall Fit Score</h3>
                <ScoreGauge score={data.overallScore} />

                {hasScoreBreakdown && (
                  <div className="mt-8 space-y-4">
                    {data.scoreBreakdown.technical > 0 && (
                      <ScoreBar label="Technical Skills" score={data.scoreBreakdown.technical} color="bg-cyan-500" />
                    )}
                    {data.scoreBreakdown.experience > 0 && (
                      <ScoreBar label="Experience Depth" score={data.scoreBreakdown.experience} color="bg-purple-500" />
                    )}
                    {data.scoreBreakdown.education > 0 && (
                      <ScoreBar label="Education" score={data.scoreBreakdown.education} color="bg-indigo-500" />
                    )}
                    {data.scoreBreakdown.presentation > 0 && (
                      <ScoreBar label="Presentation" score={data.scoreBreakdown.presentation} color="bg-pink-500" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {(hasSkills || hasSoftSkills) && (
            <div className="glass-card p-6">
              {hasSkills && (
                <>
                  <h3 className="flex items-center gap-2 text-sm font-bold mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Hard Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {hasSoftSkills && (
                <>
                  <h3 className="flex items-center gap-2 text-sm font-bold mt-6 mb-4">
                    <User className="w-4 h-4 text-cyan-400" />
                    Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.softSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-300/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Middle/Main Column: Detailed Insights */}
        <div className="lg:col-span-2 space-y-8">
          {(hasStrengths || hasImprovements) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hasStrengths && (
                <div className="glass-card p-6 border-l-4 border-l-emerald-500/50">
                  <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-white/70 flex gap-2">
                        <span className="text-emerald-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasImprovements && (
                <div className="glass-card p-6 border-l-4 border-l-amber-500/50">
                  <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Improvement Areas
                  </h3>
                  <ul className="space-y-2">
                    {data.areasForImprovement.map((s, i) => (
                      <li key={i} className="text-sm text-white/70 flex gap-2">
                        <span className="text-amber-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasSummary && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">Executive Summary</h3>
              </div>
              <p className="text-white/70 leading-relaxed text-lg italic">
                "{data.summary}"
              </p>
            </div>
          )}

          {hasProjects && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold font-display">Key Projects</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {data.projects.map((project, i) => (
                  <div key={i} className="glass-card p-6">
                    <h4 className="font-bold text-white mb-2">{project.title}</h4>
                    <p className="text-white/60 text-sm mb-4 leading-relaxed">{project.description}</p>
                    {project.tech?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((t, j) => (
                          <span key={j} className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold bg-cyan-500/5 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasExperience && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold font-display">Work Experience</h3>
              </div>
              <div className="space-y-4">
                {data.experience.map((exp, i) => (
                  <div key={i} className="glass-card p-6 border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{exp.role}</h4>
                      {exp.years && (
                        <span className="text-xs text-white/40 font-medium bg-white/5 px-2 py-1 rounded">{exp.years}</span>
                      )}
                    </div>
                    <p className="text-cyan-400 text-sm mb-3">{exp.company}</p>
                    {exp.description && (
                      <p className="text-white/60 text-sm leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasEducation && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold font-display">Education</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.education.map((edu, i) => (
                  <div key={i} className="glass-card p-6">
                    <h4 className="font-bold text-white text-sm mb-1">{edu.degree}</h4>
                    <p className="text-white/40 text-[13px] mb-2">{edu.institution}</p>
                    {edu.year && (
                      <span className="text-xs text-purple-400 font-bold">{edu.year}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display mb-2">Optimized <span className="gradient-text">Job Matches</span></h2>
          <p className="text-white/40">These roles best align with your current skill profile and career trajectory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length > 0 ? (
            matches.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 h-[200px] flex flex-col items-center justify-center gap-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-white/10" />
                <div className="h-4 w-32 bg-white/5 rounded-full" />
                <div className="h-3 w-48 bg-white/5 rounded-full" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold">
      <span className="text-white/60">{label}</span>
      <span className="text-white">{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);
