import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ClipboardList, CheckCircle, Clock, Bot, Plus, Zap, User, 
  ArrowRight, Search, Filter, LogOut, Mail, Shield, Paperclip, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import httpClient from '../../services/httpClient';
import StatsCard from '../../components/StatsCard';
import { SIM_CATEGORIES } from './RaiseTicket';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await httpClient.get('/tickets', { params });
      const rawTickets = res.data?.tickets || res.data || [];
      const ticketList = Array.isArray(rawTickets) ? rawTickets : [];

      setTickets(ticketList);

      // Compute statistics
      const total = ticketList.length;
      const open = ticketList.filter(t => t.status === 'Open').length;
      const inProgress = ticketList.filter(t => t.status === 'In Progress').length;
      const resolved = ticketList.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

      setStats({ total, open, inProgress, resolved });
    } catch (error) {
      console.error('Error loading customer tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBadgeStyle = (status) => {
    const styles = {
      Open: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
      'In Progress': { bg: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: 'rgba(59,183,255,0.25)' },
      Resolved: { bg: 'rgba(0,230,118,0.12)', color: '#00E676', border: 'rgba(0,230,118,0.25)' },
      Closed: { bg: 'rgba(168,179,207,0.12)', color: '#A8B3CF', border: 'rgba(168,179,207,0.2)' }
    };
    return styles[status] || styles.Open;
  };

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
  };

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* SECTION A: HEADER */}
      <div 
        style={{ 
          ...cardStyle, 
          padding: '24px', 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(18,25,47,0.9) 0%, rgba(59,183,255,0.08) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              width: 52, height: 52, borderRadius: '16px', 
              background: 'linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 25px rgba(59,183,255,0.4)'
            }}
          >
            <Zap size={28} className="text-white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome, {user?.username || 'Customer'}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: '#A8B3CF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} style={{ color: '#3BB7FF' }} /> {user?.email || 'N/A'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: '#00E676' }} /> Role: <strong style={{ color: '#FFFFFF', textTransform: 'capitalize' }}>{user?.role || 'customer'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/dashboard/tickets/create')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Create Support Ticket
          </button>
          <button 
            onClick={handleLogout}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF5252', borderColor: 'rgba(255,82,82,0.3)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* SECTION B: STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatsCard 
          title="Total SIM Requests" 
          value={stats.total} 
          icon={<ClipboardList size={22} />} 
          type="primary" 
          trendLabel="All submitted requests"
        />
        <StatsCard 
          title="Open SIM Tickets" 
          value={stats.open} 
          icon={<Clock size={22} />} 
          type="warning" 
          trendLabel="Awaiting engineer review"
        />
        <StatsCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={<Activity size={22} />} 
          type="info" 
          trendLabel="Currently being resolved"
        />
        <StatsCard 
          title="Resolved & Closed" 
          value={stats.resolved} 
          icon={<CheckCircle size={22} />} 
          type="success" 
          trendLabel="Successfully fixed"
        />
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div 
          onClick={() => navigate('/dashboard/chat')}
          style={{ ...cardStyle, padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s' }}
          className="hover:border-cyan-500/50"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Bot size={20} style={{ color: '#3BB7FF' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3BB7FF', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Assistant</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>SIM Support Assistant</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#A8B3CF' }}>Troubleshoot SIM activation, eSIM, PIN/PUK, or replacement</p>
          </div>
          <ArrowRight size={18} style={{ color: '#3BB7FF' }} />
        </div>

        <div 
          onClick={() => navigate('/dashboard/tickets/create')}
          style={{ ...cardStyle, padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s' }}
          className="hover:border-green-500/50"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Plus size={20} style={{ color: '#00E676' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#00E676', textTransform: 'uppercase', letterSpacing: '1px' }}>New Request</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Create SIM Support Ticket</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#A8B3CF' }}>Submit SIM activation, replacement, or billing issues</p>
          </div>
          <ArrowRight size={18} style={{ color: '#00E676' }} />
        </div>

      </div>

      {/* SECTION C, E, F: MY TICKETS WITH SEARCH & FILTERS */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        
        {/* Table Header & Search/Filters Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>My SIM Tickets</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#A8B3CF' }}>Track and manage your SIM support tickets in real-time</p>
          </div>

          {/* Search & Filter Inputs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8B3CF' }} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass"
                style={{ paddingLeft: '34px', fontSize: '0.8rem' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-glass"
              style={{ width: '120px', fontSize: '0.8rem' }}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-glass"
              style={{ width: '120px', fontSize: '0.8rem' }}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-glass"
              style={{ width: '150px', fontSize: '0.8rem' }}
            >
              <option value="">All SIM Issues</option>
              {SIM_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A8B3CF' }}>
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
              Loading tickets...
            </div>
          ) : tickets.length > 0 ? (
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>SIM Issue Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Engineer</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const statusStyle = getBadgeStyle(t.status);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: '#3BB7FF' }}>TCK-{t.id}</td>
                      <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{t.title}</td>
                      <td style={{ color: '#A8B3CF' }}>{t.category}</td>
                      <td>
                        <span 
                          style={{ 
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: t.priority === 'High' ? 'rgba(255,82,82,0.12)' : t.priority === 'Medium' ? 'rgba(255,193,7,0.12)' : 'rgba(0,230,118,0.12)',
                            color: t.priority === 'High' ? '#FF5252' : t.priority === 'Medium' ? '#FFC107' : '#00E676',
                            border: `1px solid ${t.priority === 'High' ? 'rgba(255,82,82,0.25)' : t.priority === 'Medium' ? 'rgba(255,193,7,0.25)' : 'rgba(0,230,118,0.25)'}`
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span 
                          style={{ 
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ color: '#A8B3CF' }}>
                        {t.engineer?.username || t.engineer_id ? `ENG-${t.engineer_id}` : 'Unassigned'}
                      </td>
                      <td style={{ color: '#A8B3CF' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/dashboard/tickets/${t.id}`)}
                          className="btn-ghost"
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#A8B3CF' }}>
              <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No SIM support tickets found.</p>
              <p style={{ fontSize: '0.8rem', color: '#A8B3CF', marginTop: '4px' }}>Create a ticket or clear your search filters.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CustomerDashboard;
