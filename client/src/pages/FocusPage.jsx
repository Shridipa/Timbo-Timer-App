import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Music2, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";

const durations = [25, 45, 90];

export default function FocusPage() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const total = minutes * 60;
  const progress = Math.min(1, (total - secondsLeft) / total);
  const quality = Math.max(40, 100 - interruptions * 14);
  const time = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [secondsLeft]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setCompleted(true);
          toast.success("Session complete. That counts.");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = (next = minutes) => {
    clearInterval(intervalRef.current);
    setMinutes(next);
    setSecondsLeft(next * 60);
    setRunning(false);
    setCompleted(false);
    setInterruptions(0);
  };

  return (
    <div className="focus-stage">
      <section className="focus-card">
        <span className="soft-label">Focus Environment</span>
        <h1>{completed ? "Beautiful work." : "One calm session."}</h1>
        <p>{completed ? `${minutes} minutes logged with ${quality}% focus quality.` : "No pressure to be perfect. Just stay with one task."}</p>

        <div className="duration-row">
          {durations.map((duration) => (
            <button key={duration} className={minutes === duration ? "active" : ""} disabled={running} onClick={() => reset(duration)}>{duration}m</button>
          ))}
        </div>

        <div className="timer-orbit">
          <svg viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="112" />
            <motion.circle cx="130" cy="130" r="112" initial={false} animate={{ pathLength: progress }} transition={{ duration: 0.5 }} />
          </svg>
          <div><strong>{completed ? <CheckCircle2 size={58} /> : time}</strong><span>{quality}% focus quality</span></div>
        </div>

        <div className="focus-actions">
          <button className="icon-action" onClick={() => reset()} title="Reset"><RotateCcw size={19} /></button>
          <button className="primary-action" disabled={completed} onClick={() => setRunning((value) => !value)}>{running ? <Pause size={19} /> : <Play size={19} />}{running ? "Pause" : "Start"}</button>
          <button className="icon-action warning" onClick={() => setInterruptions((value) => value + 1)} title="Log distraction"><AlertTriangle size={19} /></button>
        </div>
      </section>

      <aside className="focus-side">
        <div className="calm-panel">
          <span className="soft-label"><Music2 size={14} /> Ambient Mode</span>
          <h2>Soft rain playlist</h2>
          <p>Music support placeholder: wire this to Spotify, local audio, or a royalty-free focus stream.</p>
        </div>
        <div className="calm-panel">
          <span className="soft-label">Session Ending</span>
          <h2>{interruptions > 2 ? "Reset gently" : "You are doing enough"}</h2>
          <p>{interruptions > 2 ? "Try a 25-minute session next. Smaller is smarter today." : "A clean session is built one returned attention at a time."}</p>
        </div>
      </aside>
    </div>
  );
}
