import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, role);
      if (role === 'admin') navigate('/admin');
      else navigate('/engineer');
    } catch (error) {
      console.error(error);
      if(window.__toast) window.__toast('Login failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,183,255,0.05) 0%, transparent 50%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', borderRight: '1px solid rgba(120,160,255,0.15)' }} className="hide-on-mobile">
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'rgba(255,82,82,0.2)', filter: 'blur(100px)', borderRadius: '50%' }} />
          <Shield size={80} color="#FF5252" style={{ filter: 'drop-shadow(0 0 20px rgba(255,82,82,0.5))' }} />
        </div>
        <h1 style={{ fontSize: '3rem', margin: '20px 0', color: '#FFFFFF' }}>Admin & Staff Portal</h1>
        <p style={{ fontSize: '1.2rem', color: '#A8B3CF' }}>Restricted access — authorized personnel only</p>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{
          width: '100%', maxWidth: '400px', padding: '40px',
          background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Shield size={40} color="#FF5252" style={{ display: 'inline-block' }} />
            <h2 style={{ fontSize: '2rem', margin: '10px 0', color: '#FFFFFF' }}>Staff Login</h2>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <select value={role} onChange={(e) => setRole(e.target.value)} required
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
                  borderRadius: '10px', color: '#fff', padding: '12px 14px', outline: 'none', transition: 'all 0.3s', appearance: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="admin">Admin</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
            <div>
              <input type="text" placeholder="Email or Username" value={email} onChange={(e) => setEmail(e.target.value)} required
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
                  borderRadius: '10px', color: '#fff', padding: '12px 14px', outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
                  borderRadius: '10px', color: '#fff', padding: '12px 14px', paddingRight: '40px', outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8B3CF', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" style={{
              padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
              color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,183,255,0.3)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Sign In
            </button>
          </form>
          <div style={{ margin: '30px 0', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#A8B3CF', textDecoration: 'none', fontSize: '0.9rem' }}>Back to Customer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;
