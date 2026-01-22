"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiProxy = void 0;
const genai_1 = require("@google/genai");
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
// Gemini proxy handler
const geminiProxy = async (req, res) => {
    try {
        const { model, contents, config } = req.body;
        const aiResponse = await genAI.models.generateContent({
            model: model,
            contents: contents,
            config: config,
        });
        return res.json(aiResponse);
    }
    catch (error) {
        console.error("Gemini Proxy Error:", error);
        return res
            .status(500)
            .json({ error: error.message || "Gemini Proxy Failed" });
    }
};
exports.geminiProxy = geminiProxy;
//# sourceMappingURL=gemini.controller.js.map