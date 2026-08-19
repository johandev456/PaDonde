import { GoogleGenerativeAI } from "@google/generative-ai";

const knownTypes = ["restaurant", "bar", "cafe"];

const sanitizeFilters = (value) => ({
  type: knownTypes.includes(value?.type) ? value.type : null,
  tags: Array.isArray(value?.tags)
    ? [...new Set(value.tags
      .filter((tag) => typeof tag === "string")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean))].slice(0, 8)
    : [],
  max_price: Number.isInteger(Number(value?.max_price)) && Number(value.max_price) >= 1 && Number(value.max_price) <= 4
    ? Number(value.max_price)
    : null,
});

const localFallback = (message) => {
  const text = message.toLowerCase();
  const type = knownTypes.find((item) => text.includes(item))
    || (text.includes("restaurante") ? "restaurant" : text.includes("cafeter") ? "cafe" : null);
  const tags = [
    ["romantico", "romantico", "romántico"],
    ["chill", "chill"],
    ["musica_en_vivo", "música en vivo", "musica en vivo"],
    ["familiar", "familiar"],
    ["terraza", "terraza"],
    ["vegano", "vegano", "vegan"],
    ["desayuno", "desayuno", "brunch"],
  ].filter(([, ...terms]) => terms.some((term) => text.includes(term))).map(([tag]) => tag);
  const max_price = /barat|econ[oó]mic/.test(text) ? 2 : /caro|luj/.test(text) ? 4 : null;
  return { type, tags, max_price };
};

const parseJson = (text) => {
  const json = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return sanitizeFilters(JSON.parse(json));
};

export const parseUserQuery = async (message) => {
  if (!process.env.GEMINI_API_KEY) return localFallback(message);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
  const prompt = `Eres un sistema que convierte texto en filtros para una base de datos de lugares en Santo Domingo.
Devuelve SOLO JSON válido, sin explicación ni bloques Markdown.
Formato:
{"type":"restaurant | bar | cafe | null","tags":["string"],"max_price":number | null}
Reglas: "barato" o "económico" significa max_price 2; "caro" significa max_price 4; si no menciona tipo devuelve null; usa tags simples en minúsculas con guion bajo, por ejemplo chill, romantico, musica_en_vivo.
Texto: ${JSON.stringify(message)}`;

  try {
    const result = await model.generateContent(prompt);
    return parseJson(result.response.text());
  } catch (error) {
    console.error("Gemini parsing failed; using local intent parser:", error.message);
    return localFallback(message);
  }
};
