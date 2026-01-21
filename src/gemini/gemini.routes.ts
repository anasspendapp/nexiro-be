import { Router } from "express";
import { geminiProxy } from "./gemini.controller";

const router = Router();

// Gemini proxy endpoint
router.post("/gemini-proxy", geminiProxy);

export default router;
