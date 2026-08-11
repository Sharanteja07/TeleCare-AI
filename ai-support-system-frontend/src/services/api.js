import { httpClient } from './httpClient';

const STORAGE_KEY = 'aether_tickets';

const SEED_TICKETS = [
  {
    id: 'TCK-1082',
    customerEmail: 'customer@aether.com',
    customerName: 'Alex Rivera',
    title: 'Fiber connection dropouts daily at 8PM',
    category: 'Broadband Optical',
    severity: 'high',
    status: 'in-progress',
    assignedTo: 'Dr. Sarah Chen',
    createdAt: '2026-07-20T10:30:00Z',
    description: 'Every day at approximately 8 PM, my fiber gateway loses synchronization. The broadband light blinks red for 15-20 minutes before restoring. This disrupts my work-from-home schedule.',
    messages: [
      { sender: 'customer', text: 'Here is my description of the issue. Looking forward to support.', timestamp: '2 days ago' },
      { sender: 'bot', text: 'Hello! I am the Aether AI assistant. I detected a high optical line attenuation between 7:55 PM and 8:15 PM on your line and opened a high-priority ticket for Fiber Diagnostics.', timestamp: '2 days ago' },
      { sender: 'agent', text: 'Hello Alex, I am Dr. Sarah Chen from network diagnostics. I scheduled a port reset at the hub. Please let me know if it drops out tonight.', timestamp: '1 day ago' }
    ],
    diagnostics: {
      ping: '14 ms',
      downSpeed: '942 Mbps',
      upSpeed: '880 Mbps',
      jitter: '1.2 ms',
      signalLoss: 'Moderate (evening peaks)'
    }
  },
  {
    id: 'TCK-1085',
    customerEmail: 'customer@aether.com',
    customerName: 'Alex Rivera',
    title: 'Billing dispute on 5G unlimited add-on',
    category: 'Billing & Subscriptions',
    severity: 'normal',
    status: 'open',
    assignedTo: null,
    createdAt: '2026-07-22T08:15:00Z',
    description: 'I was double charged for the 5G Unlimited Roaming addon on my June statement. I requested cancellation on June 5th, but the charge is still present.',
    messages: [
      { sender: 'customer', text: 'Please review the double charge and refund the extra $15.', timestamp: '6 hours ago' },
      { sender: 'bot', text: 'Understood. I have scanned your billing logs. Your cancellation request for 5G Unlimited Roaming was logged on June 5th, but billing cycle finalized on June 6th. I registered the ticket for manual adjustment.', timestamp: '6 hours ago' }
    ]
  },
  {
    id: 'TCK-1021',
    customerEmail: 'customer@aether.com',
    customerName: 'Alex Rivera',
    title: 'Static IP allocation request',
    category: 'IP Routing',
    severity: 'normal',
    status: 'resolved',
    assignedTo: 'Dr. Sarah Chen',
    createdAt: '2026-07-15T09:00:00Z',
    description: 'I need a block of 1 static IP address assigned to my fiber account for hosting my secure home automation server.',
    messages: [
      { sender: 'customer', text: 'Can you assign a static IP address to my gateway?', timestamp: '7 days ago' },
      { sender: 'agent', text: 'Hi Alex, I have assigned the IP 103.88.241.109 to your gateway. Please reboot your router to apply the change.', timestamp: '6 days ago' },
      { sender: 'customer', text: 'Excellent! Working perfectly now.', timestamp: '6 days ago' }
    ],
    diagnostics: {
      ping: '9 ms',
      downSpeed: '951 Mbps',
      upSpeed: '948 Mbps',
      jitter: '0.8 ms',
      signalLoss: 'Zero'
    }
  }
];

const toTicketId = (ticketId) => {
  const numeric = parseInt(String(ticketId).replace(/^TCK-/i, ''), 10);
  return Number.isNaN(numeric) ? null : numeric;
};

