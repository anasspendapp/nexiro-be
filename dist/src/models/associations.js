"use strict";
// Central place to define all model associations
// This avoids circular dependency issues
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAssociations = initializeAssociations;
const user_model_1 = require("../users/user.model");
const plan_model_1 = require("../plans/plan.model");
const price_book_model_1 = require("../price-books/price-book.model");
const stripe_session_model_1 = require("../stripe-sessions/stripe-session.model");
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
    plan_model_1.Plan.hasMany(stripe_session_model_1.StripeSession, {
        foreignKey: "planId",
        as: "stripeSessions",
    });
    // User associations
    user_model_1.User.belongsTo(plan_model_1.Plan, {
        foreignKey: "planId",
        as: "plan",
    });
    user_model_1.User.hasMany(stripe_session_model_1.StripeSession, {
        foreignKey: "userId",
        as: "stripeSessions",
    });
    // StripeSession associations
    stripe_session_model_1.StripeSession.belongsTo(user_model_1.User, {
        foreignKey: "userId",
        as: "user",
    });
    stripe_session_model_1.StripeSession.belongsTo(plan_model_1.Plan, {
        foreignKey: "planId",
        as: "plan",
    });
}
//# sourceMappingURL=associations.js.map