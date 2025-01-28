import express from "express";
import {
  getFootprints,
  getFootprintById,
} from "../controllers/footprintController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

// Route to fetch all footprints with optional filters
router.get("/", authenticateJWT, getFootprints);

// Route to fetch a single footprint by ID
router.get("/:id", authenticateJWT, getFootprintById);

export default router;
