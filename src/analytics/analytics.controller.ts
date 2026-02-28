import { Request, Response } from "express";
import { User } from "../users/user.model";
import { StripeSession } from "../stripe-sessions/stripe-session.model";
import { ImageTask, TaskStatus } from "../image-tasks/image-task.model";
import { Op } from "sequelize";
import sequelize from "../database";

/**
 * Get date range for analytics
 * Default: last 60 days
 */
const getDateRange = (req: Request) => {
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date(); // Today

  return { startDate, endDate };
};

export const analyticsController = {
  /**
   * Get referral program analytics
   * Returns statistics about referrals including:
   * - Total referred users
   * - Top referrers
   * - Referral growth over time
   */
  getReferralAnalytics: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = getDateRange(req);

      // Total users referred within the date range
      const totalReferred = await User.count({
        where: {
          referredById: { [Op.not]: null } as any,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      // Top referrers with their referral counts
      const topReferrers = await User.findAll({
        attributes: [
          "id",
          "email",
          "fullName",
          "referralCode",
          [
            sequelize.fn("COUNT", sequelize.col("referrals.id")),
            "referralCount",
          ],
        ],
        include: [
          {
            model: User,
            as: "referrals",
            attributes: [],
            where: {
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
            required: true,
          },
        ],
        group: ["User.id"],
        order: [[sequelize.literal('"referralCount"'), "DESC"]],
        limit: 10,
        subQuery: false,
      });

      // Referrals over time (grouped by day)
      const referralsOverTime = await User.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          referredById: { [Op.not]: null } as any,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
        raw: true,
      });

      // Total users with referral codes vs total users
      const totalUsersWithReferrals = await User.count({
        where: {
          referralCode: { [Op.not]: null } as any,
        },
      });

      const referredUsersInPeriod = await User.findAll({
        attributes: ["id", "email", "fullName", "createdAt"],
        where: {
          referredById: { [Op.not]: null } as any,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: User,
            as: "referredByUser",
            attributes: ["id", "email", "fullName", "referralCode"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 20,
      });

      res.json({
        dateRange: {
          startDate,
          endDate,
        },
        summary: {
          totalReferred,
          totalUsersWithReferrals,
        },
        topReferrers,
        referralsOverTime,
        recentReferrals: referredUsersInPeriod,
      });
    } catch (error: any) {
      console.error("Error fetching referral analytics:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get money made analytics
   * Returns statistics about revenue from Stripe sessions
   */
  getMoneyMadeAnalytics: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = getDateRange(req);

      // Total revenue from successful sessions
      const revenueResult: any = await StripeSession.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
          [
            sequelize.fn("COUNT", sequelize.col("id")),
            "successfulTransactions",
          ],
        ],
        where: {
          status: "succeeded",
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: true,
      });

      // Revenue by status
      const revenueByStatus = await StripeSession.findAll({
        attributes: [
          "status",
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ["status"],
        raw: true,
      });

      // Revenue over time (grouped by day)
      const revenueOverTime = await StripeSession.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("SUM", sequelize.col("amount")), "revenue"],
          [sequelize.fn("COUNT", sequelize.col("id")), "transactions"],
        ],
        where: {
          status: "succeeded",
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
        raw: true,
      });

      // Top customers by revenue
      const topCustomers = await StripeSession.findAll({
        attributes: [
          "userId",
          [sequelize.fn("SUM", sequelize.col("amount")), "totalSpent"],
          [
            sequelize.fn("COUNT", sequelize.col("StripeSession.id")),
            "transactionCount",
          ],
        ],
        where: {
          status: "succeeded",
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "fullName"],
          },
        ],
        group: ["StripeSession.userId", "user.id"],
        order: [[sequelize.literal('"totalSpent"'), "DESC"]],
        limit: 10,
        subQuery: false,
      });

      // Average transaction value
      const avgTransactionValue =
        revenueResult?.totalRevenue && revenueResult?.successfulTransactions
          ? parseFloat(revenueResult.totalRevenue) /
            parseInt(revenueResult.successfulTransactions)
          : 0;

      res.json({
        dateRange: {
          startDate,
          endDate,
        },
        summary: {
          totalRevenue: parseFloat(revenueResult?.totalRevenue || 0),
          successfulTransactions: parseInt(
            revenueResult?.successfulTransactions || 0,
          ),
          averageTransactionValue: parseFloat(avgTransactionValue.toFixed(2)),
        },
        revenueByStatus,
        revenueOverTime,
        topCustomers,
      });
    } catch (error: any) {
      console.error("Error fetching money made analytics:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get image processing analytics
   * Returns statistics about image tasks processed
   */
  getImageProcessingAnalytics: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = getDateRange(req);

      // Total images processed
      const totalProcessed = await ImageTask.count({
        where: {
          status: TaskStatus.COMPLETED,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      // Images by status
      const imagesByStatus = await ImageTask.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("SUM", sequelize.col("cost")), "totalCost"],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ["status"],
        raw: true,
      });

      // Images processed over time (grouped by day)
      const imagesOverTime = await ImageTask.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("SUM", sequelize.col("cost")), "totalCost"],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
        raw: true,
      });

      // Top users by image processing
      const topUsers = await ImageTask.findAll({
        attributes: [
          "userId",
          [sequelize.fn("COUNT", sequelize.col("ImageTask.id")), "imageCount"],
          [sequelize.fn("SUM", sequelize.col("cost")), "totalCost"],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "fullName"],
          },
        ],
        group: ["ImageTask.userId", "user.id"],
        order: [[sequelize.literal('"imageCount"'), "DESC"]],
        limit: 10,
        subQuery: false,
      });

      // Total cost of processing
      const totalCostResult: any = await ImageTask.findOne({
        attributes: [[sequelize.fn("SUM", sequelize.col("cost")), "totalCost"]],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: true,
      });

      // Success rate
      const totalTasks = await ImageTask.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const successRate =
        totalTasks > 0 ? (totalProcessed / totalTasks) * 100 : 0;

      res.json({
        dateRange: {
          startDate,
          endDate,
        },
        summary: {
          totalProcessed,
          totalTasks,
          successRate: parseFloat(successRate.toFixed(2)),
          totalCost: parseFloat(totalCostResult?.totalCost || 0),
        },
        imagesByStatus,
        imagesOverTime,
        topUsers,
      });
    } catch (error: any) {
      console.error("Error fetching image processing analytics:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get all analytics in one request
   */
  getAllAnalytics: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = getDateRange(req);

      // Execute all analytics queries in parallel
      const [referralData, moneyData, imageData] = await Promise.all([
        // Referral analytics
        (async () => {
          const totalReferred = await User.count({
            where: {
              referredById: { [Op.not]: null } as any,
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
          });

          const topReferrers = await User.findAll({
            attributes: [
              "id",
              "email",
              "fullName",
              [
                sequelize.fn("COUNT", sequelize.col("referrals.id")),
                "referralCount",
              ],
            ],
            include: [
              {
                model: User,
                as: "referrals",
                attributes: [],
                where: {
                  createdAt: {
                    [Op.between]: [startDate, endDate],
                  },
                },
                required: true,
              },
            ],
            group: ["User.id"],
            order: [[sequelize.literal('"referralCount"'), "DESC"]],
            limit: 5,
            subQuery: false,
          });

          return { totalReferred, topReferrers };
        })(),

        // Money analytics
        (async () => {
          const revenueResult: any = await StripeSession.findOne({
            attributes: [
              [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
              [
                sequelize.fn("COUNT", sequelize.col("id")),
                "successfulTransactions",
              ],
            ],
            where: {
              status: "succeeded",
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
            raw: true,
          });

          return {
            totalRevenue: parseFloat(revenueResult?.totalRevenue || 0),
            successfulTransactions: parseInt(
              revenueResult?.successfulTransactions || 0,
            ),
          };
        })(),

        // Image processing analytics
        (async () => {
          const totalProcessed = await ImageTask.count({
            where: {
              status: TaskStatus.COMPLETED,
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
          });

          const totalTasks = await ImageTask.count({
            where: {
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
          });

          return { totalProcessed, totalTasks };
        })(),
      ]);

      res.json({
        dateRange: {
          startDate,
          endDate,
        },
        referrals: referralData,
        revenue: moneyData,
        imageProcessing: imageData,
      });
    } catch (error: any) {
      console.error("Error fetching all analytics:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
