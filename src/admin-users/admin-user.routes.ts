import { Router } from "express";
import { adminUserController } from "./admin-user.controller";
import { verifyToken, verifyAdminToken } from "../utils/auth.middleware";

const router = Router();

// Login route (public)
router.post("/login", adminUserController.login);

// CRUD routes (protected - require authentication)
router.get("/", verifyAdminToken, adminUserController.getAllAdminUsers);
router.get("/:id", verifyAdminToken, adminUserController.getAdminUserById);
router.post("/", verifyAdminToken, adminUserController.createAdminUser);
router.put("/:id", verifyAdminToken, adminUserController.updateAdminUser);
router.delete("/:id", verifyAdminToken, adminUserController.deleteAdminUser);

export default router;
