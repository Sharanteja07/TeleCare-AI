import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ClipboardList } from 'lucide-react';
import httpClient from '../../services/httpClient';

const TicketHistory = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await httpClient.get('/tickets');
        const list = res.data?.tickets || res.data || [];
        setTickets(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = tickets;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(q) || `TCK-${t.id}`.toLowerCase().includes(q));
    }
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.priority) result = result.filter(t => t.priority === filters.priority);
    if (filters.category) result = result.filter(t => t.category === filters.category);
    setFilteredTickets(result);
    setPage(1);
  }, [filters, tickets]);

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

  const inputStyle = {
    background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)', borderRadius: '10px',
    color: '#fff', padding: '10px 14px', outline: 'none', transition: 'all 0.3s', fontSize: '0.85rem'
  };

  const paginated = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Space Grotesk, sans-serif' }}>My Support Tickets</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>View history and check status of all submitted issues</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search ticket title or ID..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} style={{...inputStyle, paddingLeft: '36px', width: '220px'}} />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} style={{...inputStyle, width: '130px'}}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})} style={{...inputStyle, width: '130px'}}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button 
            onClick={() => navigate('/dashboard/tickets/create')}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '10px 18px' }}
          >
            + Create Ticket
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px', overflowX: 'auto'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8B3CF' }}>
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
            Loading tickets...
          </div>
        ) : filteredTickets.length > 0 ? (
          <table className="table-glass">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(t => {
                const sStyle = getBadgeStyle(t.status);
                const pStyle = getBadgeStyle(t.priority);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: '#3BB7FF' }}>TCK-{t.id}</td>
                    <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{t.title}</td>
                    <td style={{ color: '#A8B3CF' }}>{t.category || 'General'}</td>
                    <td><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>{t.priority || 'Medium'}</span></td>
                    <td><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}` }}>{t.status}</span></td>
                    <td style={{ color: '#A8B3CF' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => navigate(`/dashboard/tickets/${t.id}`)} className="btn-ghost" style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#A8B3CF' }}>
            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ margin: 0, color: '#fff' }}>No tickets found</h3>
            <p style={{ marginTop: '6px' }}>Try adjusting your filters or search query.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ fontSize: '0.85rem', color: '#A8B3CF' }}>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default TicketHistory;
