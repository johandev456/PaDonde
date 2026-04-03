import "dotenv/config"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import placesRoutes from "./routes/places.route.js"
import searchRoutes from "./routes/search.route.js"
const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/places", placesRoutes)
app.use("/api/search", searchRoutes)


app.listen(process.env.PORT,()=>{
    console.log("Ta prendio!")
})