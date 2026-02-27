import { Router } from "express";
import { userController } from "./user.controller";
import { verifyAdminToken, verifyUserToken } from "../utils/auth.middleware";

const router = Router();

router.get("/", verifyAdminToken, userController.getAllUsers);
router.get("/:id", verifyUserToken, userController.getUserById);
router.post("/", verifyAdminToken, userController.createUser);
router.put("/:id", verifyAdminToken, userController.updateUser);
router.delete("/:id", verifyAdminToken, userController.deleteUser);
router.get("/:id/credits", verifyUserToken, userController.getCreditBalance);

// Google OAuth authentication
router.post("/google-auth", userController.googleAuth);

// Get current user profile (renamed from verify-payment)
router.post("/me", verifyUserToken, userController.getCurrentUser);

// Update current user referral code (self-service)
router.patch(
  "/me/referral-code",
  verifyUserToken,
  userController.updateMyReferralCode,
);

// Test email sending (development only)
router.post("/test-email", userController.sendTestEmail);

export default router;