const normalizeStatus = (status) => {
  if (!status) return 'open';
  const normalized = String(status).toLowerCase();
  if (normalized === 'resolved' || normalized === 'closed') return normalized;
  if (normalized.includes('in progress') || normalized === 'in-progress') return 'in-progress';
  return 'open';
};

const normalizeSeverity = (priority) => {
  if (!priority) return 'normal';
  const normalized = String(priority).toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'critical') return 'critical';
  return 'normal';
};

const formatBackendTicket = (ticket) => ({
  id: `TCK-${ticket.id}`,
  title: ticket.title,
  description: ticket.description,
  category: ticket.category,
  severity: normalizeSeverity(ticket.priority),
  status: normalizeStatus(ticket.status),
  assignedTo: ticket.engineer?.username || null,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
  diagnostics: ticket.diagnostics || null,
  customerEmail: ticket.customer?.email || '',
  customerName: ticket.customer?.username || '',
  messages: [],
  customer_id: ticket.customer_id,
  engineer_id: ticket.engineer_id,
});

const initDb = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TICKETS));
  }
};

initDb();

export const getTickets = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

export const saveTickets = (tickets) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

export const syncTickets = async () => {
  try {
    const response = await httpClient.get('/tickets');
    const backendTickets = response.data.map(formatBackendTicket);
    const localTickets = getTickets();
    const mergedTickets = backendTickets.map((backendTicket) => {
      const local = localTickets.find(t => t.id === backendTicket.id);
      return local ? { ...backendTicket, messages: local.messages || backendTicket.messages } : backendTicket;
    });
    saveTickets(mergedTickets);
    return mergedTickets;
  } catch (err) {
    return getTickets();
  }
};

export const createTicket = (ticketData) => {
  const tickets = getTickets();
  const newTicket = {
    id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerEmail: ticketData.customerEmail,
    customerName: ticketData.customerName,
    title: ticketData.title,
    category: ticketData.category,
    severity: ticketData.severity || 'normal',
    status: 'open',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: ticketData.description,
    messages: ticketData.messages || [{ sender: 'customer', text: ticketData.description, timestamp: 'Just now' }],
    diagnostics: ticketData.diagnostics || null,
  };

  tickets.push(newTicket);
  saveTickets(tickets);

  httpClient.post('/tickets', {
    title: ticketData.title,
    description: ticketData.description,
    category: ticketData.category,
    priority: ticketData.severity === 'high' ? 'High' : 'Medium',
  }).then((response) => {
    const backendTicket = formatBackendTicket(response.data);
    const updated = getTickets().map((ticket) => ticket.id === newTicket.id ? { ...backendTicket, messages: newTicket.messages } : ticket);
    saveTickets(updated);
  }).catch(() => {
    // keep local ticket if backend is unavailable
  });

  return newTicket;
};

export const getTicketById = (ticketId) => {
  const tickets = getTickets();
  return tickets.find(t => String(t.id).toLowerCase() === String(ticketId).toLowerCase()) || null;
};

export const updateTicket = (id, updatedFields) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => String(t.id).toLowerCase() === String(id).toLowerCase());
  if (index === -1) {
    throw new Error(`Ticket ${id} not found.`);
  }

  const updatedTicket = { ...tickets[index], ...updatedFields, updatedAt: new Date().toISOString() };
  tickets[index] = updatedTicket;
  saveTickets(tickets);

  const numericId = toTicketId(id);
  if (numericId !== null) {
    httpClient.put(`/tickets/${numericId}`, updatedFields).then((response) => {
      const backendTicket = formatBackendTicket(response.data);
      const merged = { ...updatedTicket, ...backendTicket, messages: updatedTicket.messages };
      const refreshed = getTickets().map((ticket) => ticket.id === id ? merged : ticket);
      saveTickets(refreshed);
    }).catch(() => {
      // keep local changes if backend unavailable
    });
  }

  return updatedTicket;
};
