import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/:id/credits", userController.getCreditBalance);

// Google OAuth authentication
router.post("/google-auth", userController.googleAuth);

// Get current user profile (renamed from verify-payment)
router.post("/me", userController.getCurrentUser);

export default router;
