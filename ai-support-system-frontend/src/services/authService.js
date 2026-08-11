import { getTickets } from './api';

export const authService = {
  getUsers: () => {
    return JSON.parse(localStorage.getItem('aether_accounts') || '[]');
  },
  
  updateUserStatus: (email, updates) => {
    const accounts = JSON.parse(localStorage.getItem('aether_accounts') || '[]');
    const index = accounts.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      localStorage.setItem('aether_accounts', JSON.stringify(accounts));
      return accounts[index];
    }
    throw new Error('User not found');
  }
};
