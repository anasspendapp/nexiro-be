"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_controller_1 = require("./gemini.controller");
const router = (0, express_1.Router)();
// Gemini proxy endpoint
router.post("/gemini-proxy", gemini_controller_1.geminiProxy);
exports.default = router;
//# sourceMappingURL=gemini.routes.js.map