import express from "express";
import {
  getMyTasks,
  getTaskStats,
  updateTaskStatus,
  createTask,
  downloadTasksPDF, // ✅ PDF only
} from "./task.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Employee & Manager
router.get("/my", authenticate, getMyTasks);
router.get("/stats", authenticate, getTaskStats);
router.patch("/:id", authenticate, updateTaskStatus);

// ✅ PDF download
router.get("/download/pdf", authenticate, downloadTasksPDF);

// Manager only
router.post("/", authenticate, createTask);

export default router;
``