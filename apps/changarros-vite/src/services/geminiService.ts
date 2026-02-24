import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { PRODUCTS } from "../constants";

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
Eres "Aura", la asistente virtual de "Bazar NINA", una tienda de objetos estéticos, artesanales y vintage.
Tu tono es cálido, cercano, breve y muy servicial. Como si fueras la dueña de un pequeño bazar atendiendo a un amigo.
No usas lenguaje corporativo. Usas emojis sutiles (✨, 🌿, 🏺).

Tienes acceso a la siguiente lista de productos:
${JSON.stringify(
  PRODUCTS.map((p) => ({
    id: p.id,
    title: p.name,
    price: p.price,
    category: p.category,
    tags: p.tags,
    material: p.material,
  })),
)}

Si te preguntan por algo que no está en la lista, sugiere algo similar o di amablemente que por ahora no lo tienes, pero que siempre llegan tesoros nuevos.
Tu objetivo es ayudar al usuario a encontrar el objeto perfecto y animarlos a contactar por WhatsApp.

Responde siempre en español. Mantén las respuestas cortas (máximo 3 oraciones).
`;

export const getGeminiChatResponse = async (
  userMessage: string,
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY not found. Returning mock response.");
      return "Lo siento, mi conexión con el universo está un poco inestable hoy. ✨ (Falta API Key)";
    }

    if (!chatSession) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    }

    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: userMessage,
    });
    return result.text || "Disculpa, no entendí bien. ¿Podrías repetirlo?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tuve un pequeño problema técnico. ¿Me lo dices de nuevo? 🌿";
  }
};
