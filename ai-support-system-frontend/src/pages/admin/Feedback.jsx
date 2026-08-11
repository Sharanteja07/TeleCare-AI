import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Eye, Shield } from 'lucide-react';
import httpClient from '../../services/httpClient';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get('/feedback');
        const list = res.data || res || [];
        setFeedbacks(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching admin feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
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

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'Space Grotesk, sans-serif' }}>Customer Ratings & Feedback</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
          Review customer satisfaction ratings and comments for resolved SIM support tickets
        </p>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#A8B3CF' }}>
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
            Loading customer feedback...
          </div>
        ) : feedbacks.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer ID</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f, idx) => (
                  <tr key={f.id || idx}>
                    <td style={{ fontWeight: 600, color: '#3BB7FF' }}>#{f.ticket_id}</td>
                    <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                      Customer #{f.customer_id}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFC107', fontWeight: 700 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < f.rating ? '#FFC107' : 'none'} color="#FFC107" />
                        ))}
                        <span style={{ marginLeft: '4px', color: '#fff', fontSize: '0.8rem' }}>({f.rating}/5)</span>
                      </div>
                    </td>
                    <td style={{ color: '#A8B3CF', maxWidth: '400px' }}>
                      {f.comment ? `"${f.comment}"` : 'No written review'}
                    </td>
                    <td style={{ color: '#A8B3CF', fontSize: '0.8rem' }}>
                      {f.created_at ? new Date(f.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/admin/tickets/${f.ticket_id}`)}
                        className="btn-primary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} /> View Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8B3CF' }}>
            <MessageSquare size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ margin: 0, color: '#fff' }}>No feedback submitted yet</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Customer reviews will appear here once submitted for resolved tickets.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminFeedback;
