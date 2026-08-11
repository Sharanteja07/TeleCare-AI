const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = {
  'pages/admin/Dashboard.jsx': `import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { StatsCard } from '../../components/StatsCard';
import { Users, Ticket, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, engineers: 0, open: 0, closed: 0, total: 0 });

  useEffect(() => {
    // Mock loading since stats API might not be fully implemented yet
    setStats({ customers: 150, engineers: 12, open: 45, closed: 320, total: 400 });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard title="Customers" value={stats.customers} icon={Users} />
        <StatsCard title="Engineers" value={stats.engineers} icon={Users} />
        <StatsCard title="Open Tickets" value={stats.open} icon={Ticket} />
        <StatsCard title="Closed Tickets" value={stats.closed} icon={CheckCircle} />
        <StatsCard title="Total Tickets" value={stats.total} icon={Ticket} />
      </div>
      <div className="glass-card p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-text-secondary">Charts Section (Recharts integration placeholder)</p>
      </div>
    </div>
  );
};
export default AdminDashboard;
`,
  'pages/admin/Customers.jsx': `import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    ticketService.getAllUsers().then(res => {
      const allUsers = Array.isArray(res) ? res : [];
      setCustomers(allUsers.filter(u => u.role === 'customer'));
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
      <div className="glass-card p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-secondary border-b border-border-dim">
              <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-border-dim">
                <td className="py-3 text-text-primary">{c.full_name}</td>
                <td className="py-3 text-text-secondary">{c.email}</td>
                <td className="py-3 text-text-secondary">{new Date(c.created_at || Date.now()).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Customers;
`,
  'pages/admin/Engineers.jsx': `import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';

const Engineers = () => {
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
    ticketService.getAllUsers().then(res => {
      const allUsers = Array.isArray(res) ? res : [];
      setEngineers(allUsers.filter(u => u.role === 'engineer'));
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Engineers</h1>
      <div className="glass-card p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-secondary border-b border-border-dim">
              <th className="pb-3">Name</th><th className="pb-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {engineers.map(e => (
              <tr key={e.id} className="border-b border-border-dim">
                <td className="py-3 text-text-primary">{e.full_name}</td>
                <td className="py-3 text-text-secondary">{e.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Engineers;
`,
  'pages/admin/Tickets.jsx': `import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { Link } from 'react-router-dom';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketService.getAllTickets().then(res => {
      setTickets(Array.isArray(res.tickets || res) ? (res.tickets || res) : []);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">All Tickets</h1>
      <div className="glass-card p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-secondary border-b border-border-dim">
              <th className="pb-3">ID</th><th className="pb-3">Title</th><th className="pb-3">Status</th><th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-b border-border-dim">
                <td className="py-3 text-text-primary">TCK-{t.id}</td>
                <td className="py-3 text-text-secondary">{t.title}</td>
                <td className="py-3 text-text-secondary">{t.status}</td>
                <td className="py-3"><Link to={\`/admin/tickets/\${t.id}\`} className="text-color-primary">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Tickets;
`,
  'pages/admin/TicketDetails.jsx': `import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    ticketService.getTicketById(id).then(res => setTicket(res)).catch(console.error);
  }, [id]);

  if (!ticket) return <div className="text-text-primary">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary glass-card p-6">Admin View: TCK-{ticket.id} - {ticket.title}</h2>
    </div>
  );
};
export default TicketDetails;
`,
  'pages/admin/Analytics.jsx': `import React from 'react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
      <div className="glass-card p-6 h-64 flex items-center justify-center">
        <p className="text-text-secondary">Analytics Dashboard coming soon...</p>
      </div>
    </div>
  );
};
export default Analytics;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
