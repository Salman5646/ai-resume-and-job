
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBZG1ye6y56ce9-UtfxYLSTZSIgErAMWGs";
const genAI = new GoogleGenerativeAI(apiKey);

const modelName = "gemini-2.5-flash"; // The one used in the code

const resumeText = `
John Doe
Email: john.doe@example.com
Phone: 123-456-7890
Experience:
Software Engineer at Tech Corp (2020-2024)
- Developed web applications using React and Node.js.
Skills: React, Node.js, TypeScript, JavaScript
Education:
BS in Computer Science, State University, 2020
`;

async function test() {
    try {
        console.log("Testing model:", modelName);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
Analyze the following resume text and extract information in JSON format.
The JSON should have the following structure:
{
  "name": "Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "experience": [{"company": "...", "role": "...", "years": "...", "description": "..."}],
  "skills": ["Skill 1", "Skill 2", ...],
  "summary": "A 2-3 sentence professional summary of the candidate.",
  "overallScore": 0-100 (A score based on the quality of experience and skills)
}

Resume Text:
${resumeText}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Response Text:");
        console.log(text);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
