import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut, Settings, ChevronDown, Menu, X, Zap } from 'lucide-react';
import httpClient from '../services/httpClient';

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs]         = useState([]);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const unread = notifs.filter(n => !n.is_read).length;

  useEffect(() => {
    httpClient.get('/api/notifications').then(r => {
      setNotifs(r.data?.notifications || []);
    }).catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await httpClient.put('/api/notifications/read-all').catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.username || 'U').toUpperCase().slice(0, 2);
  const roleBadgeColor = { customer: '#3BB7FF', engineer: '#00E676', admin: '#5E8BFF' };
  const badgeColor = roleBadgeColor[user?.role] || '#3BB7FF';

  return (
    <header
      className="relative z-30 flex items-center gap-3 px-4 py-3 shrink-0"
      style={{
        background: 'rgba(13,18,36,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(120,160,255,0.1)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-[#A8B3CF] hover:text-white hover:bg-white/5 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Brand (mobile) */}
      <div className="lg:hidden flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)' }}
        >
          <Zap size={13} className="text-white" />
        </div>
        <span className="font-display font-bold text-white text-sm">TeleCare AI</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B3CF]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tickets, customers..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl text-white placeholder-[#A8B3CF] outline-none transition-all duration-200"
            style={{
              background: 'rgba(7,11,24,0.7)',
              border: '1px solid rgba(120,160,255,0.15)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#3BB7FF';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.12)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(120,160,255,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            className="relative p-2 rounded-xl text-[#A8B3CF] hover:text-white transition-all duration-200 hover:bg-white/5"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: '#FF5252', boxShadow: '0 0 8px rgba(255,82,82,0.6)' }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn"
              style={{
                background: 'rgba(13,18,36,0.97)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(120,160,255,0.15)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(59,183,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(120,160,255,0.1)' }}>
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#3BB7FF] hover:text-white transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={24} className="mx-auto mb-2 text-[#A8B3CF] opacity-40" />
                    <p className="text-sm text-[#A8B3CF]">No notifications</p>
                  </div>
                ) : notifs.slice(0, 8).map(n => (
                  <div
                    key={n.id}
                    onClick={() => { setNotifOpen(false); if (n.ticket_id) navigate(`/customer/ticket-history/${n.ticket_id}`); }}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-white/4 border-b"
                    style={{ borderColor: 'rgba(120,160,255,0.06)', opacity: n.is_read ? 0.6 : 1 }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: n.is_read ? '#A8B3CF' : '#3BB7FF', boxShadow: n.is_read ? 'none' : '0 0 6px rgba(59,183,255,0.8)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">{n.title || n.message}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#A8B3CF' }}>{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/5"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white"
              style={{ background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-none">
                {user?.full_name || user?.username || 'User'}
              </div>
              <div className="text-[10px] mt-0.5 capitalize" style={{ color: badgeColor }}>{user?.role}</div>
            </div>
            <ChevronDown size={14} className={`text-[#A8B3CF] transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn"
              style={{
                background: 'rgba(13,18,36,0.97)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(120,160,255,0.15)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(120,160,255,0.1)' }}>
                <p className="text-sm font-semibold text-white">{user?.full_name || user?.username}</p>
                <p className="text-xs mt-0.5" style={{ color: '#A8B3CF' }}>{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to={`/${user?.role}/profile`}
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A8B3CF] hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <User size={15} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF5252] hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
