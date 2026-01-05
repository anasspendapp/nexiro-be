import { Router } from "express";
import { ledgerController } from "./ledger.controller";

const router = Router();

router.get("/", ledgerController.getAllEntries);
router.get("/user/:userId", ledgerController.getEntriesByUserId);
router.get("/user/:userId/history", ledgerController.getBalanceHistory);
router.get("/:id", ledgerController.getEntryById);
router.post("/", ledgerController.createEntry);

// Note: No PUT/PATCH/DELETE routes - ledger is append-only and immutable

export default router;
