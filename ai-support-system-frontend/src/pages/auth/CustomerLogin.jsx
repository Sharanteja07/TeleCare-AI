import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, 'customer');
      navigate('/customer');
    } catch (error) {
      console.error(error);
      if(window.__toast) window.__toast('Login failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,183,255,0.05) 0%, transparent 50%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', borderRight: '1px solid rgba(120,160,255,0.15)' }} className="hide-on-mobile">
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'rgba(59,183,255,0.2)', filter: 'blur(100px)', borderRadius: '50%' }} />
          <Zap size={80} color="#3BB7FF" style={{ filter: 'drop-shadow(0 0 20px rgba(59,183,255,0.5))' }} />
        </div>
        <h1 style={{ fontSize: '3rem', margin: '20px 0', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TeleCare AI</h1>
        <p style={{ fontSize: '1.2rem', color: '#A8B3CF' }}>Next-Generation Telecom Support</p>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{
          width: '100%', maxWidth: '400px', padding: '40px',
          background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Zap size={40} color="#3BB7FF" style={{ display: 'inline-block' }} />
            <h2 style={{ fontSize: '2rem', margin: '10px 0', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TeleCare AI</h2>
            <p style={{ color: '#A8B3CF' }}>Customer Portal</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ color: '#3BB7FF', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot Password?</Link>
            </div>
            <button type="submit" style={{
              padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
              color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,183,255,0.3)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Sign In
            </button>
          </form>
          <div style={{ margin: '30px 0', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link to="/register" style={{ color: '#FFFFFF', textDecoration: 'none' }}>New customer? <span style={{ color: '#3BB7FF' }}>Register here</span></Link>
            <Link to="/admin/login" style={{ color: '#A8B3CF', textDecoration: 'none', fontSize: '0.85rem' }}>Staff login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerLogin;
