"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.verifyAdminToken, user_controller_1.userController.getAllUsers);
router.get("/:id", auth_middleware_1.verifyUserToken, user_controller_1.userController.getUserById);
router.post("/", auth_middleware_1.verifyAdminToken, user_controller_1.userController.createUser);
router.put("/:id", auth_middleware_1.verifyAdminToken, user_controller_1.userController.updateUser);
router.delete("/:id", auth_middleware_1.verifyAdminToken, user_controller_1.userController.deleteUser);
router.get("/:id/credits", auth_middleware_1.verifyUserToken, user_controller_1.userController.getCreditBalance);
// Google OAuth authentication
router.post("/google-auth", user_controller_1.userController.googleAuth);
// Get current user profile (renamed from verify-payment)
router.post("/me", auth_middleware_1.verifyUserToken, user_controller_1.userController.getCurrentUser);
// Update current user referral code (self-service)
router.patch("/me/referral-code", auth_middleware_1.verifyUserToken, user_controller_1.userController.updateMyReferralCode);
// Test email sending (development only)
router.post("/test-email", user_controller_1.userController.sendTestEmail);
exports.default = router;
//# sourceMappingURL=user.routes.js.map