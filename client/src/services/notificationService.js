import { fetchDailyMissions } from '../api/missions';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

let reminderInterval = null;

export const startReminderService = (userId) => {
  if (reminderInterval) clearInterval(reminderInterval);
  
  // Try requesting permission upon starting the dashboard
  requestNotificationPermission();

  // Gentle periodic nudge for pending missions
  reminderInterval = setInterval(async () => {
    try {
      const missions = await fetchDailyMissions();
      const pendingMissions = missions.filter(m => m.status === 'pending');
      
      if (pendingMissions.length > 0) {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();

        // Nudge at specific peak hours: 9:00 AM, 1:00 PM, 5:00 PM, and 8:00 PM
        const nudgeHours = [9, 13, 17, 20];
        if (nudgeHours.includes(hour) && minutes === 0) {
          const lastNotifiedKey = `nudge_${hour}_${now.toDateString()}`;
          if (!localStorage.getItem(lastNotifiedKey)) {
            new Notification('LifeOS AI: Mission Execution Alert', {
              body: `You have ${pendingMissions.length} scheduled mission(s) pending for today. Let's enter the Focus Arena!`,
              icon: '/favicon.ico',
            });
            localStorage.setItem(lastNotifiedKey, 'true');
          }
        }
      }
    } catch (e) {
      console.error('Notification service telemetry error:', e);
    }
  }, 60000); // Check once a minute
};

export const stopReminderService = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
};
