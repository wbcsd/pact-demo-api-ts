import express from "express";
import { getToken } from "../controllers/authController";

const router = express.Router();

router.post("/token", getToken);

export default router;
