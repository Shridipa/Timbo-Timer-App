import api from './axios';

export const fetchAnalyticsData = async () => {
  const { data } = await api.get('/analytics');
  return data;
};
