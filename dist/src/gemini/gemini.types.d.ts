export declare enum ToolType {
    FOOD = "FOOD",
    PRODUCT = "PRODUCT"
}
export declare enum AspectRatio {
    SQUARE = "1:1",
    LANDSCAPE = "16:9",
    PORTRAIT = "9:16",
    STANDARD = "4:3"
}
export declare enum ImageQuality {
    HD = "1K",
    FHD = "2K",
    UHD_4K = "4K",
    UHD_8K = "8K"
}
export declare enum BackgroundMode {
    TRANSPARENT = "TRANSPARENT",
    COLOR = "COLOR",
    CUSTOM = "CUSTOM",
    KEEP_ORIGINAL = "KEEP_ORIGINAL",
    STYLE_MATCH = "STYLE_MATCH"
}
export declare enum CameraAngle {
    TOP_DOWN = "TOP_DOWN",
    EYE_LEVEL = "EYE_LEVEL",
    MACRO = "MACRO",
    FORTY_FIVE = "FORTY_FIVE"
}
export declare enum UsageScenario {
    ECOMMERCE_MENU = "ECOMMERCE_MENU",
    WEBSITE_HERO = "WEBSITE_HERO",
    SOCIAL_LIFESTYLE = "SOCIAL_LIFESTYLE"
}
export type StyleInput = {
    type: "IMAGE";
    data: string;
} | {
    type: "TEXT";
    description: string;
};
export interface EnhancementOptions {
    toolType: ToolType;
    aspectRatio: AspectRatio;
    quality: ImageQuality;
    backgroundMode?: BackgroundMode;
    customBackground?: string | null;
    backgroundColor?: string;
    excludedProps?: string[];
    detectedSubjectDetails?: string;
    useHighFidelity?: boolean;
    cameraAngle?: CameraAngle;
    usageScenario?: UsageScenario;
    customInstructions?: string;
    productDescription?: string;
}
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
//# sourceMappingURL=gemini.types.d.ts.map