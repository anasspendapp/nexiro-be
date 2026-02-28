import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { verifyAdminToken } from "../utils/auth.middleware";

const router = Router();

/**
 * @route   GET /api/analytics/referrals
 * @desc    Get referral program analytics
 * @access  Admin
 * @query   startDate (optional) - Start date for analytics (ISO format)
 * @query   endDate (optional) - End date for analytics (ISO format)
 */
router.get(
  "/referrals",
  verifyAdminToken,
  analyticsController.getReferralAnalytics,
);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get money made analytics
 * @access  Admin
 * @query   startDate (optional) - Start date for analytics (ISO format)
 * @query   endDate (optional) - End date for analytics (ISO format)
 */
router.get(
  "/revenue",
  verifyAdminToken,
  analyticsController.getMoneyMadeAnalytics,
);

/**
 * @route   GET /api/analytics/images
 * @desc    Get image processing analytics
 * @access  Admin
 * @query   startDate (optional) - Start date for analytics (ISO format)
 * @query   endDate (optional) - End date for analytics (ISO format)
 */
router.get(
  "/images",
  verifyAdminToken,
  analyticsController.getImageProcessingAnalytics,
);

/**
 * @route   GET /api/analytics/summary
 * @desc    Get all analytics in one request
 * @access  Admin
 * @query   startDate (optional) - Start date for analytics (ISO format)
 * @query   endDate (optional) - End date for analytics (ISO format)
 */
router.get("/summary", verifyAdminToken, analyticsController.getAllAnalytics);

export default router;
