"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnhancementCredits = void 0;
const gemini_types_1 = require("../gemini/gemini.types");
const TEXT_HD_FHD_CREDITS = 2;
const TEXT_4K_CREDITS = 8;
const IMAGE_HD_FHD_CREDITS = 4;
const IMAGE_4K_CREDITS = 10;
const getEnhancementCredits = (styleInput, quality) => {
    const isImageStyle = styleInput.type === "IMAGE";
    const isTextStyle = styleInput.type === "TEXT";
    const isHdOrFhd = quality === gemini_types_1.ImageQuality.HD || quality === gemini_types_1.ImageQuality.FHD;
    const is4kOr8k = quality === gemini_types_1.ImageQuality.UHD_4K || quality === gemini_types_1.ImageQuality.UHD_8K;
    if (!isImageStyle && !isTextStyle) {
        throw new Error("Unsupported style input type");
    }
    if (!isHdOrFhd && !is4kOr8k) {
        throw new Error("Unsupported image quality");
    }
    if (isTextStyle) {
        return isHdOrFhd ? TEXT_HD_FHD_CREDITS : TEXT_4K_CREDITS;
    }
    return isHdOrFhd ? IMAGE_HD_FHD_CREDITS : IMAGE_4K_CREDITS;
};
exports.getEnhancementCredits = getEnhancementCredits;
//# sourceMappingURL=credits.js.map