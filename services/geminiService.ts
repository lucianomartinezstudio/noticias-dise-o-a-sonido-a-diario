
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDailyDesignNews = async (): Promise<NewsReport> => {
  const prompt = `Busca noticias de hoy relacionadas con: 
  - Diseño Gráfico
  - Merchandising
  - Bellas Artes
  - Aplicaciones del diseño gráfico a la arquitectura y decoración
  - Productos de diseño industrial
  
  Devuelve una lista estructurada con títulos, fuentes y un resumen ejecutivo de cada noticia en español. 
  Finaliza con un texto narrativo largo que unifique todas las noticias para ser leído como un podcast.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                url: { type: Type.STRING },
                summary: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["title", "source", "url", "summary", "category"]
            }
          },
          fullText: { type: Type.STRING, description: "Narrativa completa para audio" }
        },
        required: ["date", "items", "fullText"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateAudioSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Lee el siguiente resumen de noticias de diseño con tono profesional y pausado: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!base64Audio) throw new Error("No se pudo generar el audio");
  return base64Audio;
};
