import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, Bot, User, LogOut, Settings,
  Users, MessageSquare, BarChart3, Headphones, Shield,
  ChevronRight, Wifi, X, Zap
} from 'lucide-react';

const CUSTOMER_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/tickets/create', label: 'New Ticket', icon: ClipboardList },
  { path: '/dashboard/tickets', label: 'My Tickets', icon: Headphones },
  { path: '/dashboard/chat', label: 'Ask AI Support', icon: Bot },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const ENGINEER_LINKS = [
  { path: '/engineer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/engineer/tickets', label: 'My Tickets', icon: ClipboardList },
  { path: '/engineer/profile', label: 'Profile', icon: User },
];

const ADMIN_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/tickets', label: 'Tickets', icon: ClipboardList },
  { path: '/admin/engineers', label: 'Engineers', icon: Headphones },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/admin/profile', label: 'Profile', icon: User },
];

const ROLE_LINKS = {
  customer: CUSTOMER_LINKS,
  engineer: ENGINEER_LINKS,
  admin: ADMIN_LINKS,
};

const ROLE_LABELS = {
  customer: { label: 'Customer Portal', color: '#3BB7FF', icon: Wifi },
  engineer: { label: 'Engineer Portal', color: '#00E676', icon: Headphones },
  admin: { label: 'Admin Portal', color: '#5E8BFF', icon: Shield },
};

export const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = ROLE_LINKS[user?.role] || [];
  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.customer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;

    // Exact matching for specific routes
    if (linkPath === '/dashboard') return currentPath === '/dashboard';
    if (linkPath === '/engineer/dashboard') return currentPath === '/engineer/dashboard' || currentPath === '/engineer';
    if (linkPath === '/admin/dashboard') return currentPath === '/admin/dashboard' || currentPath === '/admin';

    // New Ticket exact match
    if (linkPath === '/dashboard/tickets/create') return currentPath === '/dashboard/tickets/create';

    // My Tickets match (exact or ticket details, but excluding create)
    if (linkPath === '/dashboard/tickets') {
      return currentPath === '/dashboard/tickets' || (currentPath.startsWith('/dashboard/tickets/') && currentPath !== '/dashboard/tickets/create');
    }

    if (linkPath === '/engineer/tickets') {
      return currentPath === '/engineer/tickets' || currentPath.startsWith('/engineer/tickets/');
    }

    if (linkPath === '/admin/tickets') {
      return currentPath === '/admin/tickets' || currentPath.startsWith('/admin/tickets/');
    }

    return currentPath === linkPath;
  };

  const initials = (user?.username || user?.email || 'U')
    .toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[240px] flex flex-col
          lg:relative lg:translate-x-0 transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(13,18,36,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(120,160,255,0.1)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(120,160,255,0.1)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)',
              boxShadow: '0 0 20px rgba(59,183,255,0.4)',
            }}
          >
            <Zap size={16} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-none tracking-wide">TeleCare AI</div>
            <div className="text-[10px] mt-0.5" style={{ color: roleInfo.color }}>{roleInfo.label}</div>
          </div>
          {mobileOpen && (
            <button onClick={onClose} className="ml-auto text-[#A8B3CF] hover:text-white lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);

            return (
              <div
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  if (onClose) onClose();
                }}
                className={`nav-item group ${active ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span
                  className="nav-icon transition-all duration-300"
                  style={active ? { color: '#3BB7FF', filter: 'drop-shadow(0 0 6px rgba(59,183,255,0.8))' } : { color: '#A8B3CF' }}
                >
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-medium">{link.label}</span>
                {active && (
                  <ChevronRight size={14} style={{ color: '#3BB7FF' }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(120,160,255,0.1)' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-default"
            style={{ background: 'rgba(59,183,255,0.05)', border: '1px solid rgba(59,183,255,0.1)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.full_name || user?.username || 'User'}
              </div>
              <div className="text-[10px] capitalize" style={{ color: roleInfo.color }}>
                {user?.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-[#A8B3CF] hover:text-[#FF5252] transition-all duration-200"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
