import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export const getGeminiModel = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
};

/** Returns true if the error represents a quota that won't recover quickly (daily limit). */
const isDailyQuotaExceeded = (error: any): boolean => {
  const msg: string = error?.message ?? "";
  return (
    msg.includes("free_tier_requests") ||
    msg.includes("PerDay") ||
    msg.includes("quota") && msg.includes("limit: 0")
  );
};

export const callGeminiWithRetry = async (apiKey: string, prompt: string | any[], retries = 3) => {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Dynamically fetch the models available to this API key so we never
  // hardcode names that have been deprecated or aren't in this tier.
  let models: string[] = [];
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      // Specialised model keywords that don't support general text/vision input
      const BLOCKED = ["tts", "image", "computer-use", "robotics", "embedding", "aqa"];

      const available: string[] = (listData.models ?? [])
        .filter((m: any) => {
          const name: string = m.name ?? "";
          return (
            name.includes("gemini") &&
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes("generateContent") &&
            !BLOCKED.some(kw => name.toLowerCase().includes(kw))
          );
        })
        .map((m: any) => (m.name as string).replace("models/", ""));

      // Prefer flash variants first (faster + cheaper), then pro
      models = [
        ...available.filter(n => n.includes("flash")),
        ...available.filter(n => !n.includes("flash")),
      ];
    }
  } catch (_) { /* ignore, fall through to hardcoded list */ }

  // Hardcoded safety net — only used if the ListModels call fails entirely
  if (models.length === 0) {
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
  }

  console.log("Available models for this request:", models);

  for (let m = 0; m < models.length; m++) {
    const model = genAI.getGenerativeModel({
      model: models[m],
      generationConfig: { responseMimeType: "application/json" }
    });

    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        return result;
      } catch (error: any) {
        const is429 = error.status === 429;
        const is503 = error.status === 503;
        const is404 = error.status === 404;

        // Model not found — skip immediately to the next model
        if (is404 && m < models.length - 1) {
          console.warn(`Model ${models[m]} not found (404), falling back to ${models[m + 1]}`);
          break;
        }

        // Daily quota errors won't recover with a wait — jump to the next model immediately
        if (is429 && isDailyQuotaExceeded(error)) {
          console.warn(`Daily quota exceeded for ${models[m]}, switching model...`);
          break; // skip remaining retries, try next model
        }

        // Transient rate-limit or service error — wait then retry on same model
        if ((is429 || is503) && i < retries - 1) {
          const waitMs = 3000 * (i + 1);
          console.log(`Gemini ${models[m]} ${error.status}, retrying in ${waitMs}ms (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }

        // Exhausted retries on this model — try the next one if available
        if ((is429 || is503) && m < models.length - 1) {
          console.log(`Exhausted retries for ${models[m]}, falling back to ${models[m + 1]}`);
          break;
        }

        throw error;
      }
    }
  }

  // All models exhausted
  throw new Error(
    "All available AI models have exceeded their quota. " +
    "Please add your own Gemini API key in the field above, or try again later."
  );
};

export interface ExtractedInfo {
  name: string;
  email: string;
  phone: string;
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ company: string; role: string; years: string; description: string }>;
  skills: string[];
  softSkills: string[];
  projects: Array<{ title: string; tech: string[]; description: string }>;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  overallScore: number;
  scoreBreakdown: {
    technical: number;
    experience: number;
    education: number;
    presentation: number;
  };
}

export const analyzeResumePrompt = (resumeText: string, fileData?: { data: string, mimeType: string }) => {
  const textPrompt = `
Analyze the provided resume and extract information in JSON format.
Be extremely thorough. If information is present, extract it.
The JSON must strictly follow this structure:
{
  "name": "Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "experience": [{"company": "...", "role": "...", "years": "...", "description": "..."}],
  "skills": ["Hard Skill 1", "Hard Skill 2", ...],
  "softSkills": ["Soft Skill 1", "Soft Skill 2", ...],
  "projects": [{"title": "...", "tech": ["..."], "description": "..."}],
  "summary": "A high-impact professional summary.",
  "strengths": ["Major strength 1", ...],
  "areasForImprovement": ["Specific area to improve 1", ...],
  "overallScore": 0-100,
  "scoreBreakdown": {
    "technical": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "presentation": 0-100
  }
}

If a field cannot be found, return an empty string or empty array.
${resumeText ? `\nResume Text:\n${resumeText}` : "Please analyze the attached file."}
`;

  if (fileData) {
    return [
      { text: textPrompt },
      { inlineData: { data: fileData.data, mimeType: fileData.mimeType } }
    ];
  }
  return textPrompt;
};

export const matchJobPrompt = (skills: string[], experienceSummary: string, jobTitle: string, jobRequirements: string[]) => `
Compare the candidate's skills and experience with the job role.
Candidate Skills: ${skills.join(", ")}
Candidate Experience: ${experienceSummary}
Job Title: ${jobTitle}
Job Requirements: ${jobRequirements.join(", ")}

Provide a match analysis in JSON format:
{
  "matchPercentage": 0-100,
  "matchedSkills": ["Skill 1", ...],
  "missingSkills": ["Skill A", ...],
  "reasoning": "A brief explanation of why this job is a match or not."
}
`;
