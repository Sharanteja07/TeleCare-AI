import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await httpClient.post('/api/auth/forgot', { email });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      if(window.__toast) window.__toast('Failed to send reset link', 'error');
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
        {success ? (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <CheckCircle size={60} color="#00E676" style={{ margin: '0 auto 20px', display: 'block' }} />
            <h2 style={{ marginBottom: '15px' }}>Check Your Email</h2>
            <p style={{ color: '#A8B3CF', marginBottom: '30px' }}>We've sent a password reset link to {email}.</p>
            <Link to="/login" style={{ color: '#3BB7FF', textDecoration: 'none', fontWeight: 'bold' }}>Return to Login</Link>
          </div>
        ) : (
          <>
            <Mail size={40} color="#3BB7FF" style={{ margin: '0 auto 20px', display: 'block' }} />
            <h2 style={{ marginBottom: '15px' }}>Forgot Password?</h2>
            <p style={{ color: '#A8B3CF', marginBottom: '30px' }}>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              <button type="submit" style={{
                padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,183,255,0.3)'
              }}>Send Reset Link</button>
            </form>
            <div style={{ marginTop: '20px' }}>
              <Link to="/login" style={{ color: '#A8B3CF', textDecoration: 'none', fontSize: '0.9rem' }}>Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
