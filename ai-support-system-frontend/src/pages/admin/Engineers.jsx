import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Mail, Shield, CheckCircle, Clock, Activity, Eye, UserCheck } from 'lucide-react';
import httpClient from '../../services/httpClient';

const AdminEngineers = () => {
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uRes, tRes] = await Promise.all([
          httpClient.get('/users'),
          httpClient.get('/tickets?limit=500')
        ]);

        const uList = uRes.data || uRes || [];
        const tList = tRes.data?.tickets || tRes.data || [];

        setEngineers(uList.filter(u => u.role === 'engineer'));
        setTickets(Array.isArray(tList) ? tList : []);
      } catch (error) {
        console.error('Error loading engineers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWorkloadLevel = (assignedCount) => {
    if (assignedCount >= 6) return { label: 'High Workload', color: '#FF5252', bg: 'rgba(255,82,82,0.12)', border: 'rgba(255,82,82,0.25)' };
    if (assignedCount >= 3) return { label: 'Medium Workload', color: '#FFC107', bg: 'rgba(255,193,7,0.12)', border: 'rgba(255,193,7,0.25)' };
    return { label: 'Low Workload', color: '#00E676', bg: 'rgba(0,230,118,0.12)', border: 'rgba(0,230,118,0.25)' };
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

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'Space Grotesk, sans-serif' }}>Support Engineers Workload</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
            Monitor active ticket assignments and workload across support engineers
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
          Loading engineers and workload metrics...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {engineers.map(eng => {
            const engTickets = tickets.filter(t => t.engineer_id === eng.id);
            const totalAssigned = engTickets.length;
            const openCount = engTickets.filter(t => t.status === 'Open').length;
            const inProgressCount = engTickets.filter(t => t.status === 'In Progress').length;
            const resolvedCount = engTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

            const workload = getWorkloadLevel(openCount + inProgressCount);

            return (
              <div key={eng.id} style={cardStyle}>
                
                {/* Header info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #00E676, #3BB7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                      {eng.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{eng.username}</h3>
                      <div style={{ fontSize: '0.78rem', color: '#A8B3CF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {eng.email}
                      </div>
                    </div>
                  </div>

                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: workload.bg, color: workload.color, border: `1px solid ${workload.border}` }}>
                    {workload.label}
                  </span>
                </div>

                {/* Workload Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '20px', background: 'rgba(7,11,24,0.6)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(120,160,255,0.1)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#A8B3CF' }}>Total</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{totalAssigned}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#FFC107' }}>Open</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFC107' }}>{openCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#3BB7FF' }}>Active</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3BB7FF' }}>{inProgressCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#00E676' }}>Fixed</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00E676' }}>{resolvedCount}</div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate(`/admin/tickets?engineer_id=${eng.id}`)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.82rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> View Assigned Tickets ({totalAssigned})
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AdminEngineers;
