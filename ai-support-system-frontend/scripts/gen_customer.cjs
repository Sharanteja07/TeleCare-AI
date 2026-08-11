const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = {
  'components/SpeedTest.jsx': `import React, { useState } from 'react';

export const SpeedTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setResults({ download: 125.4, upload: 45.2, ping: 12 });
      setTesting(false);
    }, 2000);
  };

  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Network Speed Test</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-bg-app p-4 rounded-lg border border-border-dim text-center">
          <p className="text-sm text-text-secondary">Download</p>
          <p className="text-xl font-bold text-color-primary">{results ? results.download : '--'} <span className="text-xs">Mbps</span></p>
        </div>
        <div className="bg-bg-app p-4 rounded-lg border border-border-dim text-center">
          <p className="text-sm text-text-secondary">Upload</p>
          <p className="text-xl font-bold text-color-success">{results ? results.upload : '--'} <span className="text-xs">Mbps</span></p>
        </div>
        <div className="bg-bg-app p-4 rounded-lg border border-border-dim text-center">
          <p className="text-sm text-text-secondary">Ping</p>
          <p className="text-xl font-bold text-color-warning">{results ? results.ping : '--'} <span className="text-xs">ms</span></p>
        </div>
      </div>
      <button 
        onClick={runTest}
        disabled={testing}
        className="w-full py-2 bg-color-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Start Test'}
      </button>
    </div>
  );
};
`,
  'components/ChatWindow.jsx': `import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export const ChatWindow = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMsg = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: 'me' }]);
    setInput('');
  };

  return (
    <div className="glass-card flex flex-col h-[500px]">
      <div className="p-4 border-b border-border-dim">
        <h3 className="font-bold text-text-primary">Live Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={\`flex \${m.sender === 'me' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`p-3 rounded-lg max-w-[80%] \${m.sender === 'me' ? 'bg-color-primary text-white' : 'bg-bg-app text-text-primary border border-border-dim'}\`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMsg} className="p-4 border-t border-border-dim flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-bg-app border border-border-dim text-text-primary rounded-lg px-4 py-2 outline-none"
          placeholder="Type a message..."
        />
        <button type="submit" className="p-2 bg-color-primary text-white rounded-lg"><Send size={20}/></button>
      </form>
    </div>
  );
};
`,
  'pages/customer/Dashboard.jsx': `import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { StatsCard } from '../../components/StatsCard';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { SpeedTest } from '../../components/SpeedTest';
import { Ticket, CheckCircle, Activity, PlusCircle, MessageSquare, User } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active: 0, open: 0, resolved: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await ticketService.getAllTickets({ limit: 5, page: 1, customer_id: user.id });
        const tickets = res.tickets || res || [];
        setRecentTickets(Array.isArray(tickets) ? tickets : []);
        setStats({
          active: tickets.filter(t => t.status !== 'Closed').length,
          open: tickets.filter(t => t.status === 'Open').length,
          resolved: tickets.filter(t => t.status === 'Resolved').length
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-color-primary bg-opacity-10 rounded-xl border border-color-primary border-opacity-20">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, {user?.full_name}</h1>
        <p className="text-text-secondary">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Active Tickets" value={stats.active} icon={Activity} />
        <StatsCard title="Open Tickets" value={stats.open} icon={Ticket} />
        <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle} />
        <StatsCard title="AI Status" value="Online" icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Recent Tickets</h3>
            {loading ? <SkeletonLoader type="table" /> : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-text-secondary text-sm border-b border-border-dim">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(t => (
                    <tr key={t.id} className="border-b border-border-dim border-opacity-50">
                      <td className="py-3 text-text-primary">TCK-{t.id}</td>
                      <td className="py-3 text-text-secondary truncate max-w-[150px]">{t.title}</td>
                      <td className="py-3"><span className="px-2 py-1 bg-bg-app rounded text-xs">{t.status}</span></td>
                      <td className="py-3">
                        <Link to={\`/customer/tickets/\${t.id}\`} className="text-color-primary text-sm hover:underline">View</Link>
                      </td>
                    </tr>
                  ))}
                  {recentTickets.length === 0 && (
                    <tr><td colSpan="4" className="py-4 text-center text-text-secondary">No recent tickets</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <SpeedTest />
        </div>

        <div className="space-y-4">
          <Link to="/customer/tickets/new" className="glass-card p-4 flex items-center gap-4 hover:bg-bg-app transition-colors">
            <div className="p-3 bg-color-primary bg-opacity-20 text-color-primary rounded-lg"><PlusCircle /></div>
            <div><h4 className="font-bold text-text-primary">Create Ticket</h4><p className="text-sm text-text-secondary">Report a new issue</p></div>
          </Link>
          <Link to="/customer/assistant" className="glass-card p-4 flex items-center gap-4 hover:bg-bg-app transition-colors">
            <div className="p-3 bg-color-success bg-opacity-20 text-color-success rounded-lg"><MessageSquare /></div>
            <div><h4 className="font-bold text-text-primary">AI Assistant</h4><p className="text-sm text-text-secondary">Get instant help</p></div>
          </Link>
          <Link to="/customer/profile" className="glass-card p-4 flex items-center gap-4 hover:bg-bg-app transition-colors">
            <div className="p-3 bg-color-warning bg-opacity-20 text-color-warning rounded-lg"><User /></div>
            <div><h4 className="font-bold text-text-primary">Profile</h4><p className="text-sm text-text-secondary">Manage your account</p></div>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CustomerDashboard;
`,
  'pages/customer/RaiseTicket.jsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';

const RaiseTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', category: 'Broadband', priority: 'Medium', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ticketService.createTicket(formData);
      navigate('/customer/tickets');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Raise a Ticket</h1>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-text-secondary mb-1">Title</label>
          <input required type="text" className="w-full bg-bg-app border border-border-dim rounded p-2 text-text-primary outline-none focus:border-color-primary"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary mb-1">Category</label>
            <select className="w-full bg-bg-app border border-border-dim rounded p-2 text-text-primary outline-none"
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {['Broadband', 'Fiber', 'WiFi', 'Router', '5G', '4G', 'Mobile Network', 'Billing', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-text-secondary mb-1">Priority</label>
            <select className="w-full bg-bg-app border border-border-dim rounded p-2 text-text-primary outline-none"
              value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-text-secondary mb-1">Description</label>
          <textarea required rows="5" className="w-full bg-bg-app border border-border-dim rounded p-2 text-text-primary outline-none focus:border-color-primary"
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        </div>
        <button disabled={loading} type="submit" className="px-6 py-2 bg-color-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};
export default RaiseTicket;
`,
  'pages/customer/TicketHistory.jsx': `import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { SkeletonLoader } from '../../components/SkeletonLoader';

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getAllTickets().then(res => {
      setTickets(Array.isArray(res.tickets || res) ? (res.tickets || res) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Ticket History</h1>
      <div className="glass-card p-6">
        {loading ? <SkeletonLoader type="table" /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-secondary border-b border-border-dim">
                <th className="pb-3">ID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-border-dim">
                  <td className="py-3 text-text-primary">TCK-{t.id}</td>
                  <td className="py-3 text-text-secondary">{t.title}</td>
                  <td className="py-3 text-text-secondary">{t.category}</td>
                  <td className="py-3 text-text-secondary">{t.status}</td>
                  <td className="py-3">
                    <Link to={\`/customer/tickets/\${t.id}\`} className="text-color-primary">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default TicketHistory;
`,
  'pages/customer/TicketDetails.jsx': `import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { ChatWindow } from '../../components/ChatWindow';

const TicketDetails = () => {
  const { id } = useParams();
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
          <p className="text-text-secondary">{ticket.description}</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-text-primary mb-4">Details</h3>
          <p className="text-text-secondary text-sm">Status: <span className="text-text-primary">{ticket.status}</span></p>
          <p className="text-text-secondary text-sm mt-2">Priority: <span className="text-text-primary">{ticket.priority}</span></p>
        </div>
        <ChatWindow ticketId={id} />
      </div>
    </div>
  );
};
export default TicketDetails;
`,
  'pages/customer/AIAssistant.jsx': `import React, { useState } from 'react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Support Assistant. I can help with internet issues, billing, SIM problems, and much more. What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'me', text: userMsg }]);
    setInput('');
    
    setTimeout(() => {
      let reply = "I'm sorry, I couldn't understand that. Please create a ticket for further assistance.";
      if (userMsg.toLowerCase().includes('slow')) reply = "For slow internet: check router placement, restart router, or check for background downloads.";
      else if (userMsg.toLowerCase().includes('bill')) reply = "You can view your bill in the billing portal.";
      
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col glass-card">
      <div className="p-4 border-b border-border-dim"><h2 className="font-bold text-text-primary">AI Assistant</h2></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={\`flex \${m.sender === 'me' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`p-4 rounded-lg max-w-[80%] \${m.sender === 'me' ? 'bg-color-primary text-white' : 'bg-bg-app text-text-primary border border-border-dim'}\`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-border-dim flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          className="flex-1 bg-bg-app border border-border-dim rounded-lg px-4 py-2 text-text-primary outline-none" placeholder="Type..." />
        <button type="submit" className="px-6 py-2 bg-color-primary text-white rounded-lg">Send</button>
      </form>
    </div>
  );
};
export default AIAssistant;
`,
  'pages/customer/Profile.jsx': `import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto glass-card p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="text-text-secondary text-sm">Name</label>
          <div className="text-text-primary text-lg">{user?.full_name}</div>
        </div>
        <div>
          <label className="text-text-secondary text-sm">Email</label>
          <div className="text-text-primary text-lg">{user?.email}</div>
        </div>
        <div>
          <label className="text-text-secondary text-sm">Role</label>
          <div className="text-text-primary text-lg capitalize">{user?.role}</div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
