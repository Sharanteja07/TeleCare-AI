import { httpClient } from './httpClient';

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  const response = await httpClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const registerUser = async (userData) => {
  const payload = {
    username: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'customer'
  };
  const response = await httpClient.post('/auth/register', payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await httpClient.get('/users/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await httpClient.post('/auth/forgot', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await httpClient.post('/auth/reset', { token, new_password: newPassword });
  return response.data;
};

export const sendOTP = async (email) => {
  const response = await httpClient.post('/auth/otp/send', { email });
  return response.data;
};

export const verifyOTP = async (email, code, role) => {
  const response = await httpClient.post('/auth/otp/verify', { email, code, role });
  return response.data;
};
