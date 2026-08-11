import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Clock, CheckCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, attRes, timeRes] = await Promise.all([
          httpClient.get(`/tickets/${id}`),
          httpClient.get(`/tickets/${id}/attachments`),
          httpClient.get(`/tickets/${id}/activities`)
        ]);
        setTicket(ticketRes.data || ticketRes);
        setAttachments(attRes.data?.attachments || attRes.attachments || []);
        setTimeline(timeRes.data?.activities || timeRes.activities || []);
      } catch (error) {
        console.error('Error loading ticket details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await httpClient.post(`/tickets/${id}/attachments`, formData);
      const res = await httpClient.get(`/tickets/${id}/attachments`);
      setAttachments(res.data?.attachments || res.attachments || []);
      setFile(null);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleMarkResolved = async () => {
    try {
      await httpClient.put(`/tickets/${id}/status`, { status: 'Resolved' });
      setTicket(prev => prev ? { ...prev, status: 'Resolved' } : prev);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
      Loading ticket details...
    </div>
  );

  if (!ticket) return (
    <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>
      Ticket not found.
      <br/>
      <button onClick={() => navigate('/dashboard/tickets')} className="btn-primary" style={{ marginTop: '16px' }}>Back to Tickets</button>
    </div>
  );

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px', padding: '20px', marginBottom: '20px'
  };

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard/tickets')} style={{ background: 'none', border: 'none', color: '#A8B3CF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back to My Tickets
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Space Grotesk, sans-serif' }}>TCK-{ticket.id}: {ticket.title}</h1>
        <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: '1px solid rgba(59,183,255,0.25)' }}>{ticket.status}</span>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Incident Details</h2>
            <p style={{ color: '#A8B3CF', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{ticket.description}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#A8B3CF' }}>Category: <strong style={{ color: '#fff' }}>{ticket.category}</strong></span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#A8B3CF' }}>Priority: <strong style={{ color: '#fff' }}>{ticket.priority}</strong></span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#A8B3CF' }}>Created: <strong style={{ color: '#fff' }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}</strong></span>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Attachments</h2>
            {attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {attachments.map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7,11,24,0.5)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(120,160,255,0.1)' }}>
                    <span style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>{att.filename}</span>
                    <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#3BB7FF' }}><Download size={16} /></a>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>No attachments uploaded yet.</p>}
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px' }}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#A8B3CF', fontSize: '0.8rem' }} />
              <button onClick={handleFileUpload} disabled={!file} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: file ? 1 : 0.5 }}>Upload</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Status Timeline</h2>
            <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(59,183,255,0.2)' }}>
              {timeline.length > 0 ? timeline.map((act, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '5px', width: '12px', height: '12px', background: '#3BB7FF', borderRadius: '50%', boxShadow: '0 0 10px rgba(59,183,255,0.5)' }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}>{act.description}</p>
                  <span style={{ color: '#A8B3CF', fontSize: '0.75rem' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> {act.created_at ? new Date(act.created_at).toLocaleString() : 'N/A'}</span>
                </div>
              )) : (
                <p style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>Ticket created and awaiting action.</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Case Metadata</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#A8B3CF' }}>Status:</span> <span style={{ float: 'right', fontWeight: 600, color: '#3BB7FF' }}>{ticket.status}</span></div>
              <div><span style={{ color: '#A8B3CF' }}>Priority:</span> <span style={{ float: 'right', fontWeight: 600, color: '#FFC107' }}>{ticket.priority}</span></div>
              <div><span style={{ color: '#A8B3CF' }}>Category:</span> <span style={{ float: 'right', color: '#fff' }}>{ticket.category}</span></div>
              <div><span style={{ color: '#A8B3CF' }}>Assigned Engineer:</span> <span style={{ float: 'right', color: '#fff' }}>{ticket.assigned_engineer?.username || ticket.engineer?.username || 'Unassigned'}</span></div>
            </div>
          </div>

          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.1rem', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Quick Actions</h2>
              <button onClick={handleMarkResolved} className="btn-ghost" style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#00E676', borderColor: 'rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.1)' }}>
                <CheckCircle size={16} /> Mark as Resolved
              </button>
            </div>
          )}

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: '420px', display: 'flex', flexDirection: 'column' }}>
            <ChatWindow ticketId={id} currentUser={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
