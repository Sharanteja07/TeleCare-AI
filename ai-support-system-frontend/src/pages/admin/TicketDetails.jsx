import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Shield, Calendar, CheckCircle, 
  UserPlus, UserCheck, AlertCircle, Trash2, XCircle, Star, MessageSquare, Paperclip, Bot, Headphones 
} from 'lucide-react';
import httpClient from '../../services/httpClient';
import { SIM_CATEGORIES } from '../customer/RaiseTicket';

const AdminTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignNotice, setAssignNotice] = useState(null); // { text, type }

  const [chatMessages, setChatMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchTicketDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, uRes, cRes, fRes] = await Promise.all([
        httpClient.get(`/tickets/${id}`),
        httpClient.get('/users'),
        httpClient.get(`/chat/history/${id}`).catch(() => null),
        httpClient.get(`/feedback/${id}`).catch(() => null)
      ]);

      const tData = tRes.data || tRes;
      setTicket(tData);

      const userList = uRes.data || uRes || [];
      const engList = userList.filter(u => u.role === 'engineer' || u.role === 'admin');
      setEngineers(engList);

      if (tData.engineer_id) {
        setSelectedEngineerId(tData.engineer_id);
      }

      if (cRes && (cRes.data || Array.isArray(cRes))) {
        const msgs = cRes.data?.messages || cRes.data || cRes;
        setChatMessages(Array.isArray(msgs) ? msgs : []);
      }

      if (fRes && fRes.data) {
        setFeedback(fRes.data);
      } else {
        setFeedback(null);
      }

    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setActionMsg({ text: 'Ticket not found or error loading data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  // Main Admin Function: Assign Engineer
  const handleAssignEngineer = async (e) => {
    e?.preventDefault();
    if (!selectedEngineerId || assigning) return;

    setAssigning(true);
    setAssignNotice(null);

    try {
      const res = await httpClient.put(`/tickets/${id}/assign`, { engineer_id: Number(selectedEngineerId) });
      const updatedTicket = res.data || res;
      
      const assignedEng = engineers.find(eng => eng.id === Number(selectedEngineerId));
      const engName = assignedEng?.username || `Engineer #${selectedEngineerId}`;

      setTicket(updatedTicket);
      setAssignNotice({ text: `✓ Ticket successfully assigned to ${engName}`, type: 'success' });
    } catch (error) {
      console.error('Error assigning engineer:', error);
      setAssignNotice({ text: error.response?.data?.detail || 'Failed to assign engineer.', type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  // Status Change
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await httpClient.put(`/tickets/${id}/status`, { status: newStatus });
      setTicket(res.data || res);
      setActionMsg({ text: `✓ Ticket status updated to ${newStatus}`, type: 'success' });
    } catch (error) {
      setActionMsg({ text: 'Failed to update status.', type: 'error' });
    }
  };

  // Priority Change
  const handlePriorityChange = async (newPriority) => {
    try {
      const res = await httpClient.put(`/tickets/${id}`, { priority: newPriority });
      setTicket(res.data || res);
      setActionMsg({ text: `✓ Priority updated to ${newPriority}`, type: 'success' });
    } catch (error) {
      setActionMsg({ text: 'Failed to update priority.', type: 'error' });
    }
  };

  // Close Ticket
  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    try {
      const res = await httpClient.put(`/tickets/${id}/close`);
      setTicket(res.data || res);
      setActionMsg({ text: '✓ Ticket closed successfully.', type: 'success' });
    } catch (error) {
      setActionMsg({ text: 'Failed to close ticket.', type: 'error' });
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this ticket permanently?')) return;
    try {
      await httpClient.delete(`/tickets/${id}`);
      navigate('/admin/tickets');
    } catch (error) {
      setActionMsg({ text: 'Failed to delete ticket.', type: 'error' });
    }
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

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(7,11,24,0.8)',
    border: '1px solid rgba(120,160,255,0.2)',
    borderRadius: '10px',
    color: '#FFFFFF',
    padding: '10px 14px',
    fontSize: '0.85rem',
    outline: 'none',
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#A8B3CF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ padding: '40px', color: '#FFFFFF', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#FF5252', margin: '0 auto 16px' }} />
        <h2>Ticket Not Found</h2>
        <p style={{ color: '#A8B3CF' }}>The requested SIM ticket does not exist or has been deleted.</p>
        <button onClick={() => navigate('/admin/tickets')} className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Tickets
        </button>
      </div>
    );
  }

  const assignedEngineer = engineers.find(e => e.id === ticket.engineer_id);
  const isUnassigned = !ticket.engineer_id;

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button onClick={() => navigate('/admin/tickets')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Tickets
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

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Ticket Main Info & Customer Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 2 }}>
          
          {/* Main Info Card */}
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
              <h3 style={{ fontSize: '0.9rem', color: '#A8B3CF', marginBottom: '8px', fontWeight: 600 }}>Problem Description</h3>
              <div style={{ background: 'rgba(7,11,24,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(120,160,255,0.15)', color: '#FFFFFF', fontSize: '0.9rem', lineHeight: 1.6, whitespace: 'pre-wrap' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={18} style={{ color: '#3BB7FF' }} />
                <div>
                  <div style={{ color: '#A8B3CF', fontSize: '0.75rem' }}>Username</div>
                  <strong style={{ color: '#fff' }}>{ticket.customer?.username || `Customer #${ticket.customer_id}`}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} style={{ color: '#3BB7FF' }} />
                <div>
                  <div style={{ color: '#A8B3CF', fontSize: '0.75rem' }}>Email Address</div>
                  <strong style={{ color: '#fff' }}>{ticket.customer?.email || 'N/A'}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={18} style={{ color: '#00E676' }} />
                <div>
                  <div style={{ color: '#A8B3CF', fontSize: '0.75rem' }}>Customer ID</div>
                  <strong style={{ color: '#fff' }}>#{ticket.customer_id}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Conversation / Chat History */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: '#3BB7FF' }} /> Customer Conversation History
            </h3>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, idx) => {
                  const isCustomer = msg.sender_username === ticket.customer?.username || msg.sender_id === ticket.customer_id;
                  const isAi = msg.sender_username === 'AI_Assistant' || msg.sender === 'ai';

                  return (
                    <div key={msg.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '0.72rem', color: '#A8B3CF', marginBottom: '2px', padding: '0 4px' }}>
                        {isCustomer ? `Customer (${msg.sender_username || 'User'})` : isAi ? 'AI Support Assistant' : `Engineer (${msg.sender_username || 'Staff'})`}
                      </div>
                      <div 
                        style={
                          isCustomer ? {
                            background: 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
                            color: '#fff', padding: '10px 14px', borderRadius: '14px 14px 2px 14px', fontSize: '0.85rem', maxWidth: '85%'
                          } : isAi ? {
                            background: 'rgba(18,25,47,0.9)', border: '1px solid rgba(59,183,255,0.3)',
                            color: '#fff', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', fontSize: '0.85rem', maxWidth: '85%'
                          } : {
                            background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)',
                            color: '#00E676', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', fontSize: '0.85rem', maxWidth: '85%'
                          }
                        }
                      >
                        {msg.text || msg.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: '#A8B3CF', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                  No previous conversation history for this ticket.
                </div>
              )}
            </div>
          </div>

          {/* Customer Feedback */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} style={{ color: '#FFC107' }} /> Customer Rating & Feedback
            </h3>
            {feedback ? (
              <div style={{ background: 'rgba(7,11,24,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,193,7,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#FFC107', fontWeight: 700, fontSize: '1.1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < feedback.rating ? '#FFC107' : 'none'} color="#FFC107" />
                  ))}
                  <span style={{ marginLeft: '6px', color: '#fff', fontSize: '0.9rem' }}>{feedback.rating} / 5</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#FFFFFF' }}>"{feedback.comment || 'No comment provided.'}"</p>
              </div>
            ) : (
              <div style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>No feedback submitted yet.</div>
            )}
          </div>

        </div>

        {/* Right Column: MAIN ADMIN CONTROLS (Assign Engineer & Management) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          
          {/* MAIN FEATURE: ASSIGN ENGINEER CARD */}
          <div 
            style={{ 
              ...cardStyle, 
              border: isUnassigned ? '1px solid rgba(255,82,82,0.4)' : '1px solid rgba(59,183,255,0.3)',
              background: isUnassigned ? 'rgba(255,82,82,0.05)' : cardStyle.background 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              <UserPlus size={20} style={{ color: isUnassigned ? '#FF5252' : '#3BB7FF' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Assign Engineer</h3>
            </div>

            {/* Current Assignment Status */}
            <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(7,11,24,0.7)', border: '1px solid rgba(120,160,255,0.15)', fontSize: '0.85rem' }}>
              <div style={{ color: '#A8B3CF', fontSize: '0.75rem', marginBottom: '2px' }}>Assigned Engineer:</div>
              {isUnassigned ? (
                <div style={{ color: '#FF5252', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> Unassigned (Action Required)
                </div>
              ) : (
                <div style={{ color: '#00E676', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} /> {assignedEngineer?.username || `Engineer #${ticket.engineer_id}`}
                </div>
              )}
            </div>

            {/* Assignment Success / Error Notification */}
            {assignNotice && (
              <div 
                style={{ 
                  marginBottom: '16px', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                  background: assignNotice.type === 'error' ? 'rgba(255,82,82,0.12)' : 'rgba(0,230,118,0.12)',
                  border: `1px solid ${assignNotice.type === 'error' ? 'rgba(255,82,82,0.3)' : 'rgba(0,230,118,0.3)'}`,
                  color: assignNotice.type === 'error' ? '#FF5252' : '#00E676'
                }}
              >
                {assignNotice.text}
              </div>
            )}

            {/* Engineer Assignment Form */}
            <form onSubmit={handleAssignEngineer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem', fontWeight: 500 }}>
                  Select Engineer *
                </label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="" disabled style={{ background: '#0D1224', color: '#A8B3CF' }}>Select Engineer</option>
                  {engineers.map(e => (
                    <option key={e.id} value={e.id} style={{ background: '#0D1224', color: '#FFFFFF' }}>
                      {e.username} ({e.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedEngineerId || assigning}
                className="btn-primary"
                style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (!selectedEngineerId || assigning) ? 0.5 : 1 }}
              >
                <UserPlus size={16} />
                {assigning ? 'Assigning Ticket...' : 'Assign Ticket'}
              </button>
            </form>
          </div>

          {/* Quick Management Controls */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Ticket Controls</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Status Select */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>Update Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Open" style={{ background: '#0D1224' }}>Open</option>
                  <option value="In Progress" style={{ background: '#0D1224' }}>In Progress</option>
                  <option value="Resolved" style={{ background: '#0D1224' }}>Resolved</option>
                  <option value="Closed" style={{ background: '#0D1224' }}>Closed</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#A8B3CF', fontSize: '0.8rem' }}>Update Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Low" style={{ background: '#0D1224' }}>Low</option>
                  <option value="Medium" style={{ background: '#0D1224' }}>Medium</option>
                  <option value="High" style={{ background: '#0D1224' }}>High</option>
                </select>
              </div>

              {/* Close & Delete Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  onClick={handleCloseTicket}
                  disabled={ticket.status === 'Closed'}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: ticket.status === 'Closed' ? 0.4 : 1 }}
                >
                  <XCircle size={14} /> Close Ticket
                </button>
                
                <button
                  onClick={handleDeleteTicket}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '8px', fontSize: '0.78rem', color: '#FF5252', borderColor: 'rgba(255,82,82,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminTicketDetails;
