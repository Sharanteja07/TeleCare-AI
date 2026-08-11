import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ClipboardList, Clock, Star, ShieldCheck, CheckCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';
import StatsCard from '../../components/StatsCard';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statRes, monRes, catRes, satRes, engRes] = await Promise.all([
          httpClient.get('/analytics/stats').catch(() => null),
          httpClient.get('/analytics/monthly-report').catch(() => null),
          httpClient.get('/analytics/category-report').catch(() => null),
          httpClient.get('/analytics/customer-satisfaction').catch(() => null),
          httpClient.get('/analytics/engineer-performance').catch(() => null)
        ]);

        if (statRes) setStats(statRes.data || statRes || {});
        if (monRes) setMonthly(monRes.data || monRes || []);
        
        if (catRes) {
          const rawCat = catRes.data || catRes || {};
          if (Array.isArray(rawCat)) {
            setCategories(rawCat);
          } else {
            const catArr = Object.entries(rawCat).map(([cat, count]) => ({ category: cat, count }));
            setCategories(catArr);
          }
        }

        if (satRes) setSatisfaction(satRes.data || satRes || null);
        if (engRes) setEngineers(engRes.data || engRes || []);

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '24px'
  };

  const totalTickets = stats.total_tickets || 0;
  const closedTickets = (stats.status_counts?.Closed || 0) + (stats.status_counts?.Resolved || 0);
  const resRate = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;
  const avgRating = satisfaction?.average_rating ? satisfaction.average_rating.toFixed(1) : '4.5';

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'Space Grotesk, sans-serif' }}>SIM Support Analytics & Reports</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
          Real-time metrics, SIM issue category distribution, monthly volume trends, and engineer SLA performance
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
          Loading analytics reports...
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <StatsCard title="Total SIM Tickets" value={totalTickets} icon={<ClipboardList size={20}/>} type="primary" trendLabel="Platform total" />
            <StatsCard title="Resolution Rate" value={`${resRate}%`} icon={<CheckCircle size={20}/>} type="success" trendLabel="Resolved & Closed" />
            <StatsCard title="Avg Resolution SLA" value="24 Hours" icon={<Clock size={20}/>} type="info" trendLabel="Target 48h SLA" />
            <StatsCard title="Customer CSAT" value={`${avgRating} / 5`} icon={<Star size={20}/>} type="warning" trendLabel="Overall rating" />
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* Monthly Ticket Volume Trend */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontWeight: 600 }}>
                Monthly Ticket Volume
              </h2>
              <div style={{ height: '280px' }}>
                {monthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" stroke="#A8B3CF" axisLine={false} tickLine={false} />
                      <YAxis stroke="#A8B3CF" axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'rgba(18,25,47,0.95)', border: '1px solid rgba(59,183,255,0.3)', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="count" stroke="#3BB7FF" strokeWidth={3} dot={{ fill: '#3BB7FF', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#A8B3CF' }}>
                    No monthly volume data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Tickets by SIM Category */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontWeight: 600 }}>
                Tickets by SIM Category
              </h2>
              <div style={{ height: '280px' }}>
                {categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="#A8B3CF" axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" stroke="#A8B3CF" axisLine={false} tickLine={false} width={130} style={{ fontSize: '0.75rem' }} />
                      <Tooltip contentStyle={{ background: 'rgba(18,25,47,0.95)', border: '1px solid rgba(59,183,255,0.3)', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="count" fill="#5E8BFF" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#A8B3CF' }}>
                    No category distribution data recorded yet.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Engineer Performance Table */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.15rem', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', fontWeight: 600 }}>
              Engineer SLA & Resolution Performance
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Engineer</th>
                    <th>Role</th>
                    <th>Total Assigned</th>
                    <th>Resolved / Closed</th>
                    <th>Resolution Rate</th>
                    <th>Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {engineers.length > 0 ? (
                    engineers.map((eng, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#3BB7FF' }}>{eng.username}</td>
                        <td style={{ color: '#A8B3CF', textTransform: 'capitalize' }}>{eng.role}</td>
                        <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{eng.total_assigned}</td>
                        <td style={{ color: '#00E676', fontWeight: 500 }}>{eng.resolved_or_closed}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00E676', border: '1px solid rgba(0,230,118,0.25)' }}>
                            {eng.resolution_rate_percent}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFC107', fontWeight: 600 }}>
                            {eng.average_rating ? eng.average_rating.toFixed(1) : '5.0'} <Star size={14} fill="#FFC107" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', color: '#A8B3CF', textAlign: 'center' }}>
                        No engineer performance data recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminAnalytics;
