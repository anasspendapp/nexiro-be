// Central place to define all model associations
// This avoids circular dependency issues

import { User } from "../users/user.model";
import { Plan } from "../plans/plan.model";
import { PriceBook } from "../price-books/price-book.model";
import { StripeSession } from "../stripe-sessions/stripe-session.model";

export function initializeAssociations() {
  // PriceBook associations
  PriceBook.hasMany(Plan, {
    foreignKey: "priceBookId",
    as: "plans",
  });

  // Plan associations
  Plan.belongsTo(PriceBook, {
    foreignKey: "priceBookId",
    as: "priceBook",
  });

  Plan.hasMany(StripeSession, {
    foreignKey: "planId",
    as: "stripeSessions",
  });

  // User associations
  User.belongsTo(Plan, {
    foreignKey: "planId",
    as: "plan",
  });

  User.hasMany(StripeSession, {
    foreignKey: "userId",
    as: "stripeSessions",
  });

  // User referral associations (self-referential)
  User.hasMany(User, {
    foreignKey: "referredById",
    as: "referrals",
  });

  User.belongsTo(User, {
    foreignKey: "referredById",
    as: "referredByUser",
  });

  // StripeSession associations
  StripeSession.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  StripeSession.belongsTo(Plan, {
    foreignKey: "planId",
    as: "plan",
  });
}
