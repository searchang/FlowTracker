import { GoogleGenAI } from "@google/genai";
import { Activity, Category } from "../types";

export const generateInsights = async (activities: Activity[], categories: Category[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure your API Key to use AI insights.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare data summary for the AI
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  const recentActivities = activities.filter(a => a.endTime && a.endTime > oneWeekAgo);
  
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  
  const summary = recentActivities.map(a => {
    const duration = a.endTime ? (a.endTime - a.startTime) / 1000 / 60 : 0; // minutes
    // Join multiple categories
    const categoryNames = a.categoryIds.map(id => categoryMap.get(id) || 'Unknown').join(' & ');

    return {
      categories: categoryNames,
      durationMinutes: Math.round(duration),
      date: new Date(a.startTime).toLocaleDateString(),
      thoughts: a.thoughts.map(t => t.text).join("; ")
    };
  });

  const prompt = `
    Analyze the following time tracking data for the past week:
    ${JSON.stringify(summary)}

    Please provide a concise analysis in markdown format:
    1. A brief summary of how time was spent.
    2. Any patterns noticed (e.g., specific days with high workload, multitasking).
    3. One actionable suggestion for better time management.
    4. If there are thoughts pinned to activities, summarize the user's mindset.
    
    Keep the tone professional yet encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};
