"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.verifyAdminToken, user_controller_1.userController.getAllUsers);
router.get("/:id", user_controller_1.userController.getUserById);
router.post("/", user_controller_1.userController.createUser);
router.put("/:id", user_controller_1.userController.updateUser);
router.delete("/:id", user_controller_1.userController.deleteUser);
router.get("/:id/credits", user_controller_1.userController.getCreditBalance);
// Google OAuth authentication
router.post("/google-auth", user_controller_1.userController.googleAuth);
// Get current user profile (renamed from verify-payment)
router.post("/me", user_controller_1.userController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map