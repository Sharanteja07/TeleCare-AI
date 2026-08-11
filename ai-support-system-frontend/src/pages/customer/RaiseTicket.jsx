import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, X, Ticket, AlertCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

export const SIM_CATEGORIES = [
  "SIM Activation",
  "SIM Not Working",
  "SIM Lost",
  "SIM Damaged",
  "SIM Replacement",
  "eSIM Activation",
  "eSIM Not Working",
  "SIM Blocked",
  "SIM PIN / PUK Issue",
  "SIM Registration",
  "SIM Portability",
  "SIM Upgrade",
  "SIM Deactivation",
  "SIM Ownership Transfer",
  "SIM Related Billing",
  "Other SIM Issue"
];

const RaiseTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCategory = searchParams.get('category') || '';

  const [formData, setFormData] = useState({ 
    title: '', 
    category: prefilledCategory || '', 
    priority: 'High', 
    description: '' 
  });
  
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (prefilledCategory && SIM_CATEGORIES.includes(prefilledCategory)) {
      setFormData(prev => ({ ...prev, category: prefilledCategory }));
    }
  }, [prefilledCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setErrorMsg('Please select a SIM issue category.');
      return;
    }
    if (formData.description.length < 20 || submitting) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await httpClient.post('/tickets', formData);
      const ticketId = res.data?.id || res.id;

      if (file && ticketId) {
        const fileData = new FormData();
        fileData.append('file', file);
        await httpClient.post(`/tickets/${ticketId}/attachments`, fileData);
      }

      navigate('/dashboard/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrorMsg(error.response?.data?.detail || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)',
    borderRadius: '10px', color: '#fff', padding: '12px 14px', outline: 'none', transition: 'all 0.3s'
  };
  const focusStyle = (e) => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; };
  const blurStyle = (e) => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', fontFamily: 'Space Grotesk, sans-serif' }}>Create SIM Support Ticket</h1>
        <p style={{ color: '#A8B3CF' }}>Describe your SIM issue and our support team will resolve it quickly</p>
      </div>

      <div style={{
        width: '100%', maxWidth: '800px', padding: '36px',
        background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px'
      }}>
        {errorMsg && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,82,82,0.12)', border: '1px solid rgba(255,82,82,0.25)', color: '#FF5252', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A8B3CF', fontSize: '0.85rem', fontWeight: 500 }}>Ticket Title *</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              style={inputStyle} 
              onFocus={focusStyle} 
              onBlur={blurStyle} 
              placeholder="e.g. SIM card is not working / Lost SIM card" 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A8B3CF', fontSize: '0.85rem', fontWeight: 500 }}>SIM Issue Category *</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
              required
              style={{...inputStyle, appearance: 'none', color: formData.category ? '#fff' : '#A8B3CF'}} 
              onFocus={focusStyle} 
              onBlur={blurStyle}
            >
              <option value="" disabled style={{ background: '#0D1224', color: '#A8B3CF' }}>Select a SIM issue</option>
              {SIM_CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0D1224', color: '#fff' }}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: '#A8B3CF', fontSize: '0.85rem', fontWeight: 500 }}>Priority *</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              {[
                { name: 'Low', color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
                { name: 'Medium', color: '#FFC107', bg: 'rgba(255,193,7,0.12)' },
                { name: 'High', color: '#FF5252', bg: 'rgba(255,82,82,0.12)' }
              ].map(p => (
                <div key={p.name} onClick={() => setFormData({...formData, priority: p.name})} style={{
                  flex: 1, padding: '12px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 600, fontSize: '0.9rem',
                  background: formData.priority === p.name ? p.bg : 'rgba(7,11,24,0.8)',
                  border: `1px solid ${formData.priority === p.name ? p.color : 'rgba(255,255,255,0.08)'}`,
                  color: formData.priority === p.name ? p.color : '#fff',
                  boxShadow: formData.priority === p.name ? `0 0 15px ${p.bg}` : 'none'
                }}>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A8B3CF', fontSize: '0.85rem', fontWeight: 500 }}>Description *</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              required 
              rows={5} 
              style={{...inputStyle, resize: 'vertical'}} 
              onFocus={focusStyle} 
              onBlur={blurStyle} 
              placeholder="Describe your SIM issue in detail (e.g. My SIM card suddenly stopped working and my phone shows No SIM detected)..." 
            />
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: formData.description.length < 20 ? '#FF5252' : '#A8B3CF', marginTop: '4px' }}>
              {formData.description.length} / min 20 chars
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A8B3CF', fontSize: '0.85rem', fontWeight: 500 }}>Attachments (PNG, JPG, PDF)</label>
            <div style={{
              border: '2px dashed rgba(120,160,255,0.3)', borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer',
              background: 'rgba(7,11,24,0.5)', transition: 'all 0.3s'
            }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3BB7FF'; e.currentTarget.style.background = 'rgba(59,183,255,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(120,160,255,0.3)'; e.currentTarget.style.background = 'rgba(7,11,24,0.5)'; }}>
              <input type="file" id="fileUpload" accept="image/png,image/jpeg,image/jpg,application/pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
              <label htmlFor="fileUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Upload size={26} color="#3BB7FF" />
                <span style={{ color: '#A8B3CF', fontSize: '0.85rem' }}>Click to browse or drag and drop document/image</span>
              </label>
              {file && (
                <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,183,255,0.12)', border: '1px solid rgba(59,183,255,0.3)', padding: '6px 14px', borderRadius: '20px' }}>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{file.name}</span>
                  <X size={14} color="#FF5252" style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setFile(null); }} />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={!formData.category || formData.description.length < 20 || submitting} className="btn-primary" style={{
            padding: '14px', fontSize: '1rem', marginTop: '10px',
            opacity: (!formData.category || formData.description.length < 20 || submitting) ? 0.5 : 1
          }}>
            {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;
