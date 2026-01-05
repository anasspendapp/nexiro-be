import { Router } from "express";
import { priceBookController } from "./price-book.controller";

const router = Router();

router.get("/", priceBookController.getAllPriceBooks);
router.get("/current", priceBookController.getCurrentPrice);
router.get("/:id", priceBookController.getPriceBookById);
router.post("/", priceBookController.createPriceBook);
router.put("/:id", priceBookController.updatePriceBook);
router.delete("/:id", priceBookController.deletePriceBook);

export default router;
