"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const price_book_controller_1 = require("./price-book.controller");
const auth_middleware_1 = require("../utils/auth.middleware");
const router = (0, express_1.Router)();
router.get("/current/plans", price_book_controller_1.priceBookController.getCurrentPlans);
router.get("/", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.getAllPriceBooks);
router.get("/current", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.getCurrentPrice);
router.get("/current/plans/:planName", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.getPlanByName);
router.get("/:id", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.getPriceBookById);
router.post("/", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.createPriceBook);
router.put("/:id", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.updatePriceBook);
router.delete("/:id", auth_middleware_1.verifyAdminToken, price_book_controller_1.priceBookController.deletePriceBook);
exports.default = router;
//# sourceMappingURL=price-book.routes.js.map