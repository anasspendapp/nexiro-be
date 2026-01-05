import { Router } from "express";
import { imageTaskController } from "./image-task.controller";

const router = Router();

router.get("/", imageTaskController.getAllTasks);
router.get("/user/:userId", imageTaskController.getTasksByUserId);
router.get("/:id", imageTaskController.getTaskById);
router.post("/", imageTaskController.createTask);
router.patch("/:id/status", imageTaskController.updateTaskStatus);
router.put("/:id", imageTaskController.updateTask);
router.delete("/:id", imageTaskController.deleteTask);

export default router;
