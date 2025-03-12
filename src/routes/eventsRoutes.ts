import express from "express";
import { handleWebhook } from "../controllers/eventsController";

const router = express.Router();

router.post("/", handleWebhook);

export default router;
