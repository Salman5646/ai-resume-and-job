import { NextRequest, NextResponse } from "next/server";
import { matchJobPrompt, callGeminiWithRetry } from "@/lib/gemini";
import { jobCatalog } from "@/lib/jobs";

export async function POST(req: NextRequest) {
  try {
    const { extractedInfo, apiKey: clientApiKey } = await req.json();
    console.log("API: /api/match called");
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!extractedInfo || !apiKey) {
      return NextResponse.json({ error: "Extracted info and API key are required" }, { status: 400 });
    }

    const { skills, experience } = extractedInfo;
    const experienceText = experience.map((exp: any) => `${exp.role} at ${exp.company}`).join(", ");

    // For each job in the catalog, let's do a basic skill overlap check first to filter
    // Then use Gemini for the top 5 matches to get detailed analysis
    const scoredJobs = jobCatalog.map(job => {
      const matched = job.requiredSkills.filter(s =>
        skills.some((userSkill: string) => userSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(userSkill.toLowerCase()))
      );
      const score = (matched.length / job.requiredSkills.length) * 100;
      return { ...job, initialScore: score, matchedSkills: matched };
    });

    const topJobs = scoredJobs
      .sort((a, b) => b.initialScore - a.initialScore)
      .slice(0, 5);

    // Process top jobs to get AI reasoning
    // We'll do them in parallel or batch if possible, but for simplicity let's do one prompt per job or one big prompt
    // One big prompt is better for speed
    const batchPrompt = `
Analyze how well the candidate matches these ${topJobs.length} jobs.
Candidate Skills: ${skills.join(", ")}
Candidate Soft Skills: ${extractedInfo.softSkills?.join(", ")}
Candidate Experience: ${experienceText}
Summary: ${extractedInfo.summary}

Jobs to analyze:
${topJobs.map(j => `ID: ${j.id}, Title: ${j.title}, Requirements: ${j.requiredSkills.join(", ")}`).join("\n")}

Return a JSON array of objects, one for each job ID:
[
  {
    "id": "job_id",
    "matchPercentage": 0-100,
    "matchedSkills": ["Skill 1", ...],
    "missingSkills": ["Skill A", ...],
    "reasoning": "Brief explanation",
    "recommendation": "One specific actionable tip to improve match (e.g., 'Gain experience with Docker')"
  },
  ...
]
`;

    const result = await callGeminiWithRetry(apiKey, batchPrompt);
    if (!result) throw new Error("Failed to get match analysis from Gemini");
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const matchedAnalysis = JSON.parse(cleanJson);

    // Merge analysis with job details
    // Coerce IDs to string because the AI sometimes returns numeric IDs
    const finalResults = matchedAnalysis.map((analysis: any) => {
      const jobDetails = jobCatalog.find(j => String(j.id) === String(analysis.id));
      if (!jobDetails) {
        console.warn(`No catalog entry found for job id: ${analysis.id}`);
      }
      // jobDetails spreads last so title/category/description always come from the catalog
      return { ...analysis, ...jobDetails };
    }).sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json(finalResults);
  } catch (error: any) {
    console.error("Matching Error:", error);
    return NextResponse.json({ error: error.message || "Failed to match jobs" }, { status: 500 });
  }
}
