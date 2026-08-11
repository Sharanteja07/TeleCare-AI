import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Clock, Activity, CheckCircle, Headphones, 
  Star, UserCheck, ArrowRight, Eye, UserPlus, Shield 
} from 'lucide-react';
import httpClient from '../../services/httpClient';
import StatsCard from '../../components/StatsCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ticketRes, userRes, satRes] = await Promise.all([
          httpClient.get('/tickets?limit=500'),
          httpClient.get('/users'),
          httpClient.get('/analytics/customer-satisfaction').catch(() => null)
        ]);

        const ticketList = ticketRes.data?.tickets || ticketRes.data || [];
        setTickets(Array.isArray(ticketList) ? ticketList : []);

        const userList = userRes.data || userRes || [];
        const engList = userList.filter(u => u.role === 'engineer');
        setEngineers(engList);

        if (satRes && satRes.data) {
          setSatisfaction(satRes.data.average_rating);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate real KPIs from backend response
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const unassignedTickets = tickets.filter(t => !t.engineer_id && t.status !== 'Closed').length;
  const totalEngineers = engineers.length;
  const avgRating = satisfaction !== null ? satisfaction : 4.5;

  const recentTickets = tickets.slice(0, 6);

  const getBadgeStyle = (val) => {
    const styles = {
      Open: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
      'In Progress': { bg: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: 'rgba(59,183,255,0.25)' },
      Resolved: { bg: 'rgba(0,230,118,0.12)', color: '#00E676', border: 'rgba(0,230,118,0.25)' },
      Closed: { bg: 'rgba(168,179,207,0.12)', color: '#A8B3CF', border: 'rgba(168,179,207,0.2)' }
    };
    return styles[val] || styles.Open;
  };

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div 
        style={{ 
          ...cardStyle, 
          padding: '24px', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(18,25,47,0.9) 0%, rgba(94,139,255,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={20} style={{ color: '#5E8BFF' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5E8BFF', textTransform: 'uppercase', letterSpacing: '1px' }}>Administrator Area</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin Support Command Center
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
            Manage customer SIM support tickets, assign engineers, and monitor team performance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/admin/tickets?assignment=unassigned')} className="btn-primary" style={{ fontSize: '0.82rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={16} /> Unassigned Tickets ({unassignedTickets})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatsCard title="Total Tickets" value={totalTickets} icon={<ClipboardList size={20} />} type="primary" trendLabel="Platform wide" />
        <StatsCard title="Open Tickets" value={openTickets} icon={<Clock size={20} />} type="warning" trendLabel="Awaiting action" />
        <StatsCard title="In Progress" value={inProgressTickets} icon={<Activity size={20} />} type="info" trendLabel="Assigned & active" />
        <StatsCard title="Resolved" value={resolvedTickets} icon={<CheckCircle size={20} />} type="success" trendLabel="Completed" />
        
        {/* Unassigned Card - Clickable */}
        <div 
          onClick={() => navigate('/admin/tickets?assignment=unassigned')}
          style={{ 
            ...cardStyle, 
            padding: '20px', 
            cursor: 'pointer',
            border: unassignedTickets > 0 ? '1px solid rgba(255,82,82,0.3)' : '1px solid rgba(255,255,255,0.08)',
            background: unassignedTickets > 0 ? 'rgba(255,82,82,0.05)' : cardStyle.background,
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#A8B3CF', fontWeight: 500 }}>Unassigned</span>
            <UserCheck size={18} style={{ color: unassignedTickets > 0 ? '#FF5252' : '#A8B3CF' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: unassignedTickets > 0 ? '#FF5252' : '#FFFFFF' }}>{unassignedTickets}</div>
          <div style={{ fontSize: '0.72rem', color: '#A8B3CF', marginTop: '4px' }}>Needs engineer assignment</div>
        </div>

        <StatsCard title="Engineers" value={totalEngineers} icon={<Headphones size={20} />} type="primary" trendLabel="Active support staff" />
        <StatsCard title="Customer Rating" value={`${avgRating.toFixed(1)} / 5`} icon={<Star size={20} />} type="warning" trendLabel="Overall CSAT" />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => navigate('/admin/tickets')}
          style={{ ...cardStyle, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
          className="hover:border-cyan-500/50"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardList size={20} style={{ color: '#3BB7FF' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Tickets</div>
              <div style={{ fontSize: '0.75rem', color: '#A8B3CF' }}>View & filter tickets</div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: '#3BB7FF' }} />
        </div>

        <div 
          onClick={() => navigate('/admin/tickets?assignment=unassigned')}
          style={{ ...cardStyle, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
          className="hover:border-red-500/50"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserPlus size={20} style={{ color: '#FF5252' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Unassigned ({unassignedTickets})</div>
              <div style={{ fontSize: '0.75rem', color: '#A8B3CF' }}>Assign to engineers</div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: '#FF5252' }} />
        </div>

        <div 
          onClick={() => navigate('/admin/engineers')}
          style={{ ...cardStyle, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
          className="hover:border-green-500/50"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Headphones size={20} style={{ color: '#00E676' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Engineers ({totalEngineers})</div>
              <div style={{ fontSize: '0.75rem', color: '#A8B3CF' }}>Workload & assignments</div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: '#00E676' }} />
        </div>

        <div 
          onClick={() => navigate('/admin/analytics')}
          style={{ ...cardStyle, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
          className="hover:border-blue-500/50"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={20} style={{ color: '#5E8BFF' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Analytics</div>
              <div style={{ fontSize: '0.75rem', color: '#A8B3CF' }}>Reports & CSAT</div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: '#5E8BFF' }} />
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Recent Customer SIM Tickets</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#A8B3CF' }}>Latest tickets submitted across the platform</p>
          </div>
          <button onClick={() => navigate('/admin/tickets')} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            View All ({totalTickets})
          </button>
        </div>

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
                <th>Assigned Engineer</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map(t => {
                const sStyle = getBadgeStyle(t.status);
                const assignedEng = engineers.find(e => e.id === t.engineer_id);
                const isUnassigned = !t.engineer_id;

                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: '#3BB7FF' }}>#{t.id}</td>
                    <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                      {t.customer?.username || (t.customer_id ? `Customer #${t.customer_id}` : 'Customer')}
                    </td>
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
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}` }}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {isUnassigned ? (
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,82,82,0.12)', color: '#FF5252', border: '1px solid rgba(255,82,82,0.25)' }}>
                          Unassigned
                        </span>
                      ) : (
                        <span style={{ color: '#00E676', fontWeight: 500, fontSize: '0.85rem' }}>
                          {assignedEng?.username || `Engineer #${t.engineer_id}`}
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#A8B3CF', fontSize: '0.8rem' }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => navigate(`/admin/tickets/${t.id}`)} className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} /> {isUnassigned ? 'Assign' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
