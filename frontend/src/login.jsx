import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Employee'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Failed to connect to the server. Is your Node backend running?');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          <div style={styles.icon}>🎯</div>
          <h2 style={styles.title}>Employee Tracking System</h2>
          <p style={styles.subtitle}>Log in to access your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Employee" style={styles.option}>Employee</option>
              <option value="Manager" style={styles.option}>Manager</option>
              <option value="Admin" style={styles.option}>Admin</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>
            Log In
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign Up here</Link>
        </p>

      </div>
    </div>
  );
};

const styles = {
  container: { 
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    minHeight: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontFamily: 'system-ui, sans-serif',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)', 
    margin: 0,
    padding: '1rem',
    boxSizing: 'border-box'
  },
  
  card: { 
    backgroundColor: '#ffffff', 
    padding: '3rem 2.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)', 
    width: '100%', 
    maxWidth: '420px',
    borderTop: '6px solid #10b981' 
  },

  header: { textAlign: 'center', marginBottom: '2rem' },
  icon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { color: '#064e3b', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800', lineHeight: '1.2' },
  subtitle: { color: '#64748b', fontSize: '0.95rem', margin: 0 },
  
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#334155' },
  
  input: { 
    padding: '0.875rem', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '1rem', 
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  
  select: { 
    padding: '0.875rem', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '1rem', 
    backgroundColor: '#f8fafc', 
    color: '#0f172a', 
    cursor: 'pointer' 
  },
  option: {
    backgroundColor: '#ffffff', 
    color: '#0f172a'           
  },

  button: { 
    marginTop: '0.5rem', 
    padding: '1rem', 
    backgroundColor: '#10b981', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' 
  },
  footerText: { textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 'bold' } 
};

export default Login;