import { NextRequest, NextResponse } from "next/server";
import { analyzeResumePrompt, callGeminiWithRetry } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, fileData, fileMimeType, apiKey: clientApiKey } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if ((!resumeText && !fileData) || !apiKey) {
      return NextResponse.json({ error: "Resume text or file and API key are required" }, { status: 400 });
    }

    const result = await callGeminiWithRetry(apiKey, analyzeResumePrompt(resumeText, fileData ? { data: fileData, mimeType: fileMimeType } : undefined));
    if (!result) throw new Error("Failed to get response from Gemini");
    const response = await result.response;
    const text = response.text();

    // Clean JSON response in case there are markdown blocks or extra text
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let rawData;
    try {
      rawData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError);
      console.error("Raw text was:", cleanJson);
      throw new Error("The AI model returned malformed information. Please try clicking 'Analyze' again.");
    }

    // Ensure all fields exist with defaults
    const extractedInfo = {
      name: rawData.name || "",
      email: rawData.email || "",
      phone: rawData.phone || "",
      education: Array.isArray(rawData.education) ? rawData.education : [],
      experience: Array.isArray(rawData.experience) ? rawData.experience : [],
      skills: Array.isArray(rawData.skills) ? rawData.skills : [],
      softSkills: Array.isArray(rawData.softSkills) ? rawData.softSkills : [],
      projects: Array.isArray(rawData.projects) ? rawData.projects : [],
      summary: rawData.summary || "",
      strengths: Array.isArray(rawData.strengths) ? rawData.strengths : [],
      areasForImprovement: Array.isArray(rawData.areasForImprovement) ? rawData.areasForImprovement : [],
      overallScore: typeof rawData.overallScore === 'number' ? rawData.overallScore : 0,
      scoreBreakdown: rawData.scoreBreakdown || {
        technical: 0,
        experience: 0,
        education: 0,
        presentation: 0
      }
    };

    return NextResponse.json(extractedInfo);
  } catch (error: any) {
    console.error("Analysis Error details:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
