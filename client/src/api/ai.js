import api from './axios';

export const getAIInsights = async () => {
  const { data } = await api.get('/ai/insights');
  return data;
};

export const getAICoachAdvice = async (question) => {
  const { data } = await api.post('/ai/coach', { question });
  return data;
};
