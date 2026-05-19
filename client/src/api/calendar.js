import api from './axios';

export const getAvailability = async () => {
  const { data } = await api.get('/calendar/availability');
  return data;
};

export const updateAvailability = async (profileData) => {
  const { data } = await api.post('/calendar/availability', profileData);
  return data;
};

export const autoSchedule = async () => {
  const { data } = await api.post('/calendar/autoschedule');
  return data;
};

export const getCalendarEvents = async (start, end) => {
  const { data } = await api.get('/calendar/events', {
    params: { start, end }
  });
  return data;
};

export const updateCalendarEvent = async (id, eventData) => {
  const { data } = await api.put(`/calendar/events/${id}`, eventData);
  return data;
};

export const deleteCalendarEvent = async (id) => {
  const { data } = await api.delete(`/calendar/events/${id}`);
  return data;
};

export const trackFocusSession = async (id, sessionData) => {
  const { data } = await api.post(`/calendar/events/${id}/track`, sessionData);
  return data;
};

export const skipCalendarEvent = async (id, excuse) => {
  const { data } = await api.post(`/calendar/events/${id}/skip`, { excuse });
  return data;
};

export const triggerGoogleMockOAuth = async () => {
  const { data } = await api.post('/calendar/oauth/mock');
  return data;
};
