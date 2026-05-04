import { useState } from "react";
import api from "../../services/api";

export default function ManagerAssignPanel({ onAssigned }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    employeeEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ basic validation
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);
      await api.post("/tasks", form); // backend resolves employeeEmail → user
      onAssigned();

      // ✅ reset form
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        employeeEmail: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to assign task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tasks-card manager-assign-card">
      <h3>🛠 Assign Task</h3>

      {/* Row 1: Title + Employee Email */}
      <div className="task-filters">
        <input
          name="title"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="employeeEmail"
          type="email"
          placeholder="Employee email"
          value={form.employeeEmail}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <textarea
        className="assign-textarea"
        name="description"
        placeholder="Task description"
        value={form.description}
        onChange={handleChange}
      />

      {/* Dates */}
      <div className="task-filters">
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
        />
      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "6px" }}>
          {error}
        </p>
      )}

      {/* Action */}
      <div className="assign-footer">
        <button className="assign-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </div>
    </div>
  );
}
