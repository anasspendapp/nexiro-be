// Enums for Gemini image enhancement

export enum ToolType {
  FOOD = "FOOD",
  PRODUCT = "PRODUCT",
}

export enum AspectRatio {
  SQUARE = "1:1",
  LANDSCAPE = "16:9",
  PORTRAIT = "9:16",
  STANDARD = "4:3",
}

export enum ImageQuality {
  HD = "1K",
  FHD = "2K",
  UHD_4K = "4K",
  UHD_8K = "8K",
}

export enum BackgroundMode {
  TRANSPARENT = "TRANSPARENT",
  COLOR = "COLOR",
  CUSTOM = "CUSTOM",
  KEEP_ORIGINAL = "KEEP_ORIGINAL",
  STYLE_MATCH = "STYLE_MATCH", // Default - matches reference style
}

export enum CameraAngle {
  TOP_DOWN = "TOP_DOWN",
  EYE_LEVEL = "EYE_LEVEL",
  MACRO = "MACRO",
  FORTY_FIVE = "FORTY_FIVE",
}

export enum UsageScenario {
  ECOMMERCE_MENU = "ECOMMERCE_MENU",
  WEBSITE_HERO = "WEBSITE_HERO",
  SOCIAL_LIFESTYLE = "SOCIAL_LIFESTYLE",
}

// Types for style input (discriminated union)
export type StyleInput =
  | { type: "IMAGE"; data: string }
  | { type: "TEXT"; description: string };

// Enhancement options interface
export interface EnhancementOptions {
  toolType: ToolType;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  backgroundMode?: BackgroundMode;
  customBackground?: string | null;
  backgroundColor?: string; // Hex color code
  excludedProps?: string[];
  detectedSubjectDetails?: string;
  useHighFidelity?: boolean;
  cameraAngle?: CameraAngle;
  usageScenario?: UsageScenario;
  customInstructions?: string;
  productDescription?: string;
}

// Request/Response types for API endpoints

export interface AnalyzeImageRequest {
  base64: string;
  toolType?: ToolType;
}

export interface AnalyzeImageResponse {
  details: string;
  props: string[];
}

export interface AnalyzeReferenceRequest {
  referenceBase64: string;
}

export interface AnalyzeReferenceResponse {
  props: string[];
}

export interface EnhanceImageRequest {
  sourceBase64: string;
  styleInput: StyleInput;
  options: EnhancementOptions;
}

export interface EnhanceImageResponse {
  imageBase64: string;
}
