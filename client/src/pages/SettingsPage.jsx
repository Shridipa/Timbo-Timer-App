import React from "react";
import { Bell, Bot, CalendarCheck, Palette, SlidersHorizontal, Volume2 } from "lucide-react";

const groups = [
  { icon: Palette, title: "Theme atmosphere", text: "Mint dark, soft light, lavender, rose, and gold accents.", action: "Customize" },
  { icon: Bell, title: "Notifications", text: "Emotionally intelligent reminders, streak nudges, and team updates.", action: "Tune" },
  { icon: CalendarCheck, title: "Calendar sync", text: "Connect focus blocks to your external schedule.", action: "Connect" },
  { icon: Bot, title: "Coach personality", text: "Choose gentle mentor, strategist, or accountability partner.", action: "Adjust" },
  { icon: Volume2, title: "Focus ambiance", text: "Rain, forest, deep room, and cinematic silence.", action: "Preview" },
  { icon: SlidersHorizontal, title: "Workload rules", text: "Set maximum intensity, recovery cadence, and reschedule style.", action: "Edit" },
];

export default function SettingsPage() {
  return (
    <div className="premium-page">
      <section className="product-hero compact">
        <div>
          <span className="soft-label"><SlidersHorizontal size={14} /> Settings</span>
          <h1>Make Timbo feel like your operating system.</h1>
          <p>Calibrate the product’s atmosphere, coaching tone, focus style, and team signals without digging through forms.</p>
        </div>
      </section>

      <section className="settings-grid">
        {groups.map(({ icon: Icon, title, text, action }) => (
          <article className="product-card setting-card" key={title}>
            <Icon size={22} />
            <div><h2>{title}</h2><p>{text}</p></div>
            <button>{action}</button>
          </article>
        ))}
      </section>
    </div>
  );
}
