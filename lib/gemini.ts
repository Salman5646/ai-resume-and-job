import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export const getGeminiModel = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
};

export const callGeminiWithRetry = async (apiKey: string, prompt: string | any[], retries = 5) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try flash first, then pro if flash is consistently failing
  const models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash"];

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
        if ((error.status === 503 || error.status === 429) && i < retries - 1) {
          console.log(`Gemini ${models[m]} ${error.status} error, retrying (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
          continue;
        }

        // If it's a 503/429 and we've exhausted retries for this model, try next model
        if ((error.status === 503 || error.status === 429) && m < models.length - 1) {
          console.log(`Exhausted retries for ${models[m]}, falling back to ${models[m + 1]}`);
          break; // Break inner loop to try next model
        }

        throw error;
      }
    }
  }
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
