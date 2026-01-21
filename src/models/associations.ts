// Central place to define all model associations
// This avoids circular dependency issues

import { User } from "../users/user.model";
import { Plan } from "../plans/plan.model";
import { PriceBook } from "../price-books/price-book.model";

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

  // User associations
  User.belongsTo(Plan, {
    foreignKey: "planId",
    as: "plan",
  });
}
