import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import httpClient from '../../services/httpClient';

const Register = () => {
  const [formData, setFormData] = useState({ full_name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      if(window.__toast) window.__toast('Passwords do not match', 'error');
      return;
    }
    try {
      await httpClient.post('/api/auth/register', {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if(window.__toast) window.__toast('Registration successful', 'success');
      navigate('/login');
    } catch (error) {
      console.error(error);
      if(window.__toast) window.__toast('Registration failed', 'error');
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
    borderRadius: '10px', color: '#fff', padding: '12px 14px', outline: 'none', transition: 'all 0.3s'
  };

  const focusStyle = (e) => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; };
  const blurStyle = (e) => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{
        width: '100%', maxWidth: '500px', padding: '40px',
        background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Zap size={40} color="#3BB7FF" style={{ display: 'inline-block' }} />
          <h2 style={{ fontSize: '2rem', margin: '10px 0', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h2>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="text" name="full_name" autoComplete="name" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          <input type="text" name="username" autoComplete="username" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          <input type="email" name="email" autoComplete="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{...inputStyle, paddingRight: '40px'}} onFocus={focusStyle} onBlur={blurStyle} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8B3CF', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <input type={showPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />

          <button type="submit" style={{
            padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
            color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,183,255,0.3)'
          }}>Register</button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#A8B3CF', textDecoration: 'none' }}>Already have an account? <span style={{ color: '#3BB7FF' }}>Login</span></Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
