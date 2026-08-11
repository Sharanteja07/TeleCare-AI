import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { EngineerLayout } from './layouts/EngineerLayout';

// Auth Pages (Common Entry Point)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import RaiseTicket from './pages/customer/RaiseTicket';
import TicketHistory from './pages/customer/TicketHistory';
import CustomerTicketDetails from './pages/customer/TicketDetails';
import AIAssistant from './pages/customer/AIAssistant';
import Feedback from './pages/customer/Feedback';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminTicketDetails from './pages/admin/TicketDetails';
import AdminEngineers from './pages/admin/Engineers';
import AdminAnalytics from './pages/admin/Analytics';
import AdminFeedback from './pages/admin/Feedback';

// Engineer Pages
import EngineerDashboard from './pages/engineer/Dashboard';
import AssignedTickets from './pages/engineer/AssignedTickets';
import EngineerTicketDetails from './pages/engineer/TicketDetails';

// Guards
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Common Public Entry Point (Single Common Login Page) */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Primary Customer Dashboard Routes (/dashboard) */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute allowedRole="customer" />}
          >
            <Route element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="tickets" element={<TicketHistory />} />
              <Route path="tickets/create" element={<RaiseTicket />} />
              <Route path="tickets/:id" element={<CustomerTicketDetails />} />
              <Route path="chat" element={<AIAssistant />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Legacy /customer Alias Route (Redirect to /dashboard) */}
          <Route path="/customer/*" element={<Navigate to="/dashboard" replace />} />

          {/* Engineer Module Routes */}
          <Route 
            path="/engineer" 
            element={<ProtectedRoute allowedRole="engineer" />}
          >
            <Route element={<EngineerLayout />}>
              <Route index element={<EngineerDashboard />} />
              <Route path="dashboard" element={<EngineerDashboard />} />
              <Route path="tickets" element={<AssignedTickets />} />
              <Route path="tickets/:id" element={<EngineerTicketDetails />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Module Routes */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute allowedRole="admin" />}
          >
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="tickets/:id" element={<AdminTicketDetails />} />
              <Route path="engineers" element={<AdminEngineers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Default Catch-all Redirect to Common Entry Point */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
