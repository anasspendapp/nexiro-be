"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_controller_1 = require("./stripe.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
// Webhook endpoint (uses raw body parser)
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   handleWebhook,
// );
// Create checkout session
router.post("/create-checkout-session", auth_middleware_1.verifyUserToken, stripe_controller_1.createCheckoutSession);
exports.default = router;
//# sourceMappingURL=stripe.routes.js.map