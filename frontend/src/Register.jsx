import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const response = await fetch('http://127.0.0.1:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (data.success) {
        alert('Account created successfully! You can now log in.');
        navigate('/'); 
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is your Node backend running?');
    }
  };

  return (
    <div style={styles.splitContainer}>
      
      {/* LEFT SIDE: The Registration Form */}
      <div style={styles.formSection}>
        <div style={styles.formWrapper}>
          <div style={styles.logoPlaceholder}>✨</div>
          <h2 style={styles.title}>Create an Account</h2>
          <p style={styles.subtitle}>Set up your profile to join the company workspace.</p>
          
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input} 
                placeholder="employee@company.com"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input} 
                placeholder="••••••••"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button type="submit" style={styles.button}>Sign Up</button>
          </form>

          <p style={styles.footerText}>
            Already have an account? <Link to="/" style={styles.link}>Log In here</Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE:  Visual Presentation */}
      <div style={styles.visualSection}>
        {/*  background shapes */}
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        
        {/* Info Card */}
        <div style={styles.glassCard}>
          <h1 style={styles.glassTitle}>Join the Workspace</h1>
          <p style={styles.glassText}>
            Get instant access to your daily deliverables, track your progress, and collaborate seamlessly with your managers.
          </p>
          
          <ul style={styles.featureList}>
            <li style={styles.featureItem}>
              <span style={styles.iconContainer}>🎯</span>
              <div>
                <strong>Goal Alignment</strong>
                <div style={styles.featureSubtext}>Never miss a due date again</div>
              </div>
            </li>
            <li style={styles.featureItem}>
              <span style={styles.iconContainer}>📈</span>
              <div>
                <strong>Track Progress</strong>
                <div style={styles.featureSubtext}>Keep your managers updated effortlessly</div>
              </div>
            </li>
            <li style={styles.featureItem}>
              <span style={styles.iconContainer}>🤝</span>
              <div>
                <strong>Team Collaboration</strong>
                <div style={styles.featureSubtext}>Unified company task logs</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

const styles = {
  // Main Layout
  splitContainer: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#ffffff' },
  
  // Left Form Section
  formSection: { flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', zIndex: 10 },
  formWrapper: { width: '100%', maxWidth: '400px' },
  logoPlaceholder: { fontSize: '3rem', marginBottom: '1rem' },
  title: { color: '#0f172a', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' },
  subtitle: { color: '#64748b', marginBottom: '2rem', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#475569' },
  input: { padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' },
  select: { padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: '#f8fafc', cursor: 'pointer' },
  button: { marginTop: '1rem', padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' },
  errorBox: { backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500', borderLeft: '4px solid #ef4444' },
  footerText: { textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' },

  // Right Visual Section
  visualSection: { 
    flex: '1.2', 
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '3rem', 
    position: 'relative', 
    overflow: 'hidden' 
  },
  
  // background shapes
  blob1: { position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', opacity: 0.4, filter: 'blur(60px)' },
  blob2: { position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'linear-gradient(to top right, #0ea5e9, #2dd4bf)', opacity: 0.3, filter: 'blur(50px)' },

  // The Glassmorphism Card
  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '3rem',
    maxWidth: '500px',
    color: 'white',
    zIndex: 10,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  glassTitle: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' },
  glassText: { fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '2.5rem', lineHeight: '1.6' },
  
  // Feature List inside the glass card
  featureList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '1rem' },
  iconContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '1.5rem' },
  featureSubtext: { color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.25rem' }
};

export default Register;