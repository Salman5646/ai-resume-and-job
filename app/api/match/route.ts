import { NextRequest, NextResponse } from "next/server";
import { matchJobPrompt, callGeminiWithRetry } from "@/lib/gemini";
import { jobCatalog } from "@/lib/jobs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/match
 *
 * Hybrid AI pipeline:
 *  1. Neural Network (Python FastAPI) → ranks all jobs by similarity score
 *  2. Gemini LLM → provides human-readable reasoning + improvement tips
 *     for the top-5 NN-selected jobs
 *
 * Fallback: if NN service is unavailable, falls back to skill-overlap scoring.
 */
export async function POST(req: NextRequest) {
  try {
    const { extractedInfo, apiKey: clientApiKey } = await req.json();
    console.log("\n[match] ── Hybrid Match Pipeline ──────────────────");
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!extractedInfo || !apiKey) {
      return NextResponse.json(
        { error: "Extracted info and API key are required" },
        { status: 400 }
      );
    }

    const { skills, experience, softSkills, summary } = extractedInfo;
    const experienceText = experience
      .map((e: any) => `${e.role} at ${e.company}`)
      .join(", ");

    // ──────────────────────────────────────────────────────────────────────
    // STEP 1 — Neural Network Ranking
    // ──────────────────────────────────────────────────────────────────────
    let topJobs: any[] = [];
    let scoringMethod = "skill_overlap_fallback";

    try {
      console.log("[match] [NN] Calling ML service …");
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8_000);

      const nnRes = await fetch(`${ML_SERVICE_URL}/predict-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_skills: skills,
          jobs: jobCatalog.map((j) => ({
            id: j.id,
            title: j.title,
            requiredSkills: j.requiredSkills,
          })),
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(tid));

      if (nnRes.ok) {
        const nnData = await nnRes.json();
        scoringMethod = nnData.scoring_method === "neural_network"
          ? "neural_network"
          : "jaccard_fallback";

        topJobs = nnData.results.slice(0, 5).map((r: any) => {
          const catalogEntry = jobCatalog.find((j) => j.id === r.id)!;
          return {
            ...catalogEntry,
            nnScore: r.score,
            initialScore: Math.round(r.score * 100),
          };
        });

        console.log(`[match] [NN] ✅ Top-5 by ${scoringMethod}:`,
          topJobs.map((j) => `${j.title}(${j.initialScore}%)`).join(", "));
      } else {
        throw new Error(`ML service returned ${nnRes.status}`);
      }

    } catch (nnErr: any) {
      const reason = nnErr?.name === "AbortError" ? "timeout" : nnErr.message;
      console.warn(`[match] [NN] ⚠️  Unavailable (${reason}) — falling back to skill overlap`);
      scoringMethod = "skill_overlap_fallback";

      // ── Fallback: keyword overlap ──────────────────────────────────────
      const scored = jobCatalog.map((job) => {
        const matched = job.requiredSkills.filter((s) =>
          skills.some(
            (u: string) =>
              u.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(u.toLowerCase())
          )
        );
        return { ...job, initialScore: Math.round((matched.length / job.requiredSkills.length) * 100), nnScore: null };
      });
      topJobs = scored.sort((a, b) => b.initialScore - a.initialScore).slice(0, 5);
      console.log("[match] [Fallback] Top-5:",
        topJobs.map((j) => `${j.title}(${j.initialScore}%)`).join(", "));
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 2 — Gemini LLM: reasoning + tips for NN-selected top-5
    // ──────────────────────────────────────────────────────────────────────
    console.log("[match] [Gemini] Generating reasoning for top-5 jobs …");

    const batchPrompt = `
You are a career advisor. Explain why the candidate matches (or partially matches) each job below.
Do NOT re-rank — just provide reasoning for the order given.

Candidate Skills: ${skills.join(", ")}
Soft Skills: ${softSkills?.join(", ") ?? "N/A"}
Experience: ${experienceText}
Summary: ${summary}

Jobs to explain (already ranked by AI model):
${topJobs.map((j, i) => `#${i + 1} ID:${j.id} | ${j.title} | Requires: ${j.requiredSkills.join(", ")}`).join("\n")}

Return a JSON array — one object per job, preserving the same order:
[
  {
    "id": "job_id",
    "matchPercentage": 0-100,
    "matchedSkills": ["Skill 1", ...],
    "missingSkills": ["Skill A", ...],
    "reasoning": "2-3 sentence explanation of this match",
    "recommendation": "One specific actionable tip to close the skill gap"
  }
]
`;

    const geminiResult = await callGeminiWithRetry(apiKey, batchPrompt);
    if (!geminiResult) throw new Error("No response from Gemini");

    const raw = (await geminiResult.response).text();
    const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    let geminiAnalysis: any[] = [];
    try {
      geminiAnalysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("[match] JSON Parse Error on raw API output:", cleanJson);
      throw new Error("AI returned malformed reasoning data. Please try again.");
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 3 — Merge: NN score + Gemini reasoning + catalog details
    // ──────────────────────────────────────────────────────────────────────
    const finalResults = topJobs.map((nnJob) => {
      const analysis = geminiAnalysis.find((a) => String(a.id) === String(nnJob.id)) || {};
      const catalog = jobCatalog.find((j) => String(j.id) === String(nnJob.id));

      return {
        ...analysis,
        ...catalog,             // authoritative catalog fields (title, category, description)
        nnScore: nnJob.nnScore ?? null,
        nnRankScore: nnJob.initialScore ?? analysis.matchPercentage,
        scoringMethod,          // tells the UI how jobs were ranked
      };
    });

    console.log("[match] ── Pipeline complete ──────────────────────────\n");
    return NextResponse.json({ jobs: finalResults, scoringMethod });

  } catch (error: any) {
    console.error("[match] ❌ Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to match jobs" },
      { status: 500 }
    );
  }
}
