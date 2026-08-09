import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import placesRoutes from "./routes/places.route.js";
import searchRoutes from "./routes/search.route.js";
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/places", placesRoutes);
app.use("/api/search", searchRoutes);


if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`PaDonde API running on http://localhost:${port}`));
}

export default app;
