import { Response } from "express";
import { AuthRequest } from "../utils/auth.middleware";
/**
 * Analyze source image to identify ingredients/props/text
 * POST /api/analyze-image
 */
export declare const analyzeImage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Analyze reference image to identify props
 * POST /api/analyze-reference
 */
export declare const analyzeReference: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Main image enhancement pipeline
 * POST /api/enhance-image
 */
export declare const enhanceImage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * @deprecated Legacy proxy endpoint - kept for backward compatibility
 * Use /analyze-image, /analyze-reference, or /enhance-image instead
 */
export declare const geminiProxy: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=gemini.controller.d.ts.map