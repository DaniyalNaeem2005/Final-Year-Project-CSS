// API used to organize tasks in the task list
const OPENROUTER_API_KEY = "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"; 

// Sends tasks to AI and gets them grouped intelligently
export const groupTasksWithAI = async (tasks, organizeType) => {
  try {

// Instructions controls how we instruct the AI
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

// Prompt for the Ai 
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

// Sending request to OpenRouter AI API
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
          temperature: 0.3, //More consistent output
        }),
      }
    );

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return fallbackGrouping(tasks);
    }

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      return fallbackGrouping(tasks);
    }

    const parsed = JSON.parse(match[0]);
    return parsed;

  } catch (error) {
    return fallbackGrouping(tasks);
  }
};

//If Ai fails then fallbackgrouping functiom
const fallbackGrouping = (tasks) => {
  const today = new Date();

  return {
    High: tasks.filter((task) => {
      if (!task.dueDate) return false;

      const due = parseDate(task.dueDate);
      return due <= today;
    }),

    Medium: tasks.filter((task) => {
      if (!task.dueDate) return true;
      const due = parseDate(task.dueDate);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 3;
    }),

    Low: tasks.filter((task) => {
      if (!task.dueDate) return false;
      const due = parseDate(task.dueDate);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      return diff > 3;
    }),
  };
};

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};
