import React from "react";
import { Bell, CalendarClock, Flame, Sparkles, UsersRound } from "lucide-react";

const notes = [
  { icon: Sparkles, title: "Timbo moved your hard task earlier", text: "Your noon focus window has the strongest completion rate." },
  { icon: UsersRound, title: "Ananya joined your focus room", text: "She is working on system design basics." },
  { icon: Flame, title: "Momentum is still alive", text: "One focused session today keeps your 5 day flow warm." },
  { icon: CalendarClock, title: "Mock interview rescheduled", text: "Moved to a lighter evening block to reduce overload." },
];

export default function NotificationsPage() {
  return (
    <div className="premium-page narrow">
      <section className="product-hero compact">
        <div>
          <span className="soft-label"><Bell size={14} /> Notifications</span>
          <h1>Signals, not noise.</h1>
          <p>Reminders, team updates, and AI suggestions stay gentle and useful.</p>
        </div>
      </section>
      <section className="notification-list">
        {notes.map(({ icon: Icon, title, text }) => (
          <article className="product-card notification-card" key={title}>
            <Icon size={22} />
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </section>
    </div>
  );
}
