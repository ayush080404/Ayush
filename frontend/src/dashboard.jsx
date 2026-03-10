import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const defaultTaskData = {
    title: '', description: '', priority: 'Medium', status: 'Pending',
    dueDate: new Date().toISOString().split('T')[0], assignedTo: '' 
  };

  const [taskData, setTaskData] = useState(defaultTaskData);
  const [loggedTasks, setLoggedTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [systemUsers, setSystemUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks'); 

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const getToken = () => localStorage.getItem('authToken');
  const getUserData = () => {
    const token = getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch (e) { return null; }
  };

  const currentUser = getUserData();
  const isManager = currentUser?.role === 'Manager' || currentUser?.role === 'Admin';
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return navigate('/'); 

      try {
        const taskRes = await fetch('http://127.0.0.1:5001/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        const taskData = await taskRes.json();
        if (taskData.success) setLoggedTasks(taskData.tasks);
        else if (taskRes.status === 401 || taskRes.status === 403) return handleLogout();

        if (isAdmin) {
          const userRes = await fetch('http://127.0.0.1:5001/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
          const userData = await userRes.json();
          if (userData.success) setSystemUsers(userData.users);
        }
      } catch (error) { console.error('Error fetching data:', error); }
    };
    fetchData();
  }, [navigate, isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleChange = (e) => setTaskData({ ...taskData, [e.target.name]: e.target.value });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus }) 
      });
      const data = await response.json();
      if (data.success) setLoggedTasks(loggedTasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) { console.error('Error updating status:', error); }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!isManager) return;
    try {
      const method = editingTaskId ? 'PUT' : 'POST';
      const url = editingTaskId ? `http://127.0.0.1:5001/api/tasks/${editingTaskId}` : 'http://127.0.0.1:5001/api/tasks';
      
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      if (data.success) {
        if (editingTaskId) setLoggedTasks(loggedTasks.map(task => task._id === editingTaskId ? data.task : task));
        else setLoggedTasks([...loggedTasks, data.task]);
        setEditingTaskId(null);
        setTaskData(defaultTaskData);
      }
    } catch (error) { console.error('Error saving task:', error); }
  };

  const handleEditClick = (task) => {
    setTaskData({ title: task.title, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate, assignedTo: task.assignedTo });
    setEditingTaskId(task._id);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setLoggedTasks(loggedTasks.filter(task => task._id !== id));
    } catch (error) { console.error('Error deleting task:', error); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/users/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) setSystemUsers(systemUsers.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) { console.error('Error updating role:', error); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: Permanently delete this user?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setSystemUsers(systemUsers.filter(u => u._id !== userId));
    } catch (error) { console.error('Error deleting user:', error); }
  };

  const cancelEdit = () => { setEditingTaskId(null); setTaskData(defaultTaskData); };
  const getPriorityColor = (priority) => priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#10b981';

  const today = new Date().toISOString().split('T')[0];
  const totalTasks = loggedTasks.length;
  const completedTasks = loggedTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = loggedTasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = loggedTasks.filter(t => t.dueDate < today && t.status !== 'Completed').length;

  const filteredTasks = loggedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo}>🎯</span>
          <h2 style={styles.headerTitle}>Company Workspace</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={styles.userInfo}>
            <span style={styles.userRoleBadge}>{currentUser?.role}</span>
            <span style={styles.userEmail}>{currentUser?.email}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
        </div>
      </header>
      
      {/* TAB NAVIGATION */}
      {isAdmin && (
        <div style={styles.tabContainer}>
          <div style={styles.tabWrapper}>
            <button style={activeTab === 'tasks' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('tasks')}>
              📋 Task Management
            </button>
            <button style={activeTab === 'users' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('users')}>
              👥 User Admin Panel
            </button>
          </div>
        </div>
      )}

      <main style={styles.main}>
        {activeTab === 'tasks' ? (
          <>
            {/* KPI DASHBOARD */}
            <div style={styles.kpiContainer}>
              <div style={{...styles.kpiCard, borderTop: '4px solid #3b82f6'}}>
                <div style={styles.kpiHeader}>
                  <h4 style={styles.kpiTitle}>Total Tasks</h4>
                  <span style={{fontSize: '1.2rem'}}>📊</span>
                </div>
                <p style={styles.kpiValue}>{totalTasks}</p>
              </div>
              <div style={{...styles.kpiCard, borderTop: '4px solid #10b981'}}>
                <div style={styles.kpiHeader}>
                  <h4 style={styles.kpiTitle}>Completed</h4>
                  <span style={{fontSize: '1.2rem'}}>✅</span>
                </div>
                <p style={styles.kpiValue}>{completedTasks}</p>
              </div>
              <div style={{...styles.kpiCard, borderTop: '4px solid #f59e0b'}}>
                <div style={styles.kpiHeader}>
                  <h4 style={styles.kpiTitle}>In Progress</h4>
                  <span style={{fontSize: '1.2rem'}}>⏳</span>
                </div>
                <p style={styles.kpiValue}>{inProgressTasks}</p>
              </div>
              <div style={{...styles.kpiCard, borderTop: '4px solid #ef4444', backgroundColor: overdueTasks > 0 ? '#fef2f2' : 'white'}}>
                <div style={styles.kpiHeader}>
                  <h4 style={{...styles.kpiTitle, color: overdueTasks > 0 ? '#b91c1c' : '#64748b'}}>Overdue</h4>
                  <span style={{fontSize: '1.2rem'}}>⚠️</span>
                </div>
                <p style={{...styles.kpiValue, color: overdueTasks > 0 ? '#ef4444' : '#1e293b'}}>{overdueTasks}</p>
              </div>
            </div>

            <div style={styles.grid}>
              {/* LEFT COLUMN: Form or Profile */}
              {isManager ? (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>{editingTaskId ? "✏️ Edit Task Details" : "✨ Assign New Task"}</h3>
                  <form onSubmit={submitTask} style={styles.form}>
                    <div style={styles.inputGroup}><label style={styles.label}>Task Title</label><input type="text" name="title" required value={taskData.title} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>Description</label><textarea name="description" required value={taskData.description} onChange={handleChange} style={{...styles.input, minHeight: '80px', resize: 'vertical'}} /></div>
                    <div style={styles.row}>
                      <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Priority</label><select name="priority" value={taskData.priority} onChange={handleChange} style={styles.select}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
                      <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Status</label><select name="status" value={taskData.status} onChange={handleChange} style={styles.select}><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select></div>
                    </div>
                    <div style={styles.row}>
                      <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Due Date</label><input type="date" name="dueDate" required value={taskData.dueDate} onChange={handleChange} style={styles.input} /></div>
                      <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Assign To (Email)</label><input type="email" name="assignedTo" required value={taskData.assignedTo} onChange={handleChange} style={styles.input} /></div>
                    </div>
                    <div style={styles.buttonGroup}>
                      <button type="submit" style={editingTaskId ? styles.updateButton : styles.submitButton}>{editingTaskId ? "Update Task" : "Save & Assign Task"}</button>
                      {editingTaskId && <button type="button" onClick={cancelEdit} style={styles.cancelButton}>Cancel</button>}
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{...styles.card, background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #d1fae5'}}>
                  <h3 style={styles.cardTitle}>👤 My Profile</h3>
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ margin: 0 }}><strong>Email:</strong> <span style={{color: '#475569'}}>{currentUser?.email}</span></p>
                    <p style={{ margin: 0 }}><strong>Role:</strong> <span style={styles.userRoleBadge}>{currentUser?.role}</span></p>
                  </div>
                  <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Welcome back! Please review your assigned deliverables on the right. Keep your managers informed by updating your task status as you progress.
                  </p>
                </div>
              )}

              {/* RIGHT COLUMN: Filtered Task List */}
              <div style={{...styles.card, display: 'flex', flexDirection: 'column'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={styles.cardTitle}>{isManager ? "🏢 Company Task Roster" : "📝 My Action Items"}</h3>
                </div>

                {/* MODERN FILTER BAR */}
                <div style={styles.filterBar}>
                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                    <option value="All">All Statuses</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                  </select>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={styles.filterSelect}>
                    <option value="All">All Priorities</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                  </select>
                </div>

                {filteredTasks.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={{fontSize: '3rem', marginBottom: '1rem', display: 'block'}}>📭</span>
                    <p style={{margin: 0, color: '#64748b', fontSize: '1.1rem'}}>No tasks found matching your criteria.</p>
                  </div>
                ) : (
                  <ul style={styles.taskList}>
                    {filteredTasks.map((task) => (
                      <li key={task._id} style={{...styles.taskItem, borderLeftColor: getPriorityColor(task.priority)}}>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1.15rem', color: task.status === 'Completed' ? '#94a3b8' : '#0f172a', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                              {task.title}
                            </strong>
                            {isManager && <span style={{...styles.statusBadge, backgroundColor: task.status === 'Completed' ? '#d1fae5' : task.status === 'In Progress' ? '#fef3c7' : '#f1f5f9', color: task.status === 'Completed' ? '#065f46' : task.status === 'In Progress' ? '#92400e' : '#475569'}}>{task.status}</span>}
                          </div>
                          <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.5' }}>{task.description}</p>
                          <div style={styles.taskSubtext}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: getPriorityColor(task.priority), fontWeight: '700', backgroundColor: `${getPriorityColor(task.priority)}15`, padding: '2px 8px', borderRadius: '4px' }}>
                              Priority: {task.priority}
                            </span>
                            <span style={{color: task.dueDate < today && task.status !== 'Completed' ? '#ef4444' : '#64748b', fontWeight: task.dueDate < today && task.status !== 'Completed' ? 'bold' : 'normal'}}>
                              📅 Due: {task.dueDate}
                            </span>
                            {isManager && <span style={{color: '#64748b'}}>🧑‍💻 {task.assignedTo}</span>}
                          </div>
                        </div>
                        <div style={styles.taskActions}>
                          {isManager ? (
                            <>
                              <button onClick={() => handleEditClick(task)} style={styles.editBtn}>✏️ Edit</button>
                              <button onClick={() => handleDeleteClick(task._id)} style={styles.deleteBtn}>🗑️</button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '130px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</label>
                              <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} style={styles.select}>
                                <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ADMIN USER VIEW */
          <div style={styles.card}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
              <span style={{fontSize: '1.5rem'}}>🛡️</span>
              <h3 style={{...styles.cardTitle, margin: 0}}>System Access Management</h3>
            </div>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1rem' }}>Review registered accounts, modify permission levels, or revoke access.</p>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Email Address</th>
                    <th style={styles.th}>System Role</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemUsers.map(user => (
                    <tr key={user._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                          <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b'}}>
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <span style={{fontWeight: '500', color: '#0f172a'}}>{user.email}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} style={{...styles.select, padding: '0.4rem 0.75rem', maxWidth: '150px'}} disabled={user.email === currentUser.email}>
                          <option value="Employee">Employee</option><option value="Manager">Manager</option><option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td style={{...styles.td, textAlign: 'right'}}>
                        {user.email !== currentUser.email ? (
                          <button onClick={() => handleDeleteUser(user._id)} style={styles.deleteUserBtn}>Revoke Access</button>
                        ) : (
                          <span style={{fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic'}}>Current User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: '"Inter", system-ui, -apple-system, sans-serif', backgroundColor: '#f0fdf4', minHeight: '100vh', margin: 0, padding: 0 },
  
  // Header
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#064e3b', color: 'white', padding: '1rem 3rem', boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  headerLogo: { fontSize: '1.75rem' },
  headerTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.025em' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.2)' },
  userRoleBadge: { backgroundColor: '#10b981', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' },
  userEmail: { fontSize: '0.9rem', opacity: 0.9, fontWeight: '500' },
  logoutButton: { padding: '0.5rem 1.25rem', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem' },

  // Tabs
  tabContainer: { display: 'flex', justifyContent: 'center', padding: '1.5rem 0 0 0' },
  tabWrapper: { backgroundColor: '#ffffff', padding: '0.35rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  tabBtn: { padding: '0.6rem 1.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#64748b', fontWeight: '600', transition: 'all 0.2s' },
  activeTabBtn: { padding: '0.6rem 1.5rem', backgroundColor: '#ecfdf5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#065f46', fontWeight: '700', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },

  main: { padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto' },
  
  // KPIs
  kpiContainer: { display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: '220px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  kpiTitle: { margin: 0, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' },
  kpiValue: { margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' },

  // Layout
  grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem', alignItems: 'start' },
  card: { backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' },
  cardTitle: { margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' },

  // Forms & Inputs
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  row: { display: 'flex', gap: '1.25rem', width: '100%' }, 
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#334155' },
  input: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a', backgroundColor: '#f8fafc' },
  select: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a', backgroundColor: '#ffffff', cursor: 'pointer' },

  // Buttons
  buttonGroup: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  submitButton: { flex: 1, padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' },
  updateButton: { flex: 1, padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' },
  cancelButton: { padding: '0.875rem 1.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },

  // Filter Bar
  filterBar: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  searchWrapper: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 0.75rem' },
  searchIcon: { fontSize: '1.1rem', color: '#94a3b8' },
  searchInput: { flex: 1, padding: '0.75rem', border: 'none', outline: 'none', fontSize: '0.95rem', backgroundColor: 'transparent', color: '#0f172a' },
  filterSelect: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a', cursor: 'pointer' },

  // Task List
  taskList: { listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '650px', paddingRight: '0.5rem' },
  taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderLeftWidth: '5px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  taskSubtext: { display: 'flex', gap: '1.5rem', fontSize: '0.85rem', marginTop: '0.5rem' },
  taskActions: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1.5rem' },
  statusBadge: { padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  
  // Small Action Buttons
  editBtn: { padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' },
  deleteBtn: { padding: '0.5rem 0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },

  // Admin Table
  tableContainer: { overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem 1.5rem', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', textAlign: 'left' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem 1.5rem', verticalAlign: 'middle', color: '#334155', fontSize: '0.95rem' },
  deleteUserBtn: { padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' },
  
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }
};

export default Dashboard;