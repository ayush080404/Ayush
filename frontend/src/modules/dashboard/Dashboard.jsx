import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { logout } from "../auth/auth.slice";
import "./dashboard.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ================= STATE ================= */

  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ================= API HELPERS ================= */

  const fetchStats = async () => {
    const res = await api.get("/tasks/stats");
    setStats(res.data);
  };

  const fetchTasks = async () => {
    const res = await api.get("/tasks/my");
    setTasks(res.data);
  };

  /* ================= PDF DOWNLOAD HANDLER ✅ ================= */

  const handleDownload = async () => {
    try {
      const response = await api.get("/tasks/download/pdf", {
        responseType: "blob", // REQUIRED for files
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "task-report.pdf";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF");
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  /* ================= FILTER ================= */

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  /* ================= ACTIONS ================= */

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const markCompleted = async (taskId) => {
    await api.patch(`/tasks/${taskId}`, { status: "COMPLETED" });
    fetchTasks();
    fetchStats();
  };

  /* ================= UI ================= */

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="logo">🎯 Company Workspace</div>
        <div className="user-info">
          <span className="role-badge">{user.role}</span>
          <span>{user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">
        <StatCard title="TOTAL TASKS" value={stats.total} color="blue" icon="📊" />
        <StatCard title="NOT STARTED" value={stats.notStarted} color="red" icon="⏸️" />
        <StatCard title="IN PROGRESS" value={stats.inProgress} color="orange" icon="⏳" />
        <StatCard title="COMPLETED" value={stats.completed} color="green" icon="✅" />
        <StatCard title="OVERDUE" value={stats.overdue} color="purple" icon="⚠️" highlight />
      </section>

      {/* CONTENT */}
      <section className="dashboard-content">
        {/* PROFILE */}
        <div className="profile-card">
          <h3>👤 My Profile</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p className="role-badge inline">{user.role}</p>
        </div>

        {/* ACTION ITEMS */}
        <div className="tasks-card">
          {/* TITLE + DOWNLOAD ✅ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>📝 My Action Items</h3>
            <button className="download-btn" onClick={handleDownload}>
              📄 Download PDF
            </button>
          </div>

          <div className="task-filters">
            <input
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {filteredTasks.length === 0 && <p>No tasks found.</p>}

          {filteredTasks.map((task) => (
            <div key={task._id} className="task-item">
              <div>
                <strong>{task.title}</strong>
                <p>{task.description || "No description"}</p>
              </div>

              {task.status !== "COMPLETED" ? (
                <button onClick={() => markCompleted(task._id)}>
                  ✅ Mark Completed
                </button>
              ) : (
                <span className="status-badge">COMPLETED</span>
              )}
            </div>
          ))}
        </div>

        {/* MANAGER ASSIGN */}
        {user.role === "MANAGER" && (
          <ManagerAssignPanel
            onAssigned={() => {
              fetchTasks();
              fetchStats();
            }}
          />
        )}
      </section>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ title, value, color, icon, highlight }) {
  return (
    <div className={`stat-card stat-${color} ${highlight ? "highlight" : ""}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

/* ================= MANAGER ASSIGN PANEL ================= */

function ManagerAssignPanel({ onAssigned }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    employeeEmail: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tasks", form);
    onAssigned();
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      employeeEmail: "",
    });
  };

  return (
    <div className="tasks-card manager-assign-card">
      <h3>🛠 Assign Task</h3>

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

      <textarea
        className="assign-textarea"
        name="description"
        placeholder="Task description"
        value={form.description}
        onChange={handleChange}
      />

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

      <div className="assign-footer">
        <button className="assign-btn" onClick={handleSubmit}>
          Assign Task
        </button>
      </div>
    </div>
  );
}
