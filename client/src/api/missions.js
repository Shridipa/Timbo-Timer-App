import api from './axios';

export const fetchDailyMissions = async (date) => {
  const url = date ? `/missions?date=${date}` : '/missions';
  const { data } = await api.get(url);
  return data.missions;
};

export const toggleMissionStatus = async (id) => {
  const { data } = await api.put(`/missions/${id}/toggle`);
  return data;
};

export const skipMission = async (id, excuse) => {
  const { data } = await api.put(`/missions/${id}/skip`, { excuse });
  return data;
};

export const logFocusSession = async (id, focusTime, interruptions) => {
  const { data } = await api.put(`/missions/${id}/focus`, { focusTime, interruptions });
  return data;
};

export const analyzeTaskSchedule = async (taskData) => {
  const { data } = await api.post('/missions/ai-schedule-analysis', taskData);
  return data.aiAnalysis;
};

export const scheduleIntelligentTask = async (taskData) => {
  const { data } = await api.post('/missions/schedule', taskData);
  return data;
};
