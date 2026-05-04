import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes); // ✅ ADD THIS

export default router;