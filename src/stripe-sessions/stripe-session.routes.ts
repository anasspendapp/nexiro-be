import { Router } from "express";
import { stripeSessionController } from "./stripe-session.controller";

const router = Router();

router.get("/", stripeSessionController.getAllSessions);
router.get("/user/:userId", stripeSessionController.getSessionsByUserId);
router.get("/stripe/:stripeId", stripeSessionController.getSessionByStripeId);
router.get("/:id", stripeSessionController.getSessionById);
router.post("/", stripeSessionController.createSession);
router.patch("/:id/status", stripeSessionController.updateSessionStatus);
router.put("/:id", stripeSessionController.updateSession);
router.delete("/:id", stripeSessionController.deleteSession);

export default router;
