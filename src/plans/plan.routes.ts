import { Router } from "express";
import { planController } from "./plan.controller";

const router = Router();

// Get all plans
router.get("/", planController.getAllPlans);

// Get active plans
router.get("/active", planController.getActivePlans);

// Get plan by name
router.get("/name/:name", planController.getPlanByName);

// Get plan by ID
router.get("/:id", planController.getPlanById);

// Create new plan
router.post("/", planController.createPlan);

// Update plan
router.put("/:id", planController.updatePlan);

// Toggle plan active status
router.patch("/:id/toggle", planController.togglePlanStatus);

// Delete plan
router.delete("/:id", planController.deletePlan);

export default router;
