"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const stripe_controller_1 = require("./stripe.controller");
const router = (0, express_1.Router)();
// Webhook endpoint (uses raw body parser)
router.post("/webhook", express_2.default.raw({ type: "application/json" }), stripe_controller_1.handleWebhook);
// Create checkout session
router.post("/create-checkout-session", stripe_controller_1.createCheckoutSession);
exports.default = router;
//# sourceMappingURL=stripe.routes.js.map