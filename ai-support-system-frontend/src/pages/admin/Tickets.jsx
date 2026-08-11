import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Eye, Filter, UserCheck, UserPlus, ClipboardList } from 'lucide-react';
import httpClient from '../../services/httpClient';
import { SIM_CATEGORIES } from '../customer/RaiseTicket';

const AdminTickets = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialAssignment = searchParams.get('assignment') || '';
  const initialEngineerId = searchParams.get('engineer_id') || '';

  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignment: initialAssignment,
    engineer_id: initialEngineerId,
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([
        httpClient.get('/tickets?limit=500'),
        httpClient.get('/users')
      ]);

      const tList = tRes.data?.tickets || tRes.data || [];
      const uList = uRes.data || uRes || [];

      setTickets(Array.isArray(tList) ? tList : []);
      setEngineers(uList.filter(u => u.role === 'engineer'));
    } catch (error) {
      console.error('Error fetching admin tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters locally for instant responsiveness
  useEffect(() => {
    let result = [...tickets];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(t => 
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.customer?.username?.toLowerCase().includes(q) ||
        `#${t.id}`.includes(q)
      );
    }

    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.category) {
      result = result.filter(t => t.category === filters.category);
    }

    if (filters.assignment === 'unassigned') {
      result = result.filter(t => !t.engineer_id);
    } else if (filters.assignment === 'assigned') {
      result = result.filter(t => !!t.engineer_id);
    }

    if (filters.engineer_id) {
      result = result.filter(t => String(t.engineer_id) === String(filters.engineer_id));
    }

    setFilteredTickets(result);
    setPage(1);
  }, [filters, tickets]);

  const getBadgeStyle = (val) => {
    const styles = {
      Open: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
      'In Progress': { bg: 'rgba(59,183,255,0.12)', color: '#3BB7FF', border: 'rgba(59,183,255,0.25)' },
      Resolved: { bg: 'rgba(0,230,118,0.12)', color: '#00E676', border: 'rgba(0,230,118,0.25)' },
      Closed: { bg: 'rgba(168,179,207,0.12)', color: '#A8B3CF', border: 'rgba(168,179,207,0.2)' }
    };
    return styles[val] || styles.Open;
  };

  const inputStyle = {
    background: 'rgba(7,11,24,0.8)',
    border: '1px solid rgba(120,160,255,0.2)',
    borderRadius: '10px',
    color: '#FFFFFF',
    padding: '9px 12px',
    fontSize: '0.82rem',
    outline: 'none',
    transition: 'all 0.3s'
  };

  const paginated = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    borderRadius: '16px',
  };

  return (
    <div style={{ padding: '24px', color: '#FFFFFF', maxWidth: '1500px', margin: '0 auto' }}>
      
      {/* Title & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'Space Grotesk, sans-serif' }}>Customer SIM Tickets Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#A8B3CF' }}>
            Filter, inspect, and assign support engineers to customer SIM issues
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ ...cardStyle, padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search title, description, customer..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{ ...inputStyle, paddingLeft: '36px', width: '100%' }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={inputStyle}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            style={inputStyle}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* SIM Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{ ...inputStyle, maxWidth: '170px' }}
          >
            <option value="">All SIM Categories</option>
            {SIM_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Assignment Filter */}
          <select
            value={filters.assignment}
            onChange={(e) => setFilters(prev => ({ ...prev, assignment: e.target.value }))}
            style={inputStyle}
          >
            <option value="">All Assignments</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="assigned">Assigned Only</option>
          </select>

          {/* Specific Engineer Filter */}
          <select
            value={filters.engineer_id}
            onChange={(e) => setFilters(prev => ({ ...prev, engineer_id: e.target.value }))}
            style={inputStyle}
          >
            <option value="">All Engineers</option>
            {engineers.map(e => (
              <option key={e.id} value={e.id}>{e.username}</option>
            ))}
          </select>

          {/* Clear Filters button */}
          {(filters.search || filters.status || filters.priority || filters.category || filters.assignment || filters.engineer_id) && (
            <button
              onClick={() => setFilters({ search: '', status: '', priority: '', category: '', assignment: '', engineer_id: '' })}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '8px 12px' }}
            >
              Reset Filters
            </button>
          )}

        </div>
      </div>

      {/* Tickets Table */}
      <div style={{ ...cardStyle, padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#A8B3CF' }}>
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
            Loading tickets...
          </div>
        ) : filteredTickets.length > 0 ? (
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
              {paginated.map(t => {
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
                      <button 
                        onClick={() => navigate(`/admin/tickets/${t.id}`)} 
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
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8B3CF' }}>
            <ClipboardList size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ margin: 0, color: '#fff' }}>No tickets found matching filters</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try resetting your search query or filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ fontSize: '0.85rem', color: '#A8B3CF' }}>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminTickets;
