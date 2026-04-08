const OPENROUTER_API_KEY = "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"; // 🔑 PUT YOUR KEY HERE

export const groupTasksWithAI = async (tasks, organizeType) => {
  try {
    console.log("🚀 AI FUNCTION STARTED");

    let instruction = "";

    if (organizeType === "priority") {
      instruction = `
Analyze each task and ASSIGN a priority (High, Medium, Low), then group them.
`;
    } else if (organizeType === "time") {
      instruction = `
Group tasks into Today, Tomorrow, This Week, Upcoming based on dueDate.
`;
    } else if (organizeType === "category") {
      instruction = `
Group tasks by their type (Work, Personal).
`;
    } else {
      instruction = `
Group tasks intelligently based on urgency and importance.
`;
    }

    const prompt = `
You are a smart task manager.

Your job:
1. Analyze each task
2. Assign priority: High, Medium, or Low
3. Group tasks accordingly

Rules:
- High → urgent, overdue, or very important
- Medium → normal tasks
- Low → not urgent / flexible

Return ONLY valid JSON.
No explanation. No markdown.

Format:
{
  "High": [],
  "Medium": [],
  "Low": []
}

Tasks:
${JSON.stringify(tasks)}
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();

    console.log("🧠 FULL RESPONSE:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.log("❌ No response text");
      return fallbackGrouping(tasks);
    }

    console.log("🧠 RAW TEXT:", text);

    // 🔥 CLEAN RESPONSE
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 EXTRACT JSON
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      console.log("❌ No JSON found");
      return fallbackGrouping(tasks);
    }

    const parsed = JSON.parse(match[0]);

    console.log("✅ PARSED:", parsed);

    return parsed;

  } catch (error) {
    console.log("🔥 AI ERROR:", error);
    return fallbackGrouping(tasks);
  }
};



// ✅ SMART FALLBACK (no AI needed if it fails)
const fallbackGrouping = (tasks) => {
  console.log("⚠️ USING SMART FALLBACK");

  const today = new Date();

  return {
    High: tasks.filter((task) => {
      if (!task.dueDate) return false;

      const due = parseDate(task.dueDate);
      return due <= today; // overdue or today
    }),

    Medium: tasks.filter((task) => {
      if (!task.dueDate) return true;

      const due = parseDate(task.dueDate);
      const diff = (due - today) / (1000 * 60 * 60 * 24);

      return diff > 0 && diff <= 3; // next 3 days
    }),

    Low: tasks.filter((task) => {
      if (!task.dueDate) return false;

      const due = parseDate(task.dueDate);
      const diff = (due - today) / (1000 * 60 * 60 * 24);

      return diff > 3; // far future
    }),
  };
};


// ✅ Helper: parse DD/MM/YYYY
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};





















// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY = "AIzaSyCcKfnqwbiHPuGSADTUtpPef1XJ5Pg_fhI";

// const genAI = new GoogleGenerativeAI(API_KEY);

// export const groupTasksWithAI = async (tasks, organizeType) => {
//   try {
//     console.log("🚀 AI FUNCTION STARTED");
//     console.log("Tasks sent:", tasks);
//     console.log("Organize Type:", organizeType);

//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-pro-latest",
//     });

//     let instruction = "";

//     if (organizeType === "priority") {
//       instruction = "Group tasks into High, Medium, Low priority.";
//     } else if (organizeType === "time") {
//       instruction =
//         "Group tasks into Today, Tomorrow, This Week, Upcoming.";
//     } else if (organizeType === "category") {
//       instruction = "Group tasks by their type (Work, Personal).";
//     } else {
//       instruction =
//         "Group tasks intelligently based on urgency and importance.";
//     }

//     const prompt = `
// Return ONLY valid JSON.

// ${instruction}

// Tasks:
// ${JSON.stringify(tasks)}
// `;

//     console.log("📤 PROMPT:", prompt);

//     const result = await model.generateContent(prompt);

//     const text = result.response.text();

//     console.log("🧠 RAW AI RESPONSE:", text);

//     // Extract JSON safely
//     const jsonMatch = text.match(/\{[\s\S]*\}/);

//     if (!jsonMatch) {
//       console.log("❌ No JSON found in response");
//       return null;
//     }

//     console.log("✅ Extracted JSON:", jsonMatch[0]);

//     const parsed = JSON.parse(jsonMatch[0]);

//     console.log("🎯 Parsed JSON:", parsed);

//     return parsed;
//   } catch (error) {
//     console.log("🔥 AI ERROR:", error);
//     return null;
//   }
// };













// // import { GoogleGenerativeAI } from "@google/generative-ai";

// // const API_KEY = "AIzaSyCcKfnqwbiHPuGSADTUtpPef1XJ5Pg_fhI";

// // const genAI = new GoogleGenerativeAI(API_KEY);

// // export const groupTasksWithAI = async (tasks, organizeType) => {
// //   try {
// //     const model = genAI.getGenerativeModel({
// //       model: "gemini-1.5-flash",
// //     });

// //     let instruction = "";

// //     if (organizeType === "priority") {
// //       instruction = `
// // Group tasks into:
// // - High Priority
// // - Medium Priority
// // - Low Priority
// // `;
// //     } else if (organizeType === "time") {
// //       instruction = `
// // Group tasks into:
// // - Overdue
// // - Today
// // - This Week
// // - Upcoming
// // `;
// //     } else if (organizeType === "category") {
// //       instruction = `
// // Group tasks based on their type (e.g., Work, Personal, Others).
// // `;
// //     } else {
// //       instruction = `
// // Group tasks intelligently based on urgency, importance, and effort.
// // Create meaningful group names.
// // `;
// //     }

// //     const prompt = `
// // You are a smart task manager.

// // ${instruction}

// // Return ONLY JSON.

// // Tasks:
// // ${JSON.stringify(tasks)}
// // `;

// //     const result = await model.generateContent(prompt);
// //     const text = result.response.text();

// //     const cleaned = text.replace(/```json|```/g, "");

// //     return JSON.parse(cleaned);
// //   } catch (error) {
// //     console.log("AI ERROR:", error);
// //     return null;
// //   }
// // };





















// // import { GoogleGenerativeAI } from "@google/generative-ai";

// // const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

// // const genAI = new GoogleGenerativeAI(API_KEY);

// // export const groupTasksWithAI = async (tasks) => {
// //   try {
// //     const model = genAI.getGenerativeModel({
// //       model: "gemini-1.5-flash",
// //     });

// //     const prompt = `
// // You are a smart task manager.

// // Group these tasks into:
// // - High Priority
// // - Medium Priority
// // - Low Priority

// // Consider:
// // - Due dates
// // - Task type
// // - Description

// // Return ONLY JSON in this format:
// // {
// //   "High Priority": [],
// //   "Medium Priority": [],
// //   "Low Priority": []
// // }

// // Tasks:
// // ${JSON.stringify(tasks)}
// // `;

// //     const result = await model.generateContent(prompt);
// //     const text = result.response.text();

// //     const cleaned = text.replace(/```json|```/g, "");

// //     return JSON.parse(cleaned);
// //   } catch (error) {
// //     console.log("AI ERROR:", error);
// //     return null;
// //   }
// // };