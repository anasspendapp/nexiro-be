"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_controller_1 = require("./gemini.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
// New parameter-based endpoints (protected)
router.post("/analyze-image", auth_middleware_1.verifyUserToken, gemini_controller_1.analyzeImage);
router.post("/analyze-reference", auth_middleware_1.verifyUserToken, gemini_controller_1.analyzeReference);
router.post("/enhance-image", auth_middleware_1.verifyUserToken, gemini_controller_1.enhanceImage);
// Legacy proxy endpoint (deprecated - kept for backward compatibility)
router.post("/gemini-proxy", auth_middleware_1.verifyUserToken, gemini_controller_1.geminiProxy);
exports.default = router;
//# sourceMappingURL=gemini.routes.js.map