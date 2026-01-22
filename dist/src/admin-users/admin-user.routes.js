"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_controller_1 = require("./admin-user.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
// Login route (public)
router.post("/login", admin_user_controller_1.adminUserController.login);
// CRUD routes (protected - require authentication)
router.get("/", auth_middleware_1.verifyAdminToken, admin_user_controller_1.adminUserController.getAllAdminUsers);
router.get("/:id", auth_middleware_1.verifyAdminToken, admin_user_controller_1.adminUserController.getAdminUserById);
router.post("/", auth_middleware_1.verifyAdminToken, admin_user_controller_1.adminUserController.createAdminUser);
router.put("/:id", auth_middleware_1.verifyAdminToken, admin_user_controller_1.adminUserController.updateAdminUser);
router.delete("/:id", auth_middleware_1.verifyAdminToken, admin_user_controller_1.adminUserController.deleteAdminUser);
exports.default = router;
//# sourceMappingURL=admin-user.routes.js.map