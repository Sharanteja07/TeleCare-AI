import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Clock, CheckCircle, Save, Play, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import httpClient from '../../services/httpClient';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';

const EngineerTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchTicketDetails = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [ticketRes, attRes, timeRes] = await Promise.all([
        httpClient.get(`/tickets/${id}`),
        httpClient.get(`/tickets/${id}/attachments`).catch(() => ({ data: [] })),
        httpClient.get(`/tickets/${id}/activities`).catch(() => ({ data: [] }))
      ]);

      const tData = ticketRes.data || ticketRes;
      setTicket(tData);

      const attList = attRes.data?.attachments || attRes.data || [];
      setAttachments(Array.isArray(attList) ? attList : []);

      const actList = timeRes.data?.activities || timeRes.data || [];
      setTimeline(Array.isArray(actList) ? actList : []);

      setNotes(tData.engineer_notes || '');
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 403) {
        setErrorMsg('You do not have permission to access this resource.');
      } else if (error.response?.status === 404) {
        setErrorMsg('Ticket not found.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleStatusChange = async (newStatus) => {
    setActionMsg(null);
    try {
      const res = await httpClient.put(`/tickets/${id}/status`, { status: newStatus });
      const updated = res.data || res;
      setTicket(updated);
      setActionMsg({ text: `✓ Ticket status updated to ${newStatus}`, type: 'success' });

      // Refresh timeline activities
      const timeRes = await httpClient.get(`/tickets/${id}/activities`).catch(() => null);
      if (timeRes) {
        const actList = timeRes.data?.activities || timeRes.data || [];
        setTimeline(Array.isArray(actList) ? actList : []);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setActionMsg({ text: err.response?.data?.detail || 'Failed to update status.', type: 'error' });
    }
  };

  const handleSaveNotes = async () => {
    setActionMsg(null);
    try {
      const res = await httpClient.put(`/tickets/${id}/notes`, { engineer_notes: notes });
      const updated = res.data || res;
      setTicket(updated);
      setActionMsg({ text: '✓ Engineer notes saved successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to save notes:', err);
      setActionMsg({ text: 'Failed to save notes.', type: 'error' });
    }
  };

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px'
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin mx-auto mb-3" />
        Loading ticket details...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '40px', color: '#FFFFFF', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#FF5252', margin: '0 auto 16px' }} />
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{errorMsg}</h2>
        <button onClick={() => navigate('/engineer/dashboard')} className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Engineer Dashboard
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button onClick={() => navigate('/engineer/dashboard')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#A8B3CF' }}>Ticket ID:</span>
          <strong style={{ fontSize: '1.1rem', color: '#3BB7FF' }}>#{ticket.id}</strong>
        </div>
      </div>

      {actionMsg && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', background: actionMsg.type === 'error' ? 'rgba(255,82,82,0.12)' : 'rgba(0,230,118,0.12)', border: `1px solid ${actionMsg.type === 'error' ? 'rgba(255,82,82,0.25)' : 'rgba(0,230,118,0.25)'}`, color: actionMsg.type === 'error' ? '#FF5252' : '#00E676', fontSize: '0.85rem' }}>
          {actionMsg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Column */}
        <div style={{ flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Details Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3BB7FF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {ticket.category}
                </span>
                <h1 style={{ fontSize: '1.5rem', margin: '4px 0 0 0', fontWeight: 700 }}>{ticket.title}</h1>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: ticket.priority === 'High' ? 'rgba(255,82,82,0.12)' : 'rgba(255,193,7,0.12)', color: ticket.priority === 'High' ? '#FF5252' : '#FFC107', border: `1px solid ${ticket.priority === 'High' ? 'rgba(255,82,82,0.25)' : 'rgba(255,193,7,0.25)'}` }}>
                  {ticket.priority} Priority
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: ticket.status === 'Open' ? 'rgba(255,193,7,0.12)' : 'rgba(59,183,255,0.12)', color: ticket.status === 'Open' ? '#FFC107' : '#3BB7FF', border: '1px solid rgba(59,183,255,0.25)' }}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.88rem', color: '#A8B3CF', marginBottom: '8px', fontWeight: 600 }}>Description</h3>
              <div style={{ background: 'rgba(7,11,24,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(120,160,255,0.15)', color: '#FFFFFF', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.8rem', color: '#A8B3CF' }}>
              <div>Created: <strong style={{ color: '#fff' }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}</strong></div>
              <div>Last Updated: <strong style={{ color: '#fff' }}>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : 'N/A'}</strong></div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Customer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#A8B3CF', fontSize: '0.75rem' }}>Username</div>
                <strong style={{ color: '#fff' }}>{ticket.customer?.username || (ticket.customer_id ? `Customer #${ticket.customer_id}` : 'Customer')}</strong>
              </div>
              <div>
                <div style={{ color: '#A8B3CF', fontSize: '0.75rem' }}>Email Address</div>
                <strong style={{ color: '#fff' }}>{ticket.customer?.email || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Attachments</h3>
            {attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attachments.map(att => (
                  <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7,11,24,0.5)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(120,160,255,0.1)' }}>
                    <span style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>{att.filename}</span>
                    <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#3BB7FF' }}><Download size={16} /></a>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#A8B3CF', fontSize: '0.85rem', margin: 0 }}>No attachments attached to this ticket.</p>
            )}
          </div>

          {/* Internal Engineer Notes */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Engineer Notes (Internal)</h3>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4} 
              style={{
                width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
                borderRadius: '10px', color: '#fff', padding: '12px 14px', outline: 'none', transition: 'all 0.3s', marginBottom: '12px', resize: 'vertical', fontSize: '0.85rem'
              }} 
              placeholder="Add internal investigation notes here..." 
            />
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={handleSaveNotes} 
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} /> Save Notes
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Actions & Communication */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Update Actions */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Update Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleStatusChange('In Progress')} 
                disabled={ticket.status === 'In Progress'} 
                className="btn-primary" 
                style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: ticket.status === 'In Progress' ? 0.5 : 1 }}
              >
                <Play size={16} /> Set Status: In Progress
              </button>
              <button 
                onClick={() => handleStatusChange('Resolved')} 
                disabled={ticket.status === 'Resolved'} 
                className="btn-primary" 
                style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(0,230,118,0.15)', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)', opacity: ticket.status === 'Resolved' ? 0.5 : 1 }}
              >
                <CheckCircle size={16} /> Mark as Resolved
              </button>
              <button 
                onClick={() => handleStatusChange('Closed')} 
                disabled={ticket.status === 'Closed'} 
                className="btn-ghost" 
                style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: ticket.status === 'Closed' ? 0.5 : 1 }}
              >
                <XCircle size={16} /> Close Ticket
              </button>
            </div>
          </div>

          {/* Customer Chat Window */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: '420px', display: 'flex', flexDirection: 'column' }}>
            <ChatWindow ticketId={id} currentUser={user} />
          </div>

        </div>

      </div>

    </div>
  );
};

export default EngineerTicketDetails;
