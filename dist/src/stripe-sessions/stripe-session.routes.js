"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_session_controller_1 = require("./stripe-session.controller");
const router = (0, express_1.Router)();
router.get("/", stripe_session_controller_1.stripeSessionController.getAllSessions);
router.get("/user/:userId", stripe_session_controller_1.stripeSessionController.getSessionsByUserId);
router.get("/stripe/:stripeId", stripe_session_controller_1.stripeSessionController.getSessionByStripeId);
router.get("/:id", stripe_session_controller_1.stripeSessionController.getSessionById);
router.post("/", stripe_session_controller_1.stripeSessionController.createSession);
router.patch("/:id/status", stripe_session_controller_1.stripeSessionController.updateSessionStatus);
router.put("/:id", stripe_session_controller_1.stripeSessionController.updateSession);
router.delete("/:id", stripe_session_controller_1.stripeSessionController.deleteSession);
exports.default = router;
//# sourceMappingURL=stripe-session.routes.js.map