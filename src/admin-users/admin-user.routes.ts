import { Router } from "express";
import { adminUserController } from "./admin-user.controller";

const router = Router();

// Login route
router.post("/login", adminUserController.login);

// CRUD routes
router.get("/", adminUserController.getAllAdminUsers);
router.get("/:id", adminUserController.getAdminUserById);
router.post("/", adminUserController.createAdminUser);
router.put("/:id", adminUserController.updateAdminUser);
router.delete("/:id", adminUserController.deleteAdminUser);

export default router;
