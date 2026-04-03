import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseUserQuery = async (message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
Eres un sistema que convierte texto en filtros para una base de datos de lugares.

Devuelve SOLO JSON válido sin explicación.

Formato:
{
  "type": "restaurant | bar | cafe | null",
  "tags": ["string"],
  "max_price": number | null
}

Reglas:
- "barato" -> max_price = 2
- "caro" -> max_price = 4
- Si no menciona tipo -> null
- Tags deben ser simples (ej: chill, romantico, musica_en_vivo)

Texto: "${message}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Error parsing AI response:", text);
    return null;
  }
};