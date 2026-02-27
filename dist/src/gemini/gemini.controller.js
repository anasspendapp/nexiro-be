"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiProxy = exports.enhanceImage = exports.analyzeReference = exports.analyzeImage = void 0;
const genai_1 = require("@google/genai");
const user_model_1 = require("../users/user.model");
const image_task_model_1 = require("../image-tasks/image-task.model");
const credits_1 = require("../utils/credits");
const gemini_types_1 = require("./gemini.types");
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
// Model names
const IMAGE_MODEL_NAME = "gemini-3.1-flash-image-preview";
const TEXT_MODEL_NAME = "gemini-3-pro-preview";
const FLASH_MODEL_NAME = "gemini-3-flash-preview";
// Internal helper to call Gemini API
const callGemini = async (model, contents, config) => {
    const aiResponse = await genAI.models.generateContent({
        model,
        contents,
        config,
    });
    return aiResponse;
};
/**
 * Analyze source image to identify ingredients/props/text
 * POST /api/analyze-image
 */
const analyzeImage = async (req, res) => {
    try {
        const { base64, toolType = gemini_types_1.ToolType.FOOD } = req.body;
        if (!base64) {
            return res.status(400).json({ error: "base64 image is required" });
        }
        const prompt = toolType === gemini_types_1.ToolType.FOOD
            ? "Analyze this food image. List the visible food ingredients (comma separated) and any non-food props."
            : "Analyze this product image. List visible text, brand names, logo details, and primary materials (e.g., clear glass, gold metal, matte plastic).";
        const rawResponse = await callGemini(FLASH_MODEL_NAME, [
            { inlineData: { mimeType: "image/jpeg", data: base64 } },
            { text: prompt },
        ], {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    details: {
                        type: "STRING",
                        description: "Comma separated list of key elements to preserve (ingredients or product text/materials)",
                    },
                    props: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "List of props/objects found in the image",
                    },
                },
            },
        });
        const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = text
            ? JSON.parse(text)
            : { details: "", props: [] };
        return res.json(result);
    }
    catch (error) {
        console.error("Analyze Image Error:", error);
        return res.status(500).json({ error: error.message || "Analysis failed" });
    }
};
exports.analyzeImage = analyzeImage;
/**
 * Analyze reference image to identify props
 * POST /api/analyze-reference
 */
const analyzeReference = async (req, res) => {
    try {
        const { referenceBase64 } = req.body;
        if (!referenceBase64) {
            return res
                .status(400)
                .json({ error: "referenceBase64 image is required" });
        }
        const rawResponse = await callGemini(FLASH_MODEL_NAME, [
            { inlineData: { mimeType: "image/jpeg", data: referenceBase64 } },
            {
                text: "Identify distinct props in this style reference image (e.g., vases, cutlery, flowers, stones, pedestals). Return only a list of items.",
            },
        ], {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    props: { type: "ARRAY", items: { type: "STRING" } },
                },
            },
        });
        const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        const data = text ? JSON.parse(text) : { props: [] };
        const result = { props: data.props || [] };
        return res.json(result);
    }
    catch (error) {
        console.error("Analyze Reference Error:", error);
        return res
            .status(500)
            .json({ error: error.message || "Reference analysis failed" });
    }
};
exports.analyzeReference = analyzeReference;
/**
 * Internal helper: Enhance style description from layman text to professional prompt
 */
const enhanceStyleDescription = async (laymanDescription, toolType) => {
    try {
        const context = toolType === gemini_types_1.ToolType.FOOD
            ? "Food Photographer"
            : "Product/Commercial Photographer";
        const rawResponse = await callGemini(TEXT_MODEL_NAME, [
            {
                text: `You are a world-class ${context} and Art Director.
Convert this user description into a high-end photography prompt.

User Input: "${laymanDescription}"

MANDATORY ENHANCEMENTS:
- Add lighting keywords.
- Add camera settings.
- Add texture and material keywords.

Output ONLY the enhanced prompt string.`,
            },
        ]);
        const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || laymanDescription;
    }
    catch (error) {
        console.error("Style enhancement error:", error);
        return laymanDescription;
    }
};
/**
 * Main image enhancement pipeline
 * POST /api/enhance-image
 */
