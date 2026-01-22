"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_controller_1 = require("./ledger.controller");
const router = (0, express_1.Router)();
router.get("/", ledger_controller_1.ledgerController.getAllEntries);
router.get("/user/:userId", ledger_controller_1.ledgerController.getEntriesByUserId);
router.get("/user/:userId/history", ledger_controller_1.ledgerController.getBalanceHistory);
router.get("/:id", ledger_controller_1.ledgerController.getEntryById);
router.post("/", ledger_controller_1.ledgerController.createEntry);
// Note: No PUT/PATCH/DELETE routes - ledger is append-only and immutable
exports.default = router;
//# sourceMappingURL=ledger.routes.js.map