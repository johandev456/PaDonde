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
    ["para_citas", "cita", "citas", "pareja", "aniversario"],
    ["chill", "chill", "tranquilo", "relajado"],
    ["musica_en_vivo", "música en vivo", "musica en vivo", "banda"],
    ["dj_en_vivo", "dj", "música electrónica"],
    ["familiar", "familiar", "familia", "niños"],
    ["terraza", "terraza", "al aire libre"],
    ["vegano", "vegano", "vegan", "vegetariano"],
    ["desayuno", "desayuno", "mañana"],
    ["brunch", "brunch"],
    ["brunch_top", "brunch top", "mejor brunch"],
    ["cocteleria", "tragos", "cocteles", "cócteles", "bebidas"],
    ["cocteleria_autor", "coctelería de autor", "tragos de autor", "mixología"],
    ["vinos_selectos", "vino", "vinos", "cava"],
    ["vistas_espectaculares", "vista", "vistas", "rooftop", "panorámica"],
    ["elegante", "elegante", "lujo", "fino"],
    ["ambiente_sofisticado", "sofisticado", "chic", "exclusivo"],
    ["reunion_negocios", "negocios", "ejecutivo", "reunión"],
    ["cumpleanos", "cumpleaños", "celebrar", "festejar"],
    ["afterwork", "afterwork", "after work", "salir del trabajo"],
    ["comida_italiana", "italiano", "italiana", "pasta", "pizza"],
    ["comida_asiatica", "asiático", "asiática", "sushi", "japonés", "ramen"],
    ["comida_mariscos", "mariscos", "pescado", "marisquería"],
    ["cortes_de_carne", "carne", "cortes", "parrilla", "steakhouse"],
    ["comida_criolla_gourmet", "dominicana", "criollo", "mofongo", "sancocho"],
  ].filter(([, ...terms]) => terms.some((term) => text.includes(term))).map(([tag]) => tag);

  const max_price = /barat|econ[oó]mic/.test(text) ? 2 : /caro|luj|exclusiv/.test(text) ? 4 : null;
  return { type, tags, max_price };
};

const parseJson = (text) => {
  const json = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return sanitizeFilters(JSON.parse(json));
};

export const parseUserQuery = async (message) => {
  if (!process.env.GEMINI_API_KEY) return localFallback(message);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite" });

  const prompt = `Eres un sistema que convierte texto en filtros para una base de datos de lugares elegantes y formales en Santo Domingo.
Devuelve SOLO JSON válido, sin explicación ni bloques Markdown.
Formato:
{"type":"restaurant | bar | cafe | null","tags":["string"],"max_price":number | null}
Tags válidos sugeridos: romantico, para_citas, chill, terraza, cocteleria, cocteleria_autor, vinos_selectos, musica_en_vivo, dj_en_vivo, para_amigos, para_trabajar, familiar, wifi, parking, valet_parking, desayuno, brunch, brunch_top, vegano, vistas_espectaculares, gourmet, elegante, exclusivo, ambiente_sofisticado, ambiente_acogedor, ambiente_festivo, buen_servicio, reunion_negocios, cumpleanos, afterwork, comida_italiana, comida_asiatica, comida_mariscos, cortes_de_carne, comida_criolla_gourmet.
Reglas: "barato" o "económico" significa max_price 2; "caro" o "lujoso" significa max_price 4; si no menciona tipo devuelve null; usa tags simples en minúsculas con guion bajo.
Texto: ${JSON.stringify(message)}`;

  try {
    const result = await model.generateContent(prompt);
    return parseJson(result.response.text());
  } catch (error) {
    console.error("Gemini parsing failed; using local intent parser:", error.message);
    return localFallback(message);
  }
};
