import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, Clock, Zap, Settings, RefreshCw, AlertTriangle, 
  Play, CheckCircle2, XCircle, ShieldAlert, Award, Coffee, BookOpen, Trash2 
} from 'lucide-react';
import { 
  getAvailability, updateAvailability, autoSchedule, getCalendarEvents, 
  updateCalendarEvent, deleteCalendarEvent, trackFocusSession, skipCalendarEvent, triggerGoogleMockOAuth 
} from '../api/calendar';
import { toast } from 'react-hot-toast';
import AISchedulingModal from '../components/ai/AISchedulingModal';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  // Focus Arena State
  const [activeFocusEvent, setActiveFocusEvent] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [pausesCount, setPausesCount] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const focusIntervalRef = useRef(null);

  // Skip Modal State
  const [activeSkipEvent, setActiveSkipEvent] = useState(null);
  const [skipExcuse, setSkipExcuse] = useState('');
  const [skipAppraisal, setSkipAppraisal] = useState(null);
  const [submittingSkip, setSubmittingSkip] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    morningAvailable: '08:00 - 12:00',
    afternoonAvailable: '13:00 - 17:00',
    eveningAvailable: '18:00 - 22:00',
    weekendSchedule: '09:00 - 18:00',
    sleepStart: '23:00',
    sleepEnd: '07:00',
    peakHour: '10:00',
    maxDeepWorkHours: 4,
    preferredDuration: 50,
    preferredBreak: 10,
    fixedCommitments: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const availRes = await getAvailability();
      if (availRes.profile) {
        setAvailability(availRes.profile);
        setSettingsForm({
          morningAvailable: availRes.profile.morningAvailable,
          afternoonAvailable: availRes.profile.afternoonAvailable,
          eveningAvailable: availRes.profile.eveningAvailable,
          weekendSchedule: availRes.profile.weekendSchedule,
          sleepStart: availRes.profile.sleepStart,
          sleepEnd: availRes.profile.sleepEnd,
          peakHour: availRes.profile.peakHour,
          maxDeepWorkHours: availRes.profile.maxDeepWorkHours,
          preferredDuration: availRes.profile.preferredDuration,
          preferredBreak: availRes.profile.preferredBreak,
          fixedCommitments: availRes.profile.fixedCommitments || ''
        });
      }
      await loadEvents();
    } catch (error) {
      toast.error('Failed to load scheduling metrics');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const end = new Date();
      end.setDate(end.getDate() + 30);
      
      const eventsRes = await getCalendarEvents(start.toISOString(), end.toISOString());
      if (eventsRes.events) {
        // Format for FullCalendar
        const formatted = eventsRes.events.map(ev => ({
          id: ev._id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          color: ev.color,
          extendedProps: {
            type: ev.type,
            intensity: ev.intensity,
            status: ev.status,
            description: ev.description,
            googleEventId: ev.googleEventId
          }
        }));
        setEvents(formatted);
      }
    } catch (e) {
      toast.error('Failed to sync calendar timelines');
    }
  };

  // Drag & Drop event updates
  const handleEventDrop = async (info) => {
    const { event } = info;
    try {
      await updateCalendarEvent(event.id, {
        start: event.start.toISOString(),
        end: event.end.toISOString()
      });
      toast.success(`Rescheduled: "${event.title}" synced!`);
      await loadEvents();
    } catch (e) {
      toast.error('Failed to reschedule event');
      info.revert();
    }
  };

  const handleEventResize = async (info) => {
    const { event } = info;
    try {
      await updateCalendarEvent(event.id, {
        start: event.start.toISOString(),
        end: event.end.toISOString()
      });
      toast.success(`Rescheduled session duration for: "${event.title}"`);
      await loadEvents();
    } catch (e) {
      toast.error('Failed to adjust duration');
      info.revert();
    }
  };

  // Trigger AI Auto-Scheduler
  const handleTriggerAutoSchedule = async () => {
    setLoading(true);
    try {
      const res = await autoSchedule();
      if (res.success) {
        toast.success(`AI scheduled ${res.eventsCount} custom blocks dynamically!`);
        await loadEvents();
      }
    } catch (e) {
      toast.error('Scheduling neural matrix calculation failed');
    } finally {
      setLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateAvailability(settingsForm);
      if (res.success) {
        setAvailability(res.profile);
        toast.success('Availability parameters successfully calculated.');
        setShowSettings(false);
        await loadEvents();
      }
    } catch (err) {
      toast.error('Failed to update scheduling rules');
    } finally {
      setLoading(false);
    }
  };

  // Save Settings & Auto-Schedule Combined
  const handleSaveAvailabilityAndSchedule = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await updateAvailability(settingsForm);
      if (res.success) {
        setAvailability(res.profile);
        toast.success('Preferred scheduling times verified!');
        
        const scheduleRes = await autoSchedule();
        if (scheduleRes.success) {
          toast.success(`AI scheduled ${scheduleRes.eventsCount} custom blocks dynamically!`);
          await loadEvents();
        }
      }
    } catch (err) {
      toast.error('Failed to save preferred times or auto-schedule');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Simulation
  const handleConnectGoogleCalendar = async () => {
    setSyncingGoogle(true);
    try {
      const res = await triggerGoogleMockOAuth();
      if (res.authUrl) {
        toast.loading('Redirecting to Google OAuth secure portal...', { duration: 2000 });
        setTimeout(() => {
          setGoogleConnected(true);
          toast.success('Google Calendar Sync activated successfully!', { id: 'gcal-toast' });
          setSyncingGoogle(false);
        }, 2200);
      }
    } catch (e) {
      toast.error('Failed to load Google Auth redirect context');
      setSyncingGoogle(false);
    }
  };

  // Delete Calendar Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteCalendarEvent(id);
      toast.success('Event cleared.');
      await loadEvents();
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  // Pomodoro Focus Arena
  const startFocusTimer = (event) => {
    setActiveFocusEvent(event);
    const durationMins = Math.round((new Date(event.end) - new Date(event.start)) / 60000) || 50;
    setTimerSeconds(durationMins * 60);
    setTimerActive(true);
    setPausesCount(0);
    setInterruptions(0);

    focusIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(focusIntervalRef.current);
          completeFocusArena(event, durationMins);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeFocusArena = async (event, durationMins) => {
    setTimerActive(false);
    try {
      await trackFocusSession(event.id, {
        startTime: event.start,
        endTime: new Date(),
        actualDuration: durationMins,
        pausesCount,
        interruptions,
        completionRate: 100
      });
      toast.success('Objective Completed! Focus metrics logged in your profile.');
      setActiveFocusEvent(null);
      await loadEvents();
    } catch (e) {
      toast.error('Failed to log focus results');
    }
  };

  const handlePauseTimer = () => {
    setPausesCount(prev => prev + 1);
    setTimerActive(!timerActive);
    if (timerActive) {
      clearInterval(focusIntervalRef.current);
    } else {
      focusIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
  };

  // Skip / CBT Confrontation
  const handleOpenSkipModal = (event) => {
    setActiveSkipEvent(event);
    setSkipExcuse('');
    setSkipAppraisal(null);
  };

  const handleExcuseSubmit = async (e) => {
    e.preventDefault();
    if (!skipExcuse.trim()) return;

    setSubmittingSkip(true);
    try {
      const res = await skipCalendarEvent(activeSkipEvent.id, skipExcuse);
      setSkipAppraisal(res.appraisal);
      toast.success('Appraisal synthesized.');
      await loadEvents();
    } catch (error) {
      toast.error('Coaching brain calculation failed');
    } finally {
      setSubmittingSkip(false);
    }
  };

  // Render Format Event Blocks
  const renderEventContent = (eventInfo) => {
    const type = eventInfo.event.extendedProps.type;
    const status = eventInfo.event.extendedProps.status;

    const styleMap = {
      deep_work: {
        bg: 'bg-indigo-600 text-white dark:bg-indigo-950/40 dark:text-indigo-300 dark:border dark:border-indigo-500/30',
        icon: <Zap className="w-3 h-3 text-yellow-300" />
      },
      break: {
        bg: 'bg-emerald-600 text-white dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
        icon: <Coffee className="w-3 h-3 text-emerald-300" />
      },
      learning: {
        bg: 'bg-blue-600 text-white dark:bg-blue-950/40 dark:text-blue-300 dark:border dark:border-blue-500/30',
        icon: <BookOpen className="w-3 h-3 text-blue-300" />
      },
      routine: {
        bg: 'bg-pink-600 text-white dark:bg-pink-950/40 dark:text-pink-300 dark:border dark:border-pink-500/30',
        icon: <Clock className="w-3 h-3 text-pink-300" />
      }
    };

    const activeStyle = styleMap[type] || {
      bg: 'bg-gray-600 text-white dark:bg-gray-950/40 dark:text-gray-300 dark:border dark:border-gray-500/30',
      icon: <BookOpen className="w-3 h-3 text-gray-300" />
    };

    return (
      <div className={`p-1.5 rounded-lg text-xs relative h-full w-full flex flex-col justify-between overflow-hidden cursor-pointer group shadow-sm transition-all duration-200 ${activeStyle.bg}`}>
        <div>
          <div className="font-extrabold flex items-center gap-1">
            {activeStyle.icon}
            <span className="truncate">{eventInfo.event.title}</span>
          </div>
          {eventInfo.event.extendedProps.description && (
            <p className="opacity-80 text-[10px] truncate">{eventInfo.event.extendedProps.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-current/10">
          <span className="text-[9px] uppercase font-bold opacity-60">
            {status}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {status === 'scheduled' && (
              <button 
                onClick={(e) => { e.stopPropagation(); startFocusTimer(eventInfo.event); }}
                className="p-1 rounded bg-white/20 text-current hover:bg-white/40"
              >
                <Play className="w-2.5 h-2.5" />
              </button>
            )}
            {status === 'scheduled' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenSkipModal(eventInfo.event); }}
                className="p-1 rounded bg-white/20 text-current hover:bg-white/40"
              >
                <XCircle className="w-2.5 h-2.5" />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(eventInfo.event.id); }}
              className="p-1 rounded bg-white/10 text-current hover:bg-white/30"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mini calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, currentMonth.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1, 1));
  const isToday = (d) => today.getDate() === d && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === year;
  const todayEvents = events.filter(e => { const d = new Date(e.start); return d.toDateString() === today.toDateString(); });
  const deepWorkCount = events.filter(e => e.extendedProps?.type === 'deep_work').length;
  const breakCount = events.filter(e => e.extendedProps?.type === 'break').length;
  const [calView, setCalView] = useState('Month');
  const calendarRef = useRef(null);

  return (
    <div className="w-full max-w-full px-16 pt-10 pb-20 mx-auto">
      {/* Focus Timer Overlay */}
      {activeFocusEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
            <div>
              <span className="px-3 py-1 text-xs font-bold uppercase bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20 animate-pulse">Active Focus</span>
              <h2 className="text-2xl font-black text-white mt-3 truncate">{activeFocusEvent.title}</h2>
            </div>
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-indigo-500/40 flex flex-col items-center justify-center mx-auto">
              <p className="text-4xl font-black text-white">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={handlePauseTimer} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold cursor-pointer">{timerActive ? 'Pause' : 'Resume'}</button>
              <button onClick={() => { clearInterval(focusIntervalRef.current); completeFocusArena(activeFocusEvent, Math.round((new Date(activeFocusEvent.end) - new Date(activeFocusEvent.start)) / 60000)); }} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Done</button>
              <button onClick={() => { clearInterval(focusIntervalRef.current); setActiveFocusEvent(null); }} className="px-5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold cursor-pointer">Abort</button>
            </div>
          </div>
        </div>
      )}
      {/* Skip Modal */}
      {activeSkipEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-400" /> Excuse Appraisal</h3>
              <button onClick={() => setActiveSkipEvent(null)} className="text-gray-400 hover:text-white cursor-pointer">âœ•</button>
            </div>
            {!skipAppraisal ? (
              <form onSubmit={handleExcuseSubmit} className="space-y-4">
                <p className="text-sm text-gray-400">Skipping <strong className="text-white">"{activeSkipEvent.title}"</strong>. Why?</p>
                <textarea required rows={3} value={skipExcuse} onChange={e => setSkipExcuse(e.target.value)} placeholder="Your reason..." className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500" />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setActiveSkipEvent(null)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-bold cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submittingSkip} className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50">{submittingSkip ? 'Analyzing...' : 'Submit'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-1"><span className="text-[10px] uppercase font-black text-gray-500">Result</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${skipAppraisal.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>{skipAppraisal.isValid ? 'Valid' : 'Avoidance'}</span></div>
                  <p className="text-sm text-white">Pattern: <span className="text-indigo-400 capitalize">{skipAppraisal.classification}</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10"><p className="text-sm text-gray-300 italic">"{skipAppraisal.feedback}"</p></div>
                <div className="flex justify-end"><button onClick={() => { setActiveSkipEvent(null); setSkipAppraisal(null); }} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">Close</button></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* â•â•â• MAIN CALENDAR APP WINDOW â•â•â• */}
      <div className="flex rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] min-h-[85vh]">

        {/* â”€â”€ LEFT DARK SIDEBAR â”€â”€ */}
        <div className="w-[300px] flex-shrink-0 bg-[#1c1c1e] text-white flex flex-col p-5 hidden lg:flex">
          {/* Traffic lights */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="flex-1" />
            <button onClick={handleTriggerAutoSchedule} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg cursor-pointer transition-colors" title="AI Auto-Schedule">+</button>
          </div>

          {/* Month title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">{monthName} <span className="text-red-400">{year}</span></h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm cursor-pointer">&lt;</button>
              <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm cursor-pointer">&gt;</button>
            </div>
          </div>

          {/* Mini calendar grid */}
          <div className="mb-5">
            <div className="grid grid-cols-7 gap-0 text-center text-[10px] text-gray-500 font-bold uppercase mb-1">
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0 text-center text-xs">
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="py-1.5 text-gray-700">{new Date(year, currentMonth.getMonth(), 0).getDate() - firstDay + i + 1}</div>)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const hasEvent = events.some(e => { const ed = new Date(e.start); return ed.getDate() === d && ed.getMonth() === currentMonth.getMonth(); });
                return (
                  <div key={d} className="py-1.5 relative cursor-default group">
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${isToday(d) ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30' : 'text-gray-300 group-hover:bg-white/10'}`}>{d}</span>
                    {hasEvent && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Agenda */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Today {today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</p>
            {todayEvents.length > 0 ? todayEvents.map((ev, i) => {
              const s = new Date(ev.start); const en = new Date(ev.end);
              const colors = { deep_work: 'bg-blue-500', break: 'bg-emerald-500', learning: 'bg-purple-500' };
              return (
                <div key={i} className="flex items-start gap-3 mb-3 group">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[ev.extendedProps?.type] || 'bg-gray-500'}`} />
                  <div>
                    <p className="text-[11px] text-gray-400">{s.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {en.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                    <p className="text-sm font-semibold text-white leading-tight">{ev.title}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No sessions today</p>
                <button onClick={handleTriggerAutoSchedule} className="mt-2 px-4 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold cursor-pointer hover:bg-blue-500/20 transition-colors">+ Generate Schedule</button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setShowSettings(!showSettings)} className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"><Settings className="w-3.5 h-3.5" /> Availability Settings</button>
            <button onClick={handleConnectGoogleCalendar} disabled={syncingGoogle} className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${googleConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}>
              <CalendarIcon className="w-3.5 h-3.5" /> {googleConnected ? 'Google Synced ✓' : 'Sync Google'}
            </button>
          </div>

          {/* My Calendars */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">My Calendars <span className="text-gray-600">▼</span></p>
          </div>
        </div>

        {/* -- MAIN CALENDAR AREA -- */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#121220]">

          {/* Top toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a2e]">
            <div className="flex items-center gap-2">
              <button onClick={() => { const api = calendarRef.current?.getApi(); api?.prev(); }} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer transition-colors">&lt;</button>
              <button onClick={() => { const api = calendarRef.current?.getApi(); api?.today(); }} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer transition-colors">Today</button>
              <button onClick={() => { const api = calendarRef.current?.getApi(); api?.next(); }} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer transition-colors">&gt;</button>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
              {['Day', 'Week', 'Month'].map(v => (
                <button key={v} onClick={() => { setCalView(v); const api = calendarRef.current?.getApi(); api?.changeView(v === 'Day' ? 'timeGridDay' : v === 'Week' ? 'timeGridWeek' : 'dayGridMonth'); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${calView === v ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{v}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-90 shadow-lg shadow-purple-500/20"
              >
                <span>✨</span> AI Smart Schedule Task
              </button>
              <button onClick={handleTriggerAutoSchedule} disabled={loading} className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 shadow-sm shadow-indigo-500/20">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Auto-Fill
              </button>
            </div>
          </div>

          {/* Settings panel (overlay) */}
          {showSettings && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a2e]">
              <form onSubmit={handleSaveSettings} className="flex flex-wrap gap-3 items-end">
                {[['Morning', 'morningAvailable'], ['Afternoon', 'afternoonAvailable'], ['Evening', 'eveningAvailable'], ['Peak Hour', 'peakHour'], ['Sleep', 'sleepStart'], ['Wake', 'sleepEnd']].map(([l, k]) => (
                  <div key={k} className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">{l}</label>
                    <input type="text" value={settingsForm[k]} onChange={e => setSettingsForm({ ...settingsForm, [k]: e.target.value })} className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400" />
                  </div>
                ))}
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer">Save</button>
                <button type="button" onClick={() => setShowSettings(false)} className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold cursor-pointer">✕</button>
              </form>
            </div>
          )}

          {/* Calendar */}
          <div className="flex-1 p-4 overflow-auto">
            {events.length === 0 && !loading ? (
              <div className="max-w-2xl mx-auto my-6 p-8 rounded-3xl bg-white dark:bg-[#1a1a2e]/60 border border-gray-200 dark:border-white/5 backdrop-blur-md shadow-xl text-center space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Clock className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-950 dark:text-white mb-1">🎯 Define Your Preferred Scheduling Times</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                    Before generating your AI Daily Schedule, please verify or customize your routine time blocks. This ensures tasks from your roadmap are scheduled at your peak performance hours.
                  </p>
                </div>

                <form onSubmit={handleSaveAvailabilityAndSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  {[
                    { label: '🌅 Morning Routine Window', key: 'morningAvailable', placeholder: 'e.g. 08:00 - 12:00' },
                    { label: '☀️ Afternoon Focus Window', key: 'afternoonAvailable', placeholder: 'e.g. 13:00 - 17:00' },
                    { label: '🌌 Evening Routine Window', key: 'eveningAvailable', placeholder: 'e.g. 18:00 - 22:00' },
                    { label: '⚡ Peak Productivity Hour', key: 'peakHour', placeholder: 'e.g. 10:00' },
                    { label: '🛌 Sleep Start Time', key: 'sleepStart', placeholder: 'e.g. 23:00' },
                    { label: '⏰ Sleep End (Wake) Time', key: 'sleepEnd', placeholder: 'e.g. 07:00' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <input 
                        type="text" 
                        required
                        value={settingsForm[field.key]} 
                        placeholder={field.placeholder}
                        onChange={e => setSettingsForm({ ...settingsForm, [field.key]: e.target.value })} 
                        className="w-full rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 text-sm text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-white/5 flex flex-col items-center gap-3">
                    <button type="submit" className="w-full md:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-extrabold cursor-pointer shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity">
                      <Zap className="w-4 h-4 text-yellow-300" /> Save Times & Generate AI Calendar Schedule
                    </button>
                    <p className="text-[10px] text-gray-400">You can update these times in "Availability Settings" at any time.</p>
                  </div>
                </form>
              </div>
            ) : (
              <div className="theme-futuristic-calendar text-gray-800 dark:text-gray-200">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  events={events}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={3}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  eventContent={renderEventContent}
                  slotMinTime="06:00:00"
                  slotMaxTime="24:00:00"
                  height="auto"
                />
              </div>
            )}
          </div>

          {/* Bottom metrics bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a2e]">
            {[
              { l: 'Sessions', v: events.length, c: 'text-indigo-500' },
              { l: 'Deep Work', v: deepWorkCount, c: 'text-blue-500' },
              { l: 'Recovery', v: breakCount, c: 'text-emerald-500' },
              { l: 'AI Score', v: availability ? '87%' : '--', c: 'text-purple-500' },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <p className={`text-lg font-black ${m.c}`}>{m.v}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AISchedulingModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onScheduleComplete={loadEvents} 
      />
    </div>
  );
};

export default CalendarPage;
