import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AspectRatio, ImageQuality, BackgroundMode, CameraAngle, UsageScenario, ToolType } from "../types";
import { API_URL } from "./authService"; // Reuse the API_URL logic

const IMAGE_MODEL_NAME = 'gemini-3-pro-image-preview';
const TEXT_MODEL_NAME = 'gemini-3-pro-preview';
const FLASH_MODEL_NAME = 'gemini-3-flash-preview';

// --- Types ---

export type StyleInput =
  | { type: 'IMAGE'; data: string }
  | { type: 'TEXT'; description: string };

export interface EnhancementOptions {
  toolType: ToolType;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  backgroundMode?: BackgroundMode; // Optional now, defaults to Style Match
  customBackground?: string | null;
  backgroundColor?: string; // Hex color code
  excludedProps?: string[]; // Props from reference to EXCLUDE
  detectedSubjectDetails?: string; // For subject locking (Ingredients or Product Details)
  useHighFidelity?: boolean; // Enforce strict 8K realism
  cameraAngle?: CameraAngle;
  usageScenario?: UsageScenario;
  customInstructions?: string; // User-defined specific constraints
  productDescription?: string; // User-defined context (e.g. "Spicy Chicken Sandwich" or "Chanel No.5")
}

/**
 * 1. ANALYSIS PIPELINE
 * Identifies ingredients/props/text in the SOURCE image for preservation.
 */
// Helper to call backend proxy
const callGeminiProxy = async (model: string, contents: any[], config?: any) => {
  const response = await fetch(`${API_URL}/gemini-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, contents, config })
  });

  if (!response.ok) {
    throw new Error(`Gemini Proxy Failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const analyzeImage = async (base64: string, toolType: ToolType = 'FOOD'): Promise<{ details: string; props: string[] }> => {
  const prompt = toolType === 'FOOD'
    ? "Analyze this food image. List the visible food ingredients (comma separated) and any non-food props."
    : "Analyze this product image. List visible text, brand names, logo details, and primary materials (e.g., clear glass, gold metal, matte plastic).";

  try {
    const rawResponse = await callGeminiProxy(FLASH_MODEL_NAME,
      [
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        { text: prompt }
      ],
      {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT', // Using string type to avoid importing Type enum if possible, or keep import
          properties: {
            details: { type: 'STRING', description: "Comma separated list of key elements to preserve (ingredients or product text/materials)" },
            props: { type: 'ARRAY', items: { type: 'STRING' }, description: "List of props/objects found in the image" }
          }
        }
      }
    );

    // The backend returns the raw structured response. 
    // We need to extract the text content similar to how the SDK did it.
    // The structure typically is { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
    const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : { details: "", props: [] };
  } catch (error) {
    console.error("Analysis failed:", error);
    return { details: "", props: [] };
  }
};

/**
 * 2. REFERENCE ANALYSIS (Helper)
 * Analyzes a REFERENCE image to identify props that the user might want to EXCLUDE.
 */
export const analyzeReferenceProps = async (referenceBase64: string): Promise<string[]> => {
  try {
    const rawResponse = await callGeminiProxy(FLASH_MODEL_NAME,
      [
        { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } },
        { text: "Identify distinct props in this style reference image (e.g., vases, cutlery, flowers, stones, pedestals). Return only a list of items." }
      ],
      {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            props: { type: 'ARRAY', items: { type: 'STRING' } }
          }
        }
      }
    );
    const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = text ? JSON.parse(text) : { props: [] };
    return data.props || [];
  } catch (error) {
    console.warn("Reference analysis failed:", error);
    return [];
  }
};

/**
 * 3. STYLE ENHANCEMENT (Helper)
 * Expands a layman's text description into a professional photography prompt.
 */
export const enhanceStyleDescription = async (laymanDescription: string, toolType: ToolType): Promise<string> => {
  try {
    const context = toolType === 'FOOD' ? "Food Photographer" : "Product/Commercial Photographer";
    const rawResponse = await callGeminiProxy(TEXT_MODEL_NAME,
      [
        {
          text: `You are a world-class ${context} and Art Director.
      Convert this user description into a high-end photography prompt.
      
      User Input: "${laymanDescription}"
      
      MANDATORY ENHANCEMENTS:
      - Add lighting keywords.
      - Add camera settings.
      - Add texture and material keywords.
      
      Output ONLY the enhanced prompt string.`
        }
      ]
    );
    const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || laymanDescription;
  } catch (error) {
    return laymanDescription;
  }
};

