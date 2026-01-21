import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Gemini proxy handler
export const geminiProxy = async (req: Request, res: Response) => {
  try {
    const { model, contents, config } = req.body;

    const aiResponse = await genAI.models.generateContent({
      model: model,
      contents: contents,
      config: config,
    });

    return res.json(aiResponse);
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Gemini Proxy Failed" });
  }
};
