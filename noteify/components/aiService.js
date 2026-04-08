import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCcKfnqwbiHPuGSADTUtpPef1XJ5Pg_fhI";

const genAI = new GoogleGenerativeAI(API_KEY);

export const groupTasksWithAI = async (tasks, organizeType) => {
  try {
    console.log("🚀 AI FUNCTION STARTED");
    console.log("Tasks sent:", tasks);
    console.log("Organize Type:", organizeType);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    });

    let instruction = "";

    if (organizeType === "priority") {
      instruction = "Group tasks into High, Medium, Low priority.";
    } else if (organizeType === "time") {
      instruction =
        "Group tasks into Today, Tomorrow, This Week, Upcoming.";
    } else if (organizeType === "category") {
      instruction = "Group tasks by their type (Work, Personal).";
    } else {
      instruction =
        "Group tasks intelligently based on urgency and importance.";
    }

    const prompt = `
Return ONLY valid JSON.

${instruction}

Tasks:
${JSON.stringify(tasks)}
`;

    console.log("📤 PROMPT:", prompt);

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    console.log("🧠 RAW AI RESPONSE:", text);

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log("❌ No JSON found in response");
      return null;
    }

    console.log("✅ Extracted JSON:", jsonMatch[0]);

    const parsed = JSON.parse(jsonMatch[0]);

    console.log("🎯 Parsed JSON:", parsed);

    return parsed;
  } catch (error) {
    console.log("🔥 AI ERROR:", error);
    return null;
  }
};













// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY = "AIzaSyCcKfnqwbiHPuGSADTUtpPef1XJ5Pg_fhI";

// const genAI = new GoogleGenerativeAI(API_KEY);

// export const groupTasksWithAI = async (tasks, organizeType) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash",
//     });

//     let instruction = "";

//     if (organizeType === "priority") {
//       instruction = `
// Group tasks into:
// - High Priority
// - Medium Priority
// - Low Priority
// `;
//     } else if (organizeType === "time") {
//       instruction = `
// Group tasks into:
// - Overdue
// - Today
// - This Week
// - Upcoming
// `;
//     } else if (organizeType === "category") {
//       instruction = `
// Group tasks based on their type (e.g., Work, Personal, Others).
// `;
//     } else {
//       instruction = `
// Group tasks intelligently based on urgency, importance, and effort.
// Create meaningful group names.
// `;
//     }

//     const prompt = `
// You are a smart task manager.

// ${instruction}

// Return ONLY JSON.

// Tasks:
// ${JSON.stringify(tasks)}
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const cleaned = text.replace(/```json|```/g, "");

//     return JSON.parse(cleaned);
//   } catch (error) {
//     console.log("AI ERROR:", error);
//     return null;
//   }
// };





















// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

// const genAI = new GoogleGenerativeAI(API_KEY);

// export const groupTasksWithAI = async (tasks) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash",
//     });

//     const prompt = `
// You are a smart task manager.

// Group these tasks into:
// - High Priority
// - Medium Priority
// - Low Priority

// Consider:
// - Due dates
// - Task type
// - Description

// Return ONLY JSON in this format:
// {
//   "High Priority": [],
//   "Medium Priority": [],
//   "Low Priority": []
// }

// Tasks:
// ${JSON.stringify(tasks)}
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const cleaned = text.replace(/```json|```/g, "");

//     return JSON.parse(cleaned);
//   } catch (error) {
//     console.log("AI ERROR:", error);
//     return null;
//   }
// };