/**
 * 4. MAIN GENERATION PIPELINE
 * Handles sophisticated style transfer with Subject Locking and 8K Fidelity.
 */
export const enhanceImage = async (
  sourceBase64: string,
  styleInput: StyleInput,
  options: EnhancementOptions
): Promise<string> => {
  const isFood = options.toolType === 'FOOD';

  // --- A. Construct the Base Prompt (Universal Requirements) ---
  let prompt = "";

  if (isFood) {
    prompt = `
    ROLE: You are an award-winning Commercial Food Photographer and Retoucher.
    GOAL: Produce an 8K UHD, "Foodporn" quality image by compositing the [Source Food] into the requested [Style].
    
    1. SUBJECT RESTORATION & LOCKING (CRITICAL):
       - The [Source Food] is the HERO. Do not morph it.
       ${options.productDescription ? `- IDENTITY: The dish is a "${options.productDescription}". Ensure authenticity.` : ''}
       - FIX DEFORMITIES: Repair blurry or broken textures.
       - INGREDIENTS: ${options.detectedSubjectDetails ? `Explicitly render these ingredients with high-fidelity: ${options.detectedSubjectDetails}.` : 'Preserve visible ingredients.'}
       - GEOMETRY: Keep plating structure 90% identical.

    2. AESTHETICS:
       - TEXTURE: "Phased Array Ultrasonic Texture" logic—micro-details on crusts, muscle fibers, moisture.
       - GLISTENING: Specular highlights on fats/glazes.
       - ATMOSPHERE: Cinematic lighting.
    `;
  } else {
    // PRODUCT / PERFUME MODE
    prompt = `
    ROLE: You are an award-winning Commercial Product Photographer specializing in Luxury Goods (Perfume, Cosmetics, Beverages).
    GOAL: Produce an 8K UHD Advertising Campaign image by compositing the [Source Product] into the requested [Style].
    
    1. SUBJECT LOCKING (NON-NEGOTIABLE):
       - The [Source Product] (bottle, box, container) must be PRESERVED EXACTLY. 
       - TEXT & LOGOS: ${options.detectedSubjectDetails ? `Ensure these brand details remain legible and unaltered: ${options.detectedSubjectDetails}.` : 'Do not hallucinate new text. Preserve original branding.'}
       - SHAPE: Maintain the exact silhouette and aspect ratio of the product packaging.
       ${options.productDescription ? `- CONTEXT: The product is "${options.productDescription}".` : ''}

    2. MATERIAL PHYSICS & AESTHETICS:
       - GLASS & LIQUID: Simulate correct Index of Refraction (IOR). Render realistic caustics, internal reflections, and liquid color/viscosity.
       - MATERIALS: Brushed metal caps, matte plastic containers, gold foil stamping must look hyper-realistic.
       - SURFACES: High-end studio polish. No dust, no scratches (unless requested).
       - LIGHTING: Commercial studio setup. Rim lighting to define edges. Softbox reflections on glossy surfaces.
    `;
  }

  // --- A.1 Composition & Camera Control ---
  prompt += `
    2.5 COMPOSITION & CAMERA CONTROL:
  `;

  // Camera Angle Logic
  if (options.cameraAngle) {
    const angleMap = {
      [CameraAngle.TOP_DOWN]: "Flat Lay (90° Overhead). Geometric alignment.",
      [CameraAngle.EYE_LEVEL]: "Eye Level (0° Head-on). Hero stance.",
      [CameraAngle.MACRO]: "Macro Close-up. Shallow depth of field. Focus on texture/material details.",
      [CameraAngle.FORTY_FIVE]: "Standard Perspective (45°). Natural depth."
    };
    prompt += `   - CAMERA ANGLE: ${angleMap[options.cameraAngle] || "Standard"}.\n`;
  }

  // Usage Scenario Logic
  if (options.usageScenario) {
    switch (options.usageScenario) {
      case UsageScenario.ECOMMERCE_MENU:
        prompt += `   - USAGE SCENARIO: ${isFood ? 'E-Commerce Menu' : 'Product Catalog'}. Clean composition. Entire subject visible. Neutral/Professional styling.\n`;
        break;
      case UsageScenario.WEBSITE_HERO:
        prompt += `   - USAGE SCENARIO: Website Hero Header. Wide cinematic shot. Negative space for text. Dramatic lighting.\n`;
        break;
      case UsageScenario.SOCIAL_LIFESTYLE:
      default:
        prompt += `   - USAGE SCENARIO: Social Media Lifestyle. ${isFood ? 'Organic, messy-perfect vibe.' : 'Contextual environment (e.g., vanity table, bathroom counter, outdoor nature).'} Atmospheric depth of field.\n`;
        break;
    }
  }

  // --- A.2 Custom User Instructions ---
  if (options.customInstructions && options.customInstructions.trim().length > 0) {
    prompt += `
    2.6 SPECIAL INSTRUCTIONS (PRIORITY OVERWRITE):
       - STRICT ADHERENCE REQUIRED: "${options.customInstructions}"
    `;
  }

  // --- B. Branching Logic for Style ---

  if (styleInput.type === 'IMAGE') {
    prompt += `
    3. STYLE TRANSFER (VISUAL REFERENCE):
       - LIGHTING & COLOR: Copy light direction, hardness, and color palette from [Reference Image].
       - ENVIRONMENT: Place source into an environment matching the reference's texture/bokeh.
    `;

    if (options.excludedProps && options.excludedProps.length > 0) {
      prompt += `
      4. EXCLUSION INSTRUCTIONS:
         - Do NOT include these props from the reference: [${options.excludedProps.join(', ')}].
      `;
    }

  } else {
    // BRANCH B: Text-Based Style Generation
    const enhancedPrompt = await enhanceStyleDescription(styleInput.description, options.toolType);
    prompt += `
    3. STYLE EXECUTION (TEXT DESCRIPTION):
       - Execute: "${enhancedPrompt}"
    `;
  }

  // --- C. Background Specifics ---
  switch (options.backgroundMode) {
    case BackgroundMode.TRANSPARENT:
      prompt += `\n   - BACKGROUND: Pure White or Transparent. Isolated subject.`;
      break;
    case BackgroundMode.COLOR:
      prompt += `\n   - BACKGROUND: Solid studio background in color ${options.backgroundColor || '#ffffff'}. Matte finish.`;
      break;
    case BackgroundMode.CUSTOM:
      prompt += `\n   - BACKGROUND: Composite subject naturally onto [Custom Background]. Match shadows/perspective.`;
      break;
    case BackgroundMode.KEEP_ORIGINAL:
      prompt += `\n   - BACKGROUND: Keep original background, denoise and upscale.`;
      break;
    default: // Reference Style
      prompt += `\n   - BACKGROUND: Generate background matching the Style Input.`;
      break;
  }

  // --- D. Negative Prompting ---
  prompt += `
    NEGATIVE PROMPT:
    - Low res, blur, noise, grain, jpeg artifacts.
    - CGI, 3D render, painting, cartoon.
    - Deformed subject, floating objects.
    - ${isFood ? 'Rotten food, unappetizing colors.' : 'Broken glass, smudged labels, warped text, wrong logo spelling.'}
  `;

  // --- E. Assembly ---
  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: sourceBase64 } }
  ];

  if (styleInput.type === 'IMAGE') {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: styleInput.data } });
  }

  if (options.backgroundMode === BackgroundMode.CUSTOM && options.customBackground) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: options.customBackground } });
  }

  parts.push({ text: prompt });

  // --- F. Execution ---
  // --- F. Execution ---
  try {
    const rawResponse = await callGeminiProxy(IMAGE_MODEL_NAME,
      [{ parts }], // wrap parts in an array as expected by API structure: contents: [{ parts: [...] }]
      {
        imageConfig: {
          imageSize: options.quality,
          aspectRatio: options.aspectRatio
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      }
    );

    // Parse Response
    if (rawResponse.candidates?.[0]?.content?.parts) {
      for (const part of rawResponse.candidates[0].content.parts) {
        // The backend returns standard JSON structure where inlineData might be represented differently
        // or just as inlineData object.
        if (part.inlineData?.data) return part.inlineData.data;
      }
    }
    throw new Error("Gemini returned no image data.");

  } catch (error) {
    console.error("Gemini Enhancement Pipeline Error:", error);
    throw error;
  }
};