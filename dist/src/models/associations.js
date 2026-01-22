"use strict";
// Central place to define all model associations
// This avoids circular dependency issues
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAssociations = initializeAssociations;
const user_model_1 = require("../users/user.model");
const plan_model_1 = require("../plans/plan.model");
const price_book_model_1 = require("../price-books/price-book.model");
function initializeAssociations() {
    // PriceBook associations
    price_book_model_1.PriceBook.hasMany(plan_model_1.Plan, {
        foreignKey: "priceBookId",
        as: "plans",
    });
    // Plan associations
    plan_model_1.Plan.belongsTo(price_book_model_1.PriceBook, {
        foreignKey: "priceBookId",
        as: "priceBook",
    });
    // User associations
    user_model_1.User.belongsTo(plan_model_1.Plan, {
        foreignKey: "planId",
        as: "plan",
    });
}
//# sourceMappingURL=associations.js.map