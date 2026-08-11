const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = {
  'components/Sidebar.jsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Ticket, User, LogOut, Settings, Users, MessageSquare, BarChart } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'customer') {
      return [
        { path: '/customer/dashboard', name: 'Dashboard', icon: Home },
        { path: '/customer/tickets', name: 'Tickets', icon: Ticket },
        { path: '/customer/assistant', name: 'AI Assistant', icon: MessageSquare },
        { path: '/customer/profile', name: 'Profile', icon: User },
      ];
    }
    if (user.role === 'engineer') {
      return [
        { path: '/engineer/dashboard', name: 'Dashboard', icon: Home },
        { path: '/engineer/tickets', name: 'My Tickets', icon: Ticket },
        { path: '/engineer/profile', name: 'Profile', icon: User },
      ];
    }
    if (user.role === 'admin') {
      return [
        { path: '/admin/dashboard', name: 'Dashboard', icon: Home },
        { path: '/admin/tickets', name: 'Tickets', icon: Ticket },
        { path: '/admin/customers', name: 'Customers', icon: Users },
        { path: '/admin/engineers', name: 'Engineers', icon: Users },
        { path: '/admin/analytics', name: 'Analytics', icon: BarChart },
      ];
    }
    return [];
  };

  return (
    <div className="w-64 bg-bg-sidebar border-r border-border-dim flex flex-col h-screen text-text-primary">
      <div className="p-6 font-display font-bold text-xl tracking-wider text-color-primary">
        AI TELECOM
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        {getLinks().map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                \`flex items-center px-4 py-3 rounded-lg transition-colors \${isActive ? 'bg-color-primary bg-opacity-10 text-color-primary' : 'hover:bg-bg-card text-text-secondary hover:text-text-primary'}\`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {link.name}
            </NavLink>
          );
        })}
      </div>
      <div className="p-4 border-t border-border-dim">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.full_name}</span>
            <span className="text-xs text-text-secondary capitalize">{user?.role}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-bg-card rounded-lg text-color-danger">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
`,
  'components/Navbar.jsx': `import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  
  return (
    <div className="h-16 bg-bg-sidebar border-b border-border-dim flex items-center justify-between px-6">
      <div className="flex items-center bg-bg-app rounded-lg px-3 py-2 w-64 border border-border-dim">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none text-sm w-full text-text-primary"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-bg-card rounded-lg text-text-secondary hover:text-text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-color-danger rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-color-primary text-white flex items-center justify-center font-bold text-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};
`,
  'components/ProtectedRoute.jsx': `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-bg-app text-text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role !== allowedRole) {
    if (user.role === 'customer') return <Navigate to="/customer/dashboard" />;
    if (user.role === 'engineer') return <Navigate to="/engineer/dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  }

  return <Outlet />;
};
`,
  'layouts/CustomerLayout.jsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const CustomerLayout = () => {
  return (
    <div className="flex h-screen bg-bg-app overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`,
  'layouts/EngineerLayout.jsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const EngineerLayout = () => {
  return (
    <div className="flex h-screen bg-bg-app overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`,
  'layouts/AdminLayout.jsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-bg-app overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
