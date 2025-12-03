import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SingingAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "Overall rating out of 100",
    },
    title: {
      type: Type.STRING,
      description: "A short, encouraging title for the review (e.g., 'Soulful Performance', 'Pitch Perfect')",
    },
    summary: {
      type: Type.STRING,
      description: "A 2-3 sentence executive summary of the performance.",
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        pitch: { type: Type.INTEGER, description: "Score out of 100 for pitch accuracy" },
        tone: { type: Type.INTEGER, description: "Score out of 100 for tone quality/timbre" },
        rhythm: { type: Type.INTEGER, description: "Score out of 100 for timing and rhythm" },
        expression: { type: Type.INTEGER, description: "Score out of 100 for emotional delivery" },
      },
      required: ["pitch", "tone", "rhythm", "expression"],
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 key strengths.",
    },
    areasForImprovement: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 specific areas to improve.",
    },
    technicalSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 specific technical vocal exercises to practice based on the analysis.",
    },
  },
  required: ["overallScore", "title", "summary", "metrics", "strengths", "areasForImprovement", "technicalSuggestions"],
};

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<SingingAnalysis> => {
  try {
    const modelId = "gemini-2.5-flash"; // Excellent multimodal capabilities
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Please act as a world-class professional vocal coach. Listen carefully to the attached singing recording. 
            Analyze the frequencies, pitch accuracy, breath support, and tonal quality.
            Provide a strict but constructive critique. 
            Return the result in JSON format matching the schema provided.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more objective analysis
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as SingingAnalysis;
  } catch (error) {
    console.error("Error analyzing audio:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
