import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Brain, HeartPulse, Send, Sparkles } from "lucide-react";
import { getAdaptiveState, getCoachMessages, getSuggestions } from "../lib/adaptiveEngine";

const replies = {
  stuck: "Let us lower friction. Pick the smallest visible next action and do it for 10 minutes.",
  tired: "Tired is data, not failure. Switch to recovery mode and keep one tiny promise today.",
  behind: "Behind does not mean broken. Timbo will compress review and protect the highest-leverage tasks.",
  default: "I would choose one focused block before noon, then stop trying to win the whole day at once.",
};

export default function CoachPage() {
  const state = getAdaptiveState();
  const [messages, setMessages] = useState(getCoachMessages(state));
  const [input, setInput] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const lower = input.toLowerCase();
    const key = lower.includes("tired") ? "tired" : lower.includes("behind") ? "behind" : lower.includes("stuck") ? "stuck" : "default";
    setMessages((items) => [...items, { from: "user", text: input }, { from: "coach", text: replies[key] }]);
    setInput("");
  };

  return (
    <div className="coach-layout">
      <aside className="coach-insights">
        <div className="calm-panel">
          <span className="soft-label"><HeartPulse size={14} /> Mood</span>
          <h2>Clear, slightly resistant</h2>
          <p>Best next move: reduce the first task until it feels startable.</p>
        </div>
        <div className="calm-panel mini-stack">
          <div><strong>74%</strong><span>consistency</span></div>
          <div><strong>3</strong><span>soft resets</span></div>
        </div>
      </aside>

      <section className="chat-panel">
        <div className="screen-heading compact">
          <span className="soft-label"><Bot size={14} /> Coach</span>
          <h1>Your calm execution partner</h1>
          <p>Rule-based support that notices avoidance, overload, and momentum patterns without constant AI calls.</p>
        </div>

        <div className="chat-stream">
          {messages.map((message, index) => (
            <motion.div key={`${message.text}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`chat-bubble ${message.from}`}>
              {message.text}
            </motion.div>
          ))}
        </div>

        <form className="coach-input" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tell Timbo what feels hard..." />
          <button type="submit"><Send size={18} /></button>
        </form>
      </section>

      <aside className="coach-side">
        <div className="calm-panel">
          <span className="soft-label"><Sparkles size={14} /> Resistance Detection</span>
          <h2>Evening avoidance pattern</h2>
          <p>You usually skip evening sessions. Timbo recommends shorter review blocks after 6 PM.</p>
        </div>
        <div className="calm-panel">
          <span className="soft-label"><Brain size={14} /> Technique</span>
          <h2>Two-minute entry</h2>
          <p>Open the task, define the first visible action, and stop negotiating with the whole project.</p>
        </div>
        <div className="suggestion-list">
          {getSuggestions().map((suggestion) => <button key={suggestion}>{suggestion}</button>)}
        </div>
      </aside>
    </div>
  );
}
