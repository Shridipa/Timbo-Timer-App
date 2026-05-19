import { differenceInDays, parseISO, format, subDays } from 'date-fns';

export const calculateStreakStats = (logs, createdAt) => {
  if (!logs || logs.length === 0) return { current: 0, longest: 0, rate: 0 };

  const dates = logs.map(l => l.date).sort((a, b) => new Date(b) - new Date(a));
  
  let current = 0;
  let longest = 0;
  let temp = 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  for (let i = 0; i < dates.length; i++) {
    temp++;
    if (i < dates.length - 1) {
      const diff = differenceInDays(parseISO(dates[i]), parseISO(dates[i+1]));
      if (diff > 1) {
        if (longest < temp) longest = temp;
        if (current === 0 && (dates[0] === today || dates[0] === yesterday)) current = temp;
        temp = 0;
      }
    } else {
      if (longest < temp) longest = temp;
      if (current === 0 && (dates[0] === today || dates[0] === yesterday)) current = temp;
    }
  }

  if (current === 0 && (dates[0] === today || dates[0] === yesterday)) current = temp;

  const totalDays = Math.max(1, differenceInDays(new Date(), new Date(createdAt)) + 1);
  const rate = Math.min(100, Math.round((dates.length / totalDays) * 100));

  return { current, longest, rate };
};
