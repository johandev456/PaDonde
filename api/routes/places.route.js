import express from "express";
import { getPlaces, getPlace, addPlace, delPlace, addPlaceImage } from "../controllers/places.controller.js";

const router = express.Router();

router.get("/", getPlaces);
router.post("/", addPlace);
router.get("/:id", getPlace);
router.delete("/:id", delPlace);
router.post("/:id/images", addPlaceImage);

export default router;