const enhanceImage = async (req, res) => {
    let imageTask = null;
    try {
        const { sourceBase64, styleInput, options } = req.body;
        if (!sourceBase64) {
            return res.status(400).json({ error: "sourceBase64 is required" });
        }
        if (!styleInput) {
            return res.status(400).json({ error: "styleInput is required" });
        }
        if (!options) {
            return res.status(400).json({ error: "options are required" });
        }
        if (!req.user?.id) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const user = await user_model_1.User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let requiredCredits = (0, credits_1.getEnhancementCredits)(styleInput, options.quality);
        const currentCredits = Number(user.creditBalance);
        if (Number.isNaN(currentCredits)) {
            return res.status(500).json({ error: "Invalid user credit balance" });
        }
        if (currentCredits < requiredCredits) {
            return res.status(402).json({ error: "Insufficient credits" });
        }
        imageTask = await image_task_model_1.ImageTask.create({
            userId: user.id,
            status: image_task_model_1.TaskStatus.PROCESSING,
            inputDriveId: null,
            outputDriveId: null,
            cost: requiredCredits,
            config: {
                styleInput,
                options,
            },
        });
        const isFood = options.toolType === gemini_types_1.ToolType.FOOD;
        // --- PHASE A: PROMPT CONSTRUCTION ---
        let prompt = "";
        // A.1 Base prompt based on tool type
        if (isFood) {
            prompt = `
ROLE: You are an award-winning Commercial Food Photographer and Retoucher.
GOAL: Produce an 8K UHD, "Foodporn" quality image by compositing the [Source Food] into the requested [Style].

1. SUBJECT RESTORATION & LOCKING (CRITICAL):
   - The [Source Food] is the HERO. Do not morph it.
   ${options.productDescription ? `- IDENTITY: The dish is a "${options.productDescription}". Ensure authenticity.` : ""}
   - FIX DEFORMITIES: Repair blurry or broken textures.
   - INGREDIENTS: ${options.detectedSubjectDetails ? `Explicitly render these ingredients with high-fidelity: ${options.detectedSubjectDetails}.` : "Preserve visible ingredients."}
   - GEOMETRY: Keep plating structure 90% identical.

2. AESTHETICS:
   - TEXTURE: "Phased Array Ultrasonic Texture" logic—micro-details on crusts, muscle fibers, moisture.
   - GLISTENING: Specular highlights on fats/glazes.
   - ATMOSPHERE: Cinematic lighting.
    `;
        }
        else {
            // PRODUCT MODE
            prompt = `
ROLE: You are an award-winning Commercial Product Photographer specializing in Luxury Goods (Perfume, Cosmetics, Beverages).
GOAL: Produce an 8K UHD Advertising Campaign image by compositing the [Source Product] into the requested [Style].

1. SUBJECT LOCKING (NON-NEGOTIABLE):
   - The [Source Product] (bottle, box, container) must be PRESERVED EXACTLY.
   - TEXT & LOGOS: ${options.detectedSubjectDetails ? `Ensure these brand details remain legible and unaltered: ${options.detectedSubjectDetails}.` : "Do not hallucinate new text. Preserve original branding."}
   - SHAPE: Maintain the exact silhouette and aspect ratio of the product packaging.
   ${options.productDescription ? `- CONTEXT: The product is "${options.productDescription}".` : ""}

2. MATERIAL PHYSICS & AESTHETICS:
   - GLASS & LIQUID: Simulate correct Index of Refraction (IOR). Render realistic caustics, internal reflections, and liquid color/viscosity.
   - MATERIALS: Brushed metal caps, matte plastic containers, gold foil stamping must look hyper-realistic.
   - SURFACES: High-end studio polish. No dust, no scratches (unless requested).
   - LIGHTING: Commercial studio setup. Rim lighting to define edges. Softbox reflections on glossy surfaces.
    `;
        }
        // A.2 Composition & Camera Control
        prompt += `
2.5 COMPOSITION & CAMERA CONTROL:
  `;
        if (options.cameraAngle) {
            const angleMap = {
                [gemini_types_1.CameraAngle.TOP_DOWN]: "Flat Lay (90° Overhead). Geometric alignment.",
                [gemini_types_1.CameraAngle.EYE_LEVEL]: "Eye Level (0° Head-on). Hero stance.",
                [gemini_types_1.CameraAngle.MACRO]: "Macro Close-up. Shallow depth of field. Focus on texture/material details.",
                [gemini_types_1.CameraAngle.FORTY_FIVE]: "Standard Perspective (45°). Natural depth.",
            };
            prompt += `   - CAMERA ANGLE: ${angleMap[options.cameraAngle] || "Standard"}.\n`;
        }
        if (options.usageScenario) {
            switch (options.usageScenario) {
                case gemini_types_1.UsageScenario.ECOMMERCE_MENU:
                    prompt += `   - USAGE SCENARIO: ${isFood ? "E-Commerce Menu" : "Product Catalog"}. Clean composition. Entire subject visible. Neutral/Professional styling.\n`;
                    break;
                case gemini_types_1.UsageScenario.WEBSITE_HERO:
                    prompt += `   - USAGE SCENARIO: Website Hero Header. Wide cinematic shot. Negative space for text. Dramatic lighting.\n`;
                    break;
                case gemini_types_1.UsageScenario.SOCIAL_LIFESTYLE:
                default:
                    prompt += `   - USAGE SCENARIO: Social Media Lifestyle. ${isFood ? "Organic, messy-perfect vibe." : "Contextual environment (e.g., vanity table, bathroom counter, outdoor nature)."} Atmospheric depth of field.\n`;
                    break;
            }
        }
        // A.3 Custom User Instructions
        if (options.customInstructions && options.customInstructions.trim()) {
            prompt += `
2.6 SPECIAL INSTRUCTIONS (PRIORITY OVERWRITE):
   - STRICT ADHERENCE REQUIRED: "${options.customInstructions}"
    `;
        }
        // A.4 Style Branching
        if (styleInput.type === "IMAGE") {
            prompt += `
3. STYLE TRANSFER (VISUAL REFERENCE):
   - LIGHTING & COLOR: Copy light direction, hardness, and color palette from [Reference Image].
   - ENVIRONMENT: Place source into an environment matching the reference's texture/bokeh.
    `;
            if (options.excludedProps && options.excludedProps.length > 0) {
                prompt += `
4. EXCLUSION INSTRUCTIONS:
   - Do NOT include these props from the reference: [${options.excludedProps.join(", ")}].
      `;
            }
        }
        else {
            // TEXT style
            const enhancedPrompt = await enhanceStyleDescription(styleInput.description, options.toolType);
            prompt += `
3. STYLE EXECUTION (TEXT DESCRIPTION):
   - Execute: "${enhancedPrompt}"
    `;
        }
        // A.5 Background Mode
        switch (options.backgroundMode) {
            case gemini_types_1.BackgroundMode.TRANSPARENT:
                prompt += `\n   - BACKGROUND: Pure White or Transparent. Isolated subject.`;
                break;
            case gemini_types_1.BackgroundMode.COLOR:
                prompt += `\n   - BACKGROUND: Solid studio background in color ${options.backgroundColor || "#ffffff"}. Matte finish.`;
                break;
            case gemini_types_1.BackgroundMode.CUSTOM:
                prompt += `\n   - BACKGROUND: Composite subject naturally onto [Custom Background]. Match shadows/perspective.`;
                break;
            case gemini_types_1.BackgroundMode.KEEP_ORIGINAL:
                prompt += `\n   - BACKGROUND: Keep original background, denoise and upscale.`;
                break;
            default:
                // STYLE_MATCH
                prompt += `\n   - BACKGROUND: Generate background matching the Style Input.`;
                break;
        }
        // A.6 Negative Prompting
        prompt += `
NEGATIVE PROMPT:
- Low res, blur, noise, grain, jpeg artifacts.
- CGI, 3D render, painting, cartoon.
- Deformed subject, floating objects.
- ${isFood ? "Rotten food, unappetizing colors." : "Broken glass, smudged labels, warped text, wrong logo spelling."}
  `;
        // --- PHASE B: PARTS ASSEMBLY ---
        const parts = [
            { inlineData: { mimeType: "image/jpeg", data: sourceBase64 } },
        ];
        if (styleInput.type === "IMAGE") {
            parts.push({
                inlineData: { mimeType: "image/jpeg", data: styleInput.data },
            });
        }
        if (options.backgroundMode === gemini_types_1.BackgroundMode.CUSTOM &&
            options.customBackground) {
            parts.push({
                inlineData: { mimeType: "image/jpeg", data: options.customBackground },
            });
        }
        parts.push({ text: prompt });
        // --- PHASE C: EXECUTION ---
        const rawResponse = await callGemini(IMAGE_MODEL_NAME, [{ parts }], {
            imageConfig: {
                imageSize: options.quality,
                aspectRatio: options.aspectRatio,
            },
            safetySettings: [
                {
                    category: genai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: genai_1.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: genai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: genai_1.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: genai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: genai_1.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: genai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: genai_1.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });
        // Parse response for image
        if (rawResponse.candidates?.[0]?.content?.parts) {
            for (const part of rawResponse.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    await user.update({
                        creditBalance: currentCredits - requiredCredits,
                    });
                    if (imageTask) {
                        await imageTask.update({
                            status: image_task_model_1.TaskStatus.COMPLETED,
                        });
                    }
                    const result = {
                        imageBase64: part.inlineData.data,
                    };
                    return res.json(result);
                }
            }
        }
        throw new Error("Gemini returned no image data.");
    }
    catch (error) {
        console.error("Enhance Image Error:", error);
        if (imageTask) {
            await imageTask.update({ status: image_task_model_1.TaskStatus.FAILED });
        }
        return res
            .status(500)
            .json({ error: error.message || "Image enhancement failed" });
    }
};
exports.enhanceImage = enhanceImage;
/**
 * @deprecated Legacy proxy endpoint - kept for backward compatibility
 * Use /analyze-image, /analyze-reference, or /enhance-image instead
 */
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