import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    /* ================= BASIC DETAILS ================= */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    /* ================= STATUS & PRIORITY ================= */

    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "NOT_STARTED",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    /* ================= ASSIGNMENT ================= */

    // Employee to whom task is assigned
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Manager who assigned the task
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= DATES ================= */

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  }
);

export default mongoose.model("Task", taskSchema);