const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = {
  'pages/engineer/Dashboard.jsx': `import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { StatsCard } from '../../components/StatsCard';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle, Clock } from 'lucide-react';

const EngineerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, open: 0, resolvedToday: 0 });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketService.getAllTickets({ engineer_id: user.id }).then(res => {
      const all = res.tickets || res || [];
      setTickets(Array.isArray(all) ? all.slice(0, 5) : []);
      setStats({
        assigned: all.length,
        open: all.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length,
        resolvedToday: all.filter(t => t.status === 'Resolved').length // simplified
      });
    }).catch(console.error);
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="p-6 glass-card">
        <h1 className="text-2xl font-bold text-text-primary">My Dashboard - Welcome, {user?.full_name}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Assigned Tickets" value={stats.assigned} icon={Ticket} />
        <StatsCard title="Open Tickets" value={stats.open} icon={Ticket} />
        <StatsCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} />
        <StatsCard title="Avg Resolution Time" value="N/A" icon={Clock} />
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">My Assigned Tickets</h3>
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
                <td className="py-3"><Link to={\`/engineer/tickets/\${t.id}\`} className="text-color-primary">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EngineerDashboard;
`,
  'pages/engineer/AssignedTickets.jsx': `import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const AssignedTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketService.getAllTickets({ engineer_id: user.id }).then(res => {
      setTickets(Array.isArray(res.tickets || res) ? (res.tickets || res) : []);
    }).catch(console.error);
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">My Tickets</h1>
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
                <td className="py-3"><Link to={\`/engineer/tickets/\${t.id}\`} className="text-color-primary">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AssignedTickets;
`,
  'pages/engineer/TicketDetails.jsx': `import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { ChatWindow } from '../../components/ChatWindow';
import { useAuth } from '../../context/AuthContext';

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    ticketService.getTicketById(id).then(res => setTicket(res)).catch(console.error);
  }, [id]);

  if (!ticket) return <div className="text-text-primary">Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">TCK-{ticket.id}: {ticket.title}</h2>
          <p className="text-text-secondary mb-4">{ticket.description}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-color-primary text-white rounded hover:bg-opacity-90">Accept</button>
            <button className="px-4 py-2 bg-color-success text-white rounded hover:bg-opacity-90">Resolve</button>
            <button className="px-4 py-2 bg-border-dim text-white rounded hover:bg-opacity-90">Close</button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <ChatWindow ticketId={id} />
      </div>
    </div>
  );
};
export default TicketDetails;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
