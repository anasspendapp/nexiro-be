import { ImageQuality, StyleInput } from "../gemini/gemini.types";

const TEXT_HD_FHD_CREDITS = 2;
const TEXT_4K_CREDITS = 8;
const IMAGE_HD_FHD_CREDITS = 4;
const IMAGE_4K_CREDITS = 10;

export const getEnhancementCredits = (
  styleInput: StyleInput,
  quality: ImageQuality,
): number => {
  const isImageStyle = styleInput.type === "IMAGE";
  const isTextStyle = styleInput.type === "TEXT";

  const isHdOrFhd = quality === ImageQuality.HD || quality === ImageQuality.FHD;
  const is4kOr8k =
    quality === ImageQuality.UHD_4K || quality === ImageQuality.UHD_8K;

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
