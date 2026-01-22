"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const image_task_controller_1 = require("./image-task.controller");
const router = (0, express_1.Router)();
router.get("/", image_task_controller_1.imageTaskController.getAllTasks);
router.get("/user/:userId", image_task_controller_1.imageTaskController.getTasksByUserId);
router.get("/:id", image_task_controller_1.imageTaskController.getTaskById);
router.post("/", image_task_controller_1.imageTaskController.createTask);
router.patch("/:id/status", image_task_controller_1.imageTaskController.updateTaskStatus);
router.put("/:id", image_task_controller_1.imageTaskController.updateTask);
router.delete("/:id", image_task_controller_1.imageTaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=image-task.routes.js.map