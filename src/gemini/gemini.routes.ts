import { Router } from "express";
import {
  geminiProxy,
  analyzeImage,
  analyzeReference,
  enhanceImage,
} from "./gemini.controller";
import { verifyUserToken } from "../utils/auth.middleware";

const router = Router();

// New parameter-based endpoints (protected)
router.post("/analyze-image", verifyUserToken, analyzeImage);
router.post("/analyze-reference", verifyUserToken, analyzeReference);
router.post("/enhance-image", verifyUserToken, enhanceImage);

// Legacy proxy endpoint (deprecated - kept for backward compatibility)
router.post("/gemini-proxy", verifyUserToken, geminiProxy);

export default router;
