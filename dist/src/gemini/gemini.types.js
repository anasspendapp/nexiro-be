"use strict";
// Enums for Gemini image enhancement
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageScenario = exports.CameraAngle = exports.BackgroundMode = exports.ImageQuality = exports.AspectRatio = exports.ToolType = void 0;
var ToolType;
(function (ToolType) {
    ToolType["FOOD"] = "FOOD";
    ToolType["PRODUCT"] = "PRODUCT";
})(ToolType || (exports.ToolType = ToolType = {}));
var AspectRatio;
(function (AspectRatio) {
    AspectRatio["SQUARE"] = "1:1";
    AspectRatio["LANDSCAPE"] = "16:9";
    AspectRatio["PORTRAIT"] = "9:16";
    AspectRatio["STANDARD"] = "4:3";
})(AspectRatio || (exports.AspectRatio = AspectRatio = {}));
var ImageQuality;
(function (ImageQuality) {
    ImageQuality["HD"] = "1K";
    ImageQuality["FHD"] = "2K";
    ImageQuality["UHD_4K"] = "4K";
    ImageQuality["UHD_8K"] = "8K";
})(ImageQuality || (exports.ImageQuality = ImageQuality = {}));
var BackgroundMode;
(function (BackgroundMode) {
    BackgroundMode["TRANSPARENT"] = "TRANSPARENT";
    BackgroundMode["COLOR"] = "COLOR";
    BackgroundMode["CUSTOM"] = "CUSTOM";
    BackgroundMode["KEEP_ORIGINAL"] = "KEEP_ORIGINAL";
    BackgroundMode["STYLE_MATCH"] = "STYLE_MATCH";
})(BackgroundMode || (exports.BackgroundMode = BackgroundMode = {}));
var CameraAngle;
(function (CameraAngle) {
    CameraAngle["TOP_DOWN"] = "TOP_DOWN";
    CameraAngle["EYE_LEVEL"] = "EYE_LEVEL";
    CameraAngle["MACRO"] = "MACRO";
    CameraAngle["FORTY_FIVE"] = "FORTY_FIVE";
})(CameraAngle || (exports.CameraAngle = CameraAngle = {}));
var UsageScenario;
(function (UsageScenario) {
    UsageScenario["ECOMMERCE_MENU"] = "ECOMMERCE_MENU";
    UsageScenario["WEBSITE_HERO"] = "WEBSITE_HERO";
    UsageScenario["SOCIAL_LIFESTYLE"] = "SOCIAL_LIFESTYLE";
})(UsageScenario || (exports.UsageScenario = UsageScenario = {}));
//# sourceMappingURL=gemini.types.js.map