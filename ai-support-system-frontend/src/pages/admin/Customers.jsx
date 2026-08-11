import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, Users } from 'lucide-react';
import httpClient from '../../services/httpClient';

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await httpClient.get('/api/users');
        const custs = (res.users || []).filter(u => u.role === 'customer');
        setCustomers(custs);
        setFiltered(custs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (search) {
      setFiltered(customers.filter(c => c.username.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())));
    } else {
      setFiltered(customers);
    }
    setPage(1);
  }, [search, customers]);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const cardStyle = {
    background: 'rgba(18,25,47,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(59,183,255,0.12), 0 8px 32px rgba(0,0,0,0.4)', borderRadius: '16px'
  };

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#070B18', color: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Customer Directory</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#A8B3CF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{
            background: 'rgba(7,11,24,0.8)', border: '1px solid rgba(120,160,255,0.2)', borderRadius: '10px',
            color: '#fff', padding: '10px 14px 10px 40px', outline: 'none', transition: 'all 0.3s', minWidth: '250px'
          }} onFocus={e => { e.target.style.borderColor = '#3BB7FF'; e.target.style.boxShadow = '0 0 0 3px rgba(59,183,255,0.15)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(120,160,255,0.2)'; e.target.style.boxShadow = 'none'; }} />
        </div>
      </div>

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A8B3CF' }}>Loading customers...</div>
        ) : filtered.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Name</th>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Username</th>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Email</th>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Joined Date</th>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Customer ID</th>
                <th style={{ padding: '15px 20px', color: '#A8B3CF' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '15px 20px' }}>{c.full_name || 'N/A'}</td>
                  <td style={{ padding: '15px 20px', color: '#3BB7FF' }}>@{c.username}</td>
                  <td style={{ padding: '15px 20px' }}>{c.email}</td>
                  <td style={{ padding: '15px 20px', color: '#A8B3CF' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px 20px', color: '#A8B3CF' }}>CUST-{c.id}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <button onClick={() => navigate(`/admin/tickets?search=${c.username}`)} style={{ background: 'rgba(59,183,255,0.1)', border: '1px solid rgba(59,183,255,0.2)', padding: '6px 12px', borderRadius: '8px', color: '#3BB7FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                      Tickets <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#A8B3CF' }}>
            <Users size={50} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
            <h3>No customers found</h3>
            <p>Try a different search term.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button disabled={page === 1} onClick={() => setPage(page-1)} style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '5px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ padding: '8px 15px', color: '#A8B3CF' }}>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '5px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminCustomers;
