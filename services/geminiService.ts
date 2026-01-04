import { GoogleGenAI, Type } from "@google/genai";
import { EventCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface SmartEvent {
  title: string;
  duration: number; // minutes
  category: EventCategory;
  description: string;
}

interface MaterializedPlan {
    tasks: {
        title: string;
        offsetDays: number; // 0 = today, 1 = tomorrow
        duration: number;
        category: EventCategory;
    }[]
}

// 1. Smart Parse: Extracts metadata and intent
export const parseNaturalLanguage = async (input: string): Promise<SmartEvent> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this calendar input: "${input}". Extract title, duration (default 60), description, and categorize it into strictly one of: deep_work, meeting, health, logistics, leisure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: ['deep_work', 'meeting', 'health', 'logistics', 'leisure'] },
            description: { type: Type.STRING }
          },
          required: ["title", "duration", "category", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    return JSON.parse(text) as SmartEvent;
  } catch (error) {
    console.error("Smart parse failed:", error);
    return {
      title: input,
      duration: 60,
      category: 'logistics',
      description: 'Quick entry'
    };
  }
};

// 2. Materialize: Turns a thought into a plan
export const materializeThought = async (thought: string): Promise<MaterializedPlan> => {
    try {
        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `The user wants to "${thought}". Break this down into 3-5 concrete calendar events spread over the next few days to achieve this.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    offsetDays: { type: Type.NUMBER, description: "0 for today, 1 for tomorrow, etc." },
                                    duration: { type: Type.NUMBER, description: "Minutes" },
                                    category: { type: Type.STRING, enum: ['deep_work', 'meeting', 'health', 'logistics', 'leisure'] }
                                },
                                required: ["title", "offsetDays", "duration", "category"]
                            }
                        }
                    }
                }
            }
        });
        
        const text = response.text;
        if(!text) throw new Error("No plan generated");
        return JSON.parse(text) as MaterializedPlan;
    } catch (e) {
        console.error("Materialization failed", e);
        return { tasks: [] };
    }
}
