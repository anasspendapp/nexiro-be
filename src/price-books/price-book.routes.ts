import { Router } from "express";
import { priceBookController } from "./price-book.controller";
import { verifyAdminToken } from "../utils/auth.middleware";

const router = Router();

router.get("/current/plans", priceBookController.getCurrentPlans);

router.get("/", verifyAdminToken, priceBookController.getAllPriceBooks);
router.get("/current", verifyAdminToken, priceBookController.getCurrentPrice);
router.get(
  "/current/plans/:planName",
  verifyAdminToken,
  priceBookController.getPlanByName,
);
router.get("/:id", verifyAdminToken, priceBookController.getPriceBookById);
router.post("/", verifyAdminToken, priceBookController.createPriceBook);
router.put("/:id", verifyAdminToken, priceBookController.updatePriceBook);
router.delete("/:id", verifyAdminToken, priceBookController.deletePriceBook);

export default router;
