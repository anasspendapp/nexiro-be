import { Request, Response } from "express";
import { ImageTask, TaskStatus } from "./image-task.model";
import { User } from "../users/user.model";

export const imageTaskController = {
  // Get all image tasks
  getAllTasks: async (req: Request, res: Response) => {
    try {
      const page = Math.max(
        Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
        1,
      );
      const limit = Math.max(
        Number.parseInt(String(req.query.limit ?? "10"), 10) || 10,
        1,
      );
      const offset = (page - 1) * limit;

      const { rows: tasks, count: total } = await ImageTask.findAndCountAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      res.json({
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get tasks by user ID
  getTasksByUserId: async (req: Request, res: Response) => {
    try {
      const tasks = await ImageTask.findAll({
        where: { userId: req.params.userId },
        order: [["createdAt", "DESC"]],
      });
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get task by ID
  getTaskById: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["email"],
          },
        ],
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new task
  createTask: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.create(req.body);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update task status
  updateTaskStatus: async (req: Request, res: Response) => {
    try {
      const { status, outputDriveId } = req.body;

      const task = await ImageTask.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const updateData: any = { status };
      if (outputDriveId) {
        updateData.outputDriveId = outputDriveId;
      }

      await task.update(updateData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update task
  updateTask: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      await task.update(req.body);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete task
  deleteTask: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      await task.destroy();
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
