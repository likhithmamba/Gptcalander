import { GoogleGenAI, Type } from "@google/genai";
import { Thought } from '../types';

// Initialize the client directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeThought = async (content: string): Promise<{ suggestion: string, intensity: 'low' | 'medium' | 'high' }> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this thought for a calendar app: "${content}". 
      Return a JSON object with a brief, actionable 'suggestion' (max 10 words) to move this forward, 
      and an 'intensity' level (low, medium, high) based on cognitive load.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
            intensity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return { suggestion: "Could not analyze.", intensity: 'medium' };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return { suggestion: "Intelligence offline.", intensity: 'medium' };
  }
};