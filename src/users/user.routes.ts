import { Router } from "express";
import { userController } from "./user.controller";
import {
  verifyAdminToken,
  verifyUserToken,
  verifySelfAccess,
} from "../utils/auth.middleware";

const router = Router();

router.get("/", verifyAdminToken, userController.getAllUsers);
router.get(
  "/:id",
  verifyUserToken,
  verifySelfAccess,
  userController.getUserById,
);
router.post("/", userController.createUser);
router.put(
  "/:id",
  verifyUserToken,
  verifySelfAccess,
  userController.updateUser,
);
router.delete(
  "/:id",
  verifyUserToken,
  verifySelfAccess,
  userController.deleteUser,
);
router.get(
  "/:id/credits",
  verifyUserToken,
  verifySelfAccess,
  userController.getCreditBalance,
);

// Google OAuth authentication
router.post("/google-auth", userController.googleAuth);

// Get current user profile (renamed from verify-payment)
router.post("/me", verifyUserToken, userController.getCurrentUser);

export default router;
