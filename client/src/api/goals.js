import api from './axios';

export const createGoal = async (goalData) => {
  const { data } = await api.post('/goals', goalData);
  return data;
};

export const getActiveGoal = async () => {
  const { data } = await api.get('/goals/active');
  return data;
};

export const completeGoal = async () => {
  const { data } = await api.put('/goals/active/complete');
  return data;
};

export const resetGoal = async () => {
  const { data } = await api.delete('/goals/active');
  return data;
};
