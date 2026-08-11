import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Key } from 'lucide-react';
import httpClient from '../../services/httpClient';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      if(window.__toast) window.__toast('Passwords do not match', 'error');
      return;
    }
    try {
      await httpClient.post('/api/auth/reset', { token, new_password: password });
      if(window.__toast) window.__toast('Password reset successful', 'success');
      navigate('/login');
    } catch (error) {
      console.error(error);
      if(window.__toast) window.__toast('Password reset failed', 'error');
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
        width: '100%', maxWidth: '400px', padding: '40px',
        background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px', textAlign: 'center'
      }}>
        <Key size={40} color="#3BB7FF" style={{ margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{ marginBottom: '15px' }}>Set New Password</h2>
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          <button type="submit" style={{
            padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
            color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,183,255,0.3)'
          }}>Reset Password</button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
