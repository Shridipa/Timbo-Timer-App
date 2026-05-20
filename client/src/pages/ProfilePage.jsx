import React from "react";
import { Award, Flame, Sparkles, Star } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="premium-page">
      <section className="profile-hero product-card">
        <div className="profile-avatar">A</div>
        <div>
          <span className="soft-label"><Sparkles size={14} /> Productivity Aura</span>
          <h1>Aryan Verma</h1>
          <p>Calm Executor - building FAANG readiness with sustainable daily momentum.</p>
        </div>
      </section>
      <section className="product-grid three">
        {[
          [Flame, "12", "focus streak"],
          [Award, "84", "momentum score"],
          [Star, "Pro", "subscription"],
        ].map(([Icon, value, label]) => (
          <article className="product-card profile-stat" key={label}><Icon size={24} /><strong>{value}</strong><span>{label}</span></article>
        ))}
      </section>
    </div>
  );
}
