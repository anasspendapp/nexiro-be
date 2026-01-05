import { Request, Response } from "express";
import { ImageTask, TaskStatus } from "./image-task.model";

export const imageTaskController = {
  // Get all image tasks
  getAllTasks: async (req: Request, res: Response) => {
    try {
      const tasks = await ImageTask.find()
        .populate("userId", "email")
        .populate("priceSnapshotId")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get tasks by user ID
  getTasksByUserId: async (req: Request, res: Response) => {
    try {
      const tasks = await ImageTask.find({ userId: req.params.userId })
        .populate("priceSnapshotId")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get task by ID
  getTaskById: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findById(req.params.id)
        .populate("userId", "email")
        .populate("priceSnapshotId");

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
      const task = new ImageTask(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update task status
  updateTaskStatus: async (req: Request, res: Response) => {
    try {
      const { status, outputDriveId } = req.body;

      const task = await ImageTask.findByIdAndUpdate(
        req.params.id,
        { status, ...(outputDriveId && { outputDriveId }) },
        { new: true, runValidators: true },
      );

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update task
  updateTask: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete task
  deleteTask: async (req: Request, res: Response) => {
    try {
      const task = await ImageTask.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
