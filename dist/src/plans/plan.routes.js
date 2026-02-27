"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plan_controller_1 = require("./plan.controller");
const router = (0, express_1.Router)();
// Get all plans
router.get("/", plan_controller_1.planController.getAllPlans);
// Get active plans
router.get("/active", plan_controller_1.planController.getActivePlans);
// Get plan by name
router.get("/name/:name", plan_controller_1.planController.getPlanByName);
// Get plan by ID
router.get("/:id", plan_controller_1.planController.getPlanById);
// Create new plan
router.post("/", plan_controller_1.planController.createPlan);
// Update plan
router.put("/:id", plan_controller_1.planController.updatePlan);
// Toggle plan active status
router.patch("/:id/toggle", plan_controller_1.planController.togglePlanStatus);
// Delete plan
router.delete("/:id", plan_controller_1.planController.deletePlan);
exports.default = router;
//# sourceMappingURL=plan.routes.js.map