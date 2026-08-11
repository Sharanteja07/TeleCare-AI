import { httpClient } from './httpClient';

export const ticketService = {
  // Get all tickets with optional query filters (search, status, priority, category, engineer_id, page, limit)
  getAllTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.engineer_id) params.append('engineer_id', filters.engineer_id);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await httpClient.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await httpClient.get(`/tickets/${id}`);
    return response.data;
  },

  // Create ticket
  createTicket: async (ticketData) => {
    const response = await httpClient.post('/tickets', {
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || 'Medium',
    });
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, updatedFields) => {
    const response = await httpClient.put(`/tickets/${id}`, updatedFields);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const response = await httpClient.delete(`/tickets/${id}`);
    return response.data;
  },

  // Assign engineer to ticket
  assignEngineer: async (id, engineerId) => {
    const response = await httpClient.put(`/tickets/${id}/assign`, {
      engineer_id: engineerId
    });
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (id, status) => {
    const response = await httpClient.put(`/tickets/${id}/status`, {
      status: status
    });
    return response.data;
  },

  // List all users (Admins)
  getAllUsers: async () => {
    const response = await httpClient.get('/users');
    return response.data;
  },

  // Get current user profile
  getCurrentProfile: async () => {
    const response = await httpClient.get('/users/me');
    return response.data;
  },

  // Attachments Api
  getAttachments: async (ticketId) => {
    const response = await httpClient.get(`/tickets/${ticketId}/attachments`);
    return response.data;
  },

  uploadAttachment: async (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await httpClient.delete(`/tickets/attachments/${attachmentId}`);
    return response.data;
  },

  downloadAttachment: async (attachmentId, fileName) => {
    const response = await httpClient.get(`/tickets/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Chat API
  sendChatMessage: async (ticketId, message) => {
    const response = await httpClient.post('/chat/send', {
      ticket_id: ticketId,
      message: message,
    });
    return response.data;
  },

  getChatHistory: async (ticketId) => {
    const response = await httpClient.get(`/chat/history/${ticketId}`);
    return response.data;
  },

  // Feedback API
  submitFeedback: async (ticketId, rating, comment) => {
    const response = await httpClient.post('/feedback', {
      ticket_id: ticketId,
      rating: parseInt(rating, 10),
      comment: comment,
    });
    return response.data;
  },

  getAllFeedback: async () => {
    const response = await httpClient.get('/feedback');
    return response.data;
  },

  // Analytics API
  getAnalyticsStats: async () => {
    const response = await httpClient.get('/analytics/stats');
    return response.data;
  },

  getAnalyticsCategoryReport: async () => {
    const response = await httpClient.get('/analytics/category-report');
    return response.data;
  },

  getAnalyticsMonthlyReport: async () => {
    const response = await httpClient.get('/analytics/monthly-report');
    return response.data;
  },

  getAnalyticsCustomerSatisfaction: async () => {
    const response = await httpClient.get('/analytics/customer-satisfaction');
    return response.data;
  },

  getAnalyticsEngineerPerformance: async () => {
    const response = await httpClient.get('/analytics/engineer-performance');
    return response.data;
  },

  // Users API Additions
  updateCurrentProfile: async (profileData) => {
    const response = await httpClient.put('/users/me', profileData);
    return response.data;
  },

  getCustomers: async () => {
    const response = await httpClient.get('/users/customers');
    return response.data;
  },

  // Tickets Additional APIs
  updateTicketNotes: async (id, notes) => {
    const response = await httpClient.put(`/tickets/${id}/notes`, { notes });
    return response.data;
  },

  getTicketActivities: async (id) => {
    const response = await httpClient.get(`/tickets/${id}/activities`);
    return response.data;
  },

  // Notifications API
  getNotifications: async () => {
    const response = await httpClient.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await httpClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await httpClient.put('/notifications/read-all');
    return response.data;
  }
};
