import express from "express";
import { handleWebhook } from "../controllers/eventsController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticateJWT, handleWebhook);

export default router;
