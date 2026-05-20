import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Check, Clock3, Gauge, GraduationCap, Sparkles, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { addMonths, format } from "date-fns";
import { useAuth } from "../context/AuthContext";

const steps = ["Goal", "Deadline", "Level", "Availability", "Focus", "Generate"];

const availabilityTemplate = [
  { day: "Mon", blocks: ["2-5 PM"] },
  { day: "Tue", blocks: ["6-8 PM"] },
  { day: "Wed", blocks: ["7-8 PM"] },
  { day: "Thu", blocks: ["2-4 PM"] },
  { day: "Fri", blocks: ["6-7 PM"] },
  { day: "Sat", blocks: ["10 AM-1 PM"] },
  { day: "Sun", blocks: ["Recovery"] },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { enterDemo } = useAuth();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    goal: "Crack FAANG in 6 months",
    deadline: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
    level: "Intermediate",
    dailyTime: "2.5 hours",
    preferredHours: "Before noon",
    difficulty: "Stretch, not stressful",
    availability: availabilityTemplate,
  });

  const preview = useMemo(() => {
    const deadline = new Date(profile.deadline);
    return [
      { label: "Roadmap", value: "4 phases" },
      { label: "Weekly target", value: profile.level === "Beginner" ? "5 missions" : "7 missions" },
      { label: "Daily load", value: profile.dailyTime },
      { label: "Target date", value: Number.isNaN(deadline.valueOf()) ? "Flexible" : format(deadline, "MMM d") },
    ];
  }, [profile]);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const finish = () => {
    const demoUser = enterDemo(profile);
    if (demoUser) navigate("/");
  };

  return (
    <main className="onboarding-shell">
      <section className="onboarding-panel">
        <div className="onboarding-copy">
          <span className="soft-label"><Sparkles size={14} /> Timbo-Timer</span>
          <h1>Turn one big goal into today's calm mission.</h1>
          <p>Timbo builds a roadmap, schedules focus sessions around your real availability, and adapts when momentum dips.</p>

          <div className="onboarding-steps" aria-label="Onboarding progress">
            {steps.map((item, index) => (
              <button key={item} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => setStep(index)} aria-label={item}>
                {index < step ? <Check size={14} /> : index + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="onboarding-card">
              {step === 0 && (
                <>
                  <label>What are you trying to achieve?</label>
                  <textarea value={profile.goal} onChange={(e) => update("goal", e.target.value)} />
                </>
              )}
              {step === 1 && (
                <>
                  <label>When should Timbo help you arrive?</label>
                  <input type="date" value={profile.deadline} onChange={(e) => update("deadline", e.target.value)} />
                </>
              )}
              {step === 2 && (
                <>
                  <label>Where are you starting from?</label>
                  <div className="choice-grid">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <button key={level} className={profile.level === level ? "active" : ""} onClick={() => update("level", level)}>
                        <GraduationCap size={17} /> {level}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <label>When are you usually free?</label>
                  <div className="availability-grid">
                    {profile.availability.map((day) => (
                      <button key={day.day}>
                        <strong>{day.day}</strong>
                        <span>{day.blocks[0]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <label>How should Timbo pace the work?</label>
                  <div className="choice-grid">
                    {["Before noon", "Afternoon", "Evening"].map((window) => (
                      <button key={window} className={profile.preferredHours === window ? "active" : ""} onClick={() => update("preferredHours", window)}>
                        <Clock3 size={17} /> {window}
                      </button>
                    ))}
                  </div>
                  <div className="choice-grid">
                    {["Gentle", "Stretch, not stressful", "Intense"].map((difficulty) => (
                      <button key={difficulty} className={profile.difficulty === difficulty ? "active" : ""} onClick={() => update("difficulty", difficulty)}>
                        <Gauge size={17} /> {difficulty}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 5 && (
                <div className="generate-state">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={34} />
                  </motion.div>
                  <h2>Your adaptive roadmap is ready.</h2>
                  <p>Timbo has created milestones, daily missions, recovery rules, and a focus schedule.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="onboarding-actions">
            <button className="quiet-action" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
            {step < steps.length - 1 ? (
              <button className="primary-action" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button className="primary-action" onClick={finish}>
                Enter app <ArrowRight size={16} />
              </button>
            )}
          </div>

          <p className="auth-note">Prefer a real account? <Link to="/register">Create one</Link> or <Link to="/login">sign in</Link>.</p>
        </div>

        <aside className="onboarding-preview" aria-label="Generated plan preview">
          <div className="preview-phone">
            <div className="preview-header">
              <Target size={18} />
              <span>Today</span>
            </div>
            <h2>{profile.goal}</h2>
            <div className="preview-mission">
              <strong>42%</strong>
              <span>Roadmap momentum</span>
            </div>
            <div className="preview-list">
              <div><CalendarDays size={15} /> 9 AM - DSA practice</div>
              <div><Clock3 size={15} /> 2 PM - Revision sprint</div>
              <div><Sparkles size={15} /> 7 PM - Recovery review</div>
            </div>
          </div>
          <div className="preview-stats">
            {preview.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
