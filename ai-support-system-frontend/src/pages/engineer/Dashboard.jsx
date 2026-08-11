import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, Eye, AlertCircle, Activity, UserCheck } from 'lucide-react';
import httpClient from '../../services/httpClient';
import StatsCard from '../../components/StatsCard';

const EngineerDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchEngineerData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Step 2 & 3: Verify authenticated engineer user
      const userRes = await httpClient.get('/users/me');
      const currentUser = userRes.data || userRes;

      if (currentUser.role !== 'engineer') {
        if (currentUser.role === 'admin') navigate('/admin/dashboard');
        else navigate('/dashboard');
        return;
      }

      // Step 4: Call GET /api/tickets (backend applies Ticket.engineer_id == current_user.id)
      const ticketRes = await httpClient.get('/tickets?page=1&limit=500');
      const rawList = ticketRes.data?.tickets || ticketRes.data || [];
      const ticketList = Array.isArray(rawList) ? rawList : [];

      setTickets(ticketList);
    } catch (err) {
      console.error('Error fetching engineer dashboard:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setErrorMsg('You do not have permission to access this resource.');
      } else if (err.response?.status === 500) {
        setErrorMsg('Something went wrong. Please try again.');
      } else {
        setErrorMsg(err.response?.data?.detail || 'Failed to load assigned tickets.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEngineerData();
  }, [fetchEngineerData]);

  // Compute real metrics from assigned tickets
  const totalAssigned = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'High').length;

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '24px'
  };

  const getBadgeStyle = (val) => {
    const styles = {
      Open: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
      'In Progress': { bg: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: 'rgba(59,183,255,0.25)' },
      Resolved: { bg: 'rgba(0,230,118,0.12)', color: '#00E676', border: 'rgba(0,230,118,0.25)' },
      Closed: { bg: 'rgba(168,179,207,0.12)', color: '#A8B3CF', border: 'rgba(168,179,207,0.2)' },
      High: { bg: 'rgba(255,82,82,0.12)', color: '#FF5252', border: 'rgba(255,82,82,0.25)' },
      Medium: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
      Low: { bg: 'rgba(0,230,118,0.12)', color: '#00E676', border: 'rgba(0,230,118,0.25)' }
    };
    return styles[val] || styles.Closed;
  };

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div 
        style={{ 
          ...cardStyle, 
          marginBottom: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, rgba(18,25,47,0.9) 0%, rgba(0,230,118,0.08) 100%)', 
          borderLeft: '4px solid #00E676',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <UserCheck size={18} style={{ color: '#00E676' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#00E676', textTransform: 'uppercase', letterSpacing: '1px' }}>Support Engineer Portal</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Engineer Task Command Center
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
            View and resolve customer SIM support tickets assigned to you by administrators
          </p>
        </div>

        <button 
          onClick={fetchEngineerData} 
          className="btn-ghost" 
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          Refresh Sync
        </button>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '24px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,82,82,0.12)', border: '1px solid rgba(255,82,82,0.25)', color: '#FF5252', fontSize: '0.88rem' }}>
          {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatsCard title="Assigned Tickets" value={totalAssigned} icon={<ClipboardList size={20}/>} type="primary" trendLabel="Total workload" />
        <StatsCard title="Open" value={openCount} icon={<Clock size={20}/>} type="warning" trendLabel="Awaiting action" />
        <StatsCard title="In Progress" value={inProgressCount} icon={<Activity size={20}/>} type="info" trendLabel="Currently active" />
        <StatsCard title="Resolved" value={resolvedCount} icon={<CheckCircle size={20}/>} type="success" trendLabel="Completed tasks" />
        <StatsCard title="High Priority" value={highPriorityCount} icon={<AlertCircle size={20}/>} type="danger" trendLabel="Urgent SIM issues" />
      </div>

      {/* Assigned Tickets Table */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Assigned SIM Support Tickets ({totalAssigned})
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
            <div className="w-8 h-8 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin mx-auto mb-3" />
            Loading assigned tickets...
          </div>
        ) : tickets.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Title</th>
                  <th>SIM Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => {
                  const sStyle = getBadgeStyle(t.status);
                  const pStyle = getBadgeStyle(t.priority);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: '#3BB7FF' }}>#{t.id}</td>
                      <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                        {t.customer?.username || (t.customer_id ? `Customer #${t.customer_id}` : 'Customer')}
                      </td>
                      <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{t.title}</td>
                      <td style={{ color: '#A8B3CF' }}>{t.category}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}` }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ color: '#A8B3CF', fontSize: '0.8rem' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/engineer/tickets/${t.id}`)} 
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8B3CF' }}>
            <ClipboardList size={44} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>No tickets assigned yet</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '6px', color: '#A8B3CF', maxWidth: '460px', margin: '6px auto 0' }}>
              Your assigned SIM support tickets will appear here when an administrator assigns them to you.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default EngineerDashboard;
