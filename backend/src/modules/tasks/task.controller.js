import Task from "./task.model.js";
import User from "../auth/auth.model.js";
import PDFDocument from "pdfkit";

/* =========================================================
   ✅ Get tasks for logged‑in user
   - EMPLOYEE → tasks assigned to them
   - MANAGER  → tasks they assigned
   ========================================================= */
export const getMyTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "MANAGER") {
      tasks = await Task.find({ assignedBy: req.user.id })
        .populate("assignedTo", "email")
        .sort({ endDate: 1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedBy", "email")
        .sort({ endDate: 1 });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/* =========================================================
   ✅ Dashboard stats (role‑aware)
   ========================================================= */
export const getTaskStats = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "MANAGER") {
      tasks = await Task.find({ assignedBy: req.user.id });
    } else {
      tasks = await Task.find({ assignedTo: req.user.id });
    }

    const now = new Date();

    const stats = {
      total: tasks.length,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };

    tasks.forEach((task) => {
      if (task.status === "NOT_STARTED") stats.notStarted++;
      if (task.status === "IN_PROGRESS") stats.inProgress++;
      if (task.status === "COMPLETED") stats.completed++;

      if (
        task.status !== "COMPLETED" &&
        task.endDate &&
        task.endDate < now
      ) {
        stats.overdue++;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task stats" });
  }
};

/* =========================================================
   ✅ Update task status (EMPLOYEE only)
   ========================================================= */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      _id: id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or access denied",
      });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task status" });
  }
};

/* =========================================================
   ✅ Create task (MANAGER assigns via employee email)
   ========================================================= */
export const createTask = async (req, res) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Only managers can assign tasks",
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      employeeEmail,
      priority,
    } = req.body;

    if (!title || !startDate || !endDate || !employeeEmail) {
      return res.status(400).json({
        message: "Missing required task fields",
      });
    }

    const employee = await User.findOne({
      email: employeeEmail,
      role: "EMPLOYEE",
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found with this email",
      });
    }

    const task = await Task.create({
      title,
      description,
      startDate,
      endDate,
      priority,
      assignedTo: employee._id,
      assignedBy: req.user.id,
      status: "NOT_STARTED",
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

/* =========================================================
   ✅ Download Tasks as PDF (Employee / Manager)
   ========================================================= */
export const downloadTasksPDF = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "MANAGER") {
      tasks = await Task.find({ assignedBy: req.user.id })
        .populate("assignedTo", "email")
        .populate("assignedBy", "email");
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedBy", "email");
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=task-report.pdf"
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc
      .fontSize(18)
      .text("Employee Task Report", { align: "center" })
      .moveDown();

    doc
      .fontSize(11)
      .text(`User: ${req.user.email}`)
      .text(`Role: ${req.user.role}`)
      .text(`Generated: ${new Date().toLocaleDateString()}`)
      .moveDown(2);

    // ================= TABLE HEADER =================
    doc.font("Helvetica-Bold");
    doc.text("Title", 40);
    doc.text("Status", 190);
    doc.text("Start", 260);
    doc.text("End", 330);
    doc.text("Assigned To", 400);
    doc.moveDown();

    doc.font("Helvetica");

    // ================= TABLE ROWS =================
    tasks.forEach((task) => {
      doc.text(task.title, 40, doc.y, { width: 140 });
      doc.text(task.status, 190);
      doc.text(task.startDate?.toISOString().split("T")[0] || "-", 260);
      doc.text(task.endDate?.toISOString().split("T")[0] || "-", 330);
      doc.text(task.assignedTo?.email || "-", 400, doc.y, { width: 150 });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to download PDF" });
  }
};
