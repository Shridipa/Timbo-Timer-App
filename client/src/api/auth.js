import api from './axios';

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await api.put('/auth/profile', userData);
  return data;
};
