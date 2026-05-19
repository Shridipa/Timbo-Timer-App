import api from './axios';

export const fetchMorningBrief = async () => {
  const { data } = await api.get('/coaching/brief');
  return data.brief;
};

export const fetchTodayReview = async () => {
  const { data } = await api.get('/coaching/review');
  return data.review;
};

export const submitBedtimeReview = async (reviewData) => {
  const { data } = await api.post('/coaching/review', reviewData);
  return data.dailyReview;
};

export const askStrategicCoach = async (message, chatHistory) => {
  const { data } = await api.post('/coaching/chat', { message, chatHistory });
  return data.reply;
};
