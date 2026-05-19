import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Calendar as CalendarIcon, Coffee, Brain, ShieldAlert, 
  CheckCircle2, ArrowRight, Sparkles, AlertCircle, RefreshCw, Sliders
} from 'lucide-react';
import { analyzeTaskSchedule, scheduleIntelligentTask } from '../../api/missions';
import { toast } from 'react-hot-toast';

const AISchedulingModal = ({ isOpen, onClose, onScheduleComplete, initialTitle = '' }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Task & Preference State
  const [taskForm, setTaskForm] = useState({
    title: initialTitle || '',
    description: '',
    preferredTime: 'Morning', // Morning, Afternoon, Evening
    duration: 50, // minutes
    executionMode: 'deep_work', // deep_work, relaxed
    optimizationGoal: 'productivity', // productivity, low_stress
    wantsBreaks: true,
    stressLevel: 'Medium', // Low, Medium, High
    mentalWeight: 'heavy', // heavy, light
    priority: 'high'
  });

  // AI Analysis Results State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [confirmedStartTime, setConfirmedStartTime] = useState('');
  const [confirmedEndTime, setConfirmedEndTime] = useState('');
  const [confirmedLabel, setConfirmedLabel] = useState('Deep Work');
  const [confirmedColor, setConfirmedColor] = useState('#8b5cf6');
  const [confirmedSplit, setConfirmedSplit] = useState(false);

  // Typing indicator simulation for AI suggestions
  const [displayedSuggestions, setDisplayedSuggestions] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(initialTitle ? 2 : 1);
      if (initialTitle) {
        setTaskForm(prev => ({ ...prev, title: initialTitle }));
      }
      setAiAnalysis(null);
      setDisplayedSuggestions([]);
      setTypingIndex(0);
    }
  }, [isOpen, initialTitle]);

  // Handle typing effect when AI analysis completes
  useEffect(() => {
    if (aiAnalysis && aiAnalysis.aiSuggestions && step === 4) {
      setDisplayedSuggestions([]);
      let i = 0;
      const interval = setInterval(() => {
        if (i < aiAnalysis.aiSuggestions.length) {
          setDisplayedSuggestions(prev => [...prev, aiAnalysis.aiSuggestions[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [aiAnalysis, step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!taskForm.title.trim()) {
        toast.error('Please describe the mission or study goal.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      triggerAiAnalysis();
    }
  };

  const triggerAiAnalysis = async () => {
    setAiAnalyzing(true);
    setStep(3); // Analyzing screen
    try {
      const analysis = await analyzeTaskSchedule(taskForm);
      setAiAnalysis(analysis);
      
      // Default confirmation values from AI recommendation
      if (analysis.recommendedStartTime) {
        setConfirmedStartTime(analysis.recommendedStartTime.substring(0, 16)); // YYYY-MM-DDTHH:mm
      } else {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
        setConfirmedStartTime(tomorrow.toISOString().substring(0, 16));
      }
      if (analysis.recommendedEndTime) {
        setConfirmedEndTime(analysis.recommendedEndTime.substring(0, 16));
      } else {
        const tomorrowEnd = new Date(); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1); tomorrowEnd.setHours(11, 0, 0, 0);
        setConfirmedEndTime(tomorrowEnd.toISOString().substring(0, 16));
      }
      setConfirmedLabel(analysis.recommendedLabel || 'Deep Work');
      setConfirmedColor(analysis.recommendedColor || '#8b5cf6');
      setConfirmedSplit(analysis.splitRecommended || false);

      setTimeout(() => {
        setAiAnalyzing(false);
        setStep(4);
      }, 2500); // Give user time to see the beautiful analysis animations
    } catch (error) {
      toast.error('AI Cognitive Analysis failed. Using smart heuristics.');
      setAiAnalyzing(false);
      setStep(2);
    }
  };

  const handleConfirmPlacement = async () => {
    setLoading(true);
    try {
      const payload = {
        ...taskForm,
        startTime: new Date(confirmedStartTime).toISOString(),
        endTime: new Date(confirmedEndTime).toISOString(),
        label: confirmedLabel,
        color: confirmedColor,
        splitIntoTwo: confirmedSplit
      };

      const res = await scheduleIntelligentTask(payload);
      toast.success(res.message || 'Task intelligently placed into optimal calendar slot!');
      if (onScheduleComplete) onScheduleComplete(res);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to place task in calendar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto font-['DM_Sans',sans-serif]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] backdrop-blur-2xl my-8"
        >
          {/* Top glowing accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 text-white">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                  AI Cognitive Scheduler <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 rounded-full">Coach Mode</span>
                </h2>
                <p className="text-xs text-[var(--muted)]">Intelligent workload alignment & cognitive budgeting</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--card-border)] hover:bg-black/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* STEP 1: Task Title & Description */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center py-4">
                  <h3 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">What is the mission or study goal?</h3>
                  <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                    Instead of dumping tasks randomly into your calendar, let's align this objective with your peak cognitive state.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">Task / Mission Name</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={taskForm.title} 
                      onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g., Complete Dynamic Programming practice"
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted)] text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Context / Notes (Optional)</label>
                    <textarea 
                      rows={3}
                      value={taskForm.description} 
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="e.g., Focus on memoization and tabulation techniques..."
                      className="w-full px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 max-w-xl mx-auto">
                  <button 
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-opacity cursor-pointer group"
                  >
                    Configure Cognitive State <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Conversational Questions & Preferences */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[var(--foreground)]">
                  <Sparkles className="w-5 h-5 flex-shrink-0 animate-spin text-indigo-500" />
                  <p className="text-xs leading-relaxed">
                    <strong className="text-[var(--foreground)] font-semibold">AI Coach:</strong> I'm analyzing your calendar habits. Answer these quick cognitive checks so I can calculate the absolute best placement for <strong className="text-[var(--foreground)] font-bold">"{taskForm.title}"</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Q1: Preferred Time */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-indigo-500/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">🌅 When do you usually feel mentally sharp?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { l: 'Morning', icon: '🌅' },
                        { l: 'Afternoon', icon: '☀️' },
                        { l: 'Evening', icon: '🌙' }
                      ].map(t => (
                        <button 
                          key={t.l} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, preferredTime: t.l })}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 border text-xs font-bold transition-all cursor-pointer ${taskForm.preferredTime === t.l ? 'bg-indigo-500/10 border-indigo-500 text-[var(--foreground)] shadow-lg shadow-indigo-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          <span className="text-lg">{t.icon}</span>
                          <span>{t.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Mental Weight */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-purple-500/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">🏋️ Whether the task feels mentally heavy or light?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'heavy', l: 'Mentally Heavy', desc: 'Requires deep focus' },
                        { id: 'light', l: 'Mentally Light', desc: 'Quick execution' }
                      ].map(w => (
                        <button 
                          key={w.id} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, mentalWeight: w.id })}
                          className={`p-3 rounded-xl flex flex-col items-start gap-1 border text-left transition-all cursor-pointer ${taskForm.mentalWeight === w.id ? 'bg-purple-500/10 border-purple-500 text-[var(--foreground)] shadow-lg shadow-purple-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          <span className="text-xs font-bold text-[var(--foreground)]">{w.l}</span>
                          <span className="text-[10px] text-[var(--muted)]">{w.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Execution Mode */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-indigo-500/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">⚡ Do you want deep work or relaxed execution mode?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'deep_work', l: 'Deep Work', icon: '⚡', color: 'indigo' },
                        { id: 'relaxed', l: 'Relaxed Mode', icon: '🍃', color: 'emerald' }
                      ].map(m => (
                        <button 
                          key={m.id} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, executionMode: m.id })}
                          className={`p-3 rounded-xl flex items-center gap-2 border text-xs font-bold transition-all cursor-pointer ${taskForm.executionMode === m.id ? 'bg-indigo-500/10 border-indigo-500 text-[var(--foreground)] shadow-lg shadow-indigo-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <span>{m.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4: Duration */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-blue-500/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">⏱️ How long can you comfortably focus on this?</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 50, 90, 120].map(d => (
                        <button 
                          key={d} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, duration: d })}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${taskForm.duration === d ? 'bg-blue-500/10 border-blue-500 text-[var(--foreground)] shadow-lg shadow-blue-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q5: Stress / Fatigue Level */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-white/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">🧘 What is your current stress/fatigue level?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { l: 'Low', c: 'text-emerald-500' },
                        { l: 'Medium', c: 'text-yellow-500' },
                        { l: 'High', c: 'text-rose-500' }
                      ].map(s => (
                        <button 
                          key={s.l} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, stressLevel: s.l })}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${taskForm.stressLevel === s.l ? 'bg-black/5 border-[var(--foreground)] text-[var(--foreground)] shadow-sm' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          <span className={s.c}>●</span> {s.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q6: Optimize For */}
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 hover:border-indigo-500/30 transition-colors">
                    <label className="block text-xs font-bold text-[var(--muted)]">🎯 Should I optimize for productivity or low stress?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'productivity', l: '🚀 Max Productivity' },
                        { id: 'low_stress', l: '🧘 Low Stress' }
                      ].map(o => (
                        <button 
                          key={o.id} 
                          type="button" 
                          onClick={() => setTaskForm({ ...taskForm, optimizationGoal: o.id })}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer truncate ${taskForm.optimizationGoal === o.id ? 'bg-indigo-500/10 border-indigo-500 text-[var(--foreground)] shadow-lg shadow-indigo-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q7: Breaks */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)]">Do you want breaks between sessions?</h4>
                        <p className="text-xs text-[var(--muted)]">AI will automatically schedule a 15-minute Cognitive Recovery Buffer</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setTaskForm({ ...taskForm, wantsBreaks: !taskForm.wantsBreaks })}
                      className={`px-6 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${taskForm.wantsBreaks ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                    >
                      {taskForm.wantsBreaks ? '☕ Yes, Add Buffer' : '🚫 No Breaks'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[var(--card-border)]">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-opacity cursor-pointer group"
                  >
                    <Sliders className="w-5 h-5" /> Analyze & Find Optimal Slot
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: AI Analyzing Loading Screen */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center space-y-8">
                <div className="relative w-24 h-24 mx-auto">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500"
                  />
                  <motion.div 
                    animate={{ scale: [1.2, 1, 1.2], rotate: -360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                    <Brain className="w-10 h-10 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">AI Cognitive Engine Analyzing...</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Scanning existing calendar events, free time blocks, sleep schedule, peak productivity windows, burnout indicators, deep work limits, context switching, focus history, and previous skipped tasks...
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping delay-150" />
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping delay-300" />
                </div>
              </motion.div>
            )}

            {/* STEP 4: AI Suggestions & Confirmation */}
            {step === 4 && aiAnalysis && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-[var(--foreground)] shadow-inner">
                  <Brain className="w-6 h-6 flex-shrink-0 text-indigo-500 animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--foreground)] mb-0.5">AI Strategic Recommendation Synthesized</h4>
                    <p className="text-xs text-[var(--muted)]">{aiAnalysis.cognitiveLoadAssessment || 'Optimal placement calculated based on your cognitive profile.'}</p>
                  </div>
                </div>

                {/* AI Suggestions with typing indicator */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-500">AI Coach Insights</label>
                  <div className="space-y-2">
                    {displayedSuggestions.map((sug, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] leading-relaxed shadow-sm"
                      >
                        <span className="text-indigo-500 mt-1">💡</span>
                        <p>{sug}</p>
                      </motion.div>
                    ))}
                    {displayedSuggestions.length < (aiAnalysis.aiSuggestions?.length || 0) && (
                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--muted)] italic animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> AI Coach is typing...
                      </div>
                    )}
                  </div>
                </div>

                {/* Placement Details Card */}
                <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
                    <h4 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-500" /> Proposed Schedule Block
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)] font-bold">Label:</span>
                      <select 
                        value={confirmedLabel}
                        onChange={e => setConfirmedLabel(e.target.value)}
                        className="px-3 py-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Deep Work">⚡ Deep Work</option>
                        <option value="Revision">📚 Revision</option>
                        <option value="Recovery">🍃 Recovery</option>
                        <option value="Cognitive Sprint">🚀 Cognitive Sprint</option>
                        <option value="Focus Session">🎯 Focus Session</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Start Time</label>
                      <input 
                        type="datetime-local" 
                        value={confirmedStartTime}
                        onChange={e => setConfirmedStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-indigo-500 font-['DM_Mono',monospace]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">End Time</label>
                      <input 
                        type="datetime-local" 
                        value={confirmedEndTime}
                        onChange={e => setConfirmedEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-indigo-500 font-['DM_Mono',monospace]"
                      />
                    </div>
                  </div>

                  {/* Split Task Option */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
                    <div>
                      <label className="block text-xs font-bold text-[var(--foreground)] mb-0.5">Split into 2 sessions?</label>
                      <p className="text-[11px] text-[var(--muted)]">{aiAnalysis.splitExplanation || 'Improves retention for cognitively demanding tasks'}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setConfirmedSplit(!confirmedSplit)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${confirmedSplit ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-sm' : 'bg-[var(--card-bg)] border-transparent text-[var(--muted)] hover:bg-[var(--card-border)] hover:text-[var(--foreground)]'}`}
                    >
                      {confirmedSplit ? '➗ Yes, Split in 2' : '1️⃣ Single Session'}
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Adjust Preferences
                  </button>
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={handleConfirmPlacement}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Placing Intelligently...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Confirm & Intelligently Place
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AISchedulingModal;
