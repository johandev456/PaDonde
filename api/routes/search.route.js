import express from "express";

import { searchPlaces } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/", searchPlaces);

export default router;