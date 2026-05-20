import React from "react";
import { Bot, Check, Crown, LineChart, Palette, UsersRound } from "lucide-react";

const perks = [
  [Bot, "Advanced AI coach", "Deeper resistance analysis and weekly strategy reviews."],
  [LineChart, "Deep analytics", "Burnout prediction, focus trends, and completion intelligence."],
  [UsersRound, "Collaborative focus rooms", "Shared roadmaps, team calendars, and accountability circles."],
  [Palette, "Premium themes", "Cinematic atmospheres for different energy states."],
];

export default function PremiumPage() {
  return (
    <div className="premium-page premium-upgrade">
      <section className="product-hero premium-hero">
        <div>
          <span className="soft-label"><Crown size={14} /> Timbo Pro</span>
          <h1>Upgrade from planning to adaptive execution.</h1>
          <p>Unlock deeper coaching, collaborative rooms, unlimited roadmaps, and advanced behavioral intelligence.</p>
          <button className="hero-action"><Crown size={18} /> Start Pro</button>
        </div>
        <div className="price-card"><span>Timbo Pro</span><strong>$8</strong><small>/month</small><p>Built for serious students, creators, and teams.</p></div>
      </section>
      <section className="product-grid two">
        {perks.map(([Icon, title, text]) => (
          <article className="product-card" key={title}><Icon size={24} /><h2>{title}</h2><p>{text}</p><span className="included"><Check size={15} /> Included</span></article>
        ))}
      </section>
    </div>
  );
}
