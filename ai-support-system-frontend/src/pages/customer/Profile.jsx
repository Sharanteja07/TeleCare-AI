import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Key, CheckCircle, Info } from 'lucide-react';
import httpClient from '../../services/httpClient';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      try {
        const res = await httpClient.get('/users/me');
        const userData = res.data || res;
        if (userData && userData.id) {
          setProfile(userData);
        } else if (authUser) {
          setProfile(authUser);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [logout, navigate, authUser]);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (!passwords.new_password || !passwords.confirm_password) {
      setPasswordMsg({ text: 'Please enter both password fields.', type: 'error' });
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordMsg({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }

    // Backend currently does not provide password update endpoint
    setPasswordMsg({ text: 'Password change is not available yet.', type: 'info' });
  };

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '24px'
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(7,11,24,0.8)',
    border: '1px solid rgba(120,160,255,0.2)',
    borderRadius: '10px',
    color: '#FFFFFF',
    padding: '12px 14px',
    paddingLeft: '40px',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.3s'
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A8B3CF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mb-3" />
        Loading profile data...
      </div>
    );
  }

  const currentUser = profile || authUser;
  const username = currentUser?.username || 'Customer';
  const email = currentUser?.email || 'N/A';
  const role = currentUser?.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Customer';
  const isActive = currentUser?.is_active !== false;

  const formattedDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px', fontFamily: 'Space Grotesk, sans-serif' }}>Customer Profile</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Profile Card & Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Card */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div 
              style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                margin: '0 auto 16px', fontSize: '2rem', fontWeight: 700, color: '#fff',
                boxShadow: '0 0 20px rgba(59,183,255,0.3)'
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700 }}>{username}</h2>
            <p style={{ color: '#A8B3CF', margin: '0 0 16px 0', fontSize: '0.85rem' }}>{email}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <span style={{ padding: '4px 14px', background: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: '1px solid rgba(59,183,255,0.25)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {role}
              </span>
              <span style={{ padding: '4px 14px', background: 'rgba(0,230,118,0.12)', color: '#00E676', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Account Details */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Account Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A8B3CF' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} style={{ color: '#3BB7FF' }} /> Registered:</span>
                <strong style={{ color: '#FFFFFF' }}>{formattedDate}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A8B3CF' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} style={{ color: '#3BB7FF' }} /> Last Login:</span>
                <strong style={{ color: '#A8B3CF' }}>Not available</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A8B3CF' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} style={{ color: '#00E676' }} /> Account ID:</span>
                <strong style={{ color: '#FFFFFF' }}>#{currentUser?.id || '—'}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Account Settings & Change Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Read-Only Account Details */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={username} readOnly style={{ ...inputStyle, background: 'rgba(7,11,24,0.5)', opacity: 0.85, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={email} readOnly style={{ ...inputStyle, background: 'rgba(7,11,24,0.5)', opacity: 0.85, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(59,183,255,0.06)', border: '1px solid rgba(59,183,255,0.15)', fontSize: '0.8rem', color: '#A8B3CF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} style={{ color: '#3BB7FF', flexShrink: 0 }} />
                <span>Username and Email are managed by authentication and cannot be edited.</span>
              </div>

            </div>
          </div>

          {/* Change Password Form */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Change Password</h3>
            
            {passwordMsg.text && (
              <div 
                style={{ 
                  marginBottom: '16px', 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  fontSize: '0.8rem',
                  background: passwordMsg.type === 'error' ? 'rgba(255,82,82,0.12)' : 'rgba(59,183,255,0.12)',
                  border: `1px solid ${passwordMsg.type === 'error' ? 'rgba(255,82,82,0.25)' : 'rgba(59,183,255,0.25)'}`,
                  color: passwordMsg.type === 'error' ? '#FF5252' : '#3BB7FF'
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.new_password} 
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.confirm_password} 
                    onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <button type="submit" className="btn-ghost" style={{ padding: '10px', fontSize: '0.85rem', marginTop: '4px' }}>
                Update Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
