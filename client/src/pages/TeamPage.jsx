import React from "react";
import { Crown, Mic2, Radio, UsersRound } from "lucide-react";

const members = [
  ["Rohit Sharma", "Admin", "85%", "On track"],
  ["Ananya Iyer", "Member", "72%", "On track"],
  ["Karan Patel", "Member", "45%", "At risk"],
  ["You", "Owner", "84%", "In focus"],
];

export default function TeamPage() {
  return (
    <div className="premium-page team-page">
      <section className="product-hero compact">
        <div>
          <span className="soft-label"><UsersRound size={14} /> Team Workspace</span>
          <h1>Shared momentum without the corporate noise.</h1>
          <p>Study circles, accountability groups, and shared roadmaps stay calm, visible, and emotionally supportive.</p>
        </div>
        <button className="hero-action"><UsersRound size={18} /> Invite member</button>
      </section>

      <section className="team-layout">
        <div className="product-card team-room">
          <div className="card-title-row"><div><span>Live focus room</span><h2>FAANG Prep Circle</h2></div><Radio size={22} /></div>
          <div className="voice-room"><Mic2 size={30} /><strong>4 members focusing</strong><span>42 minutes remaining</span></div>
          <div className="shared-goal"><Crown size={18} /><span>Shared goal: finish graph patterns by Friday</span></div>
        </div>
        <div className="product-card member-table">
          <div className="card-title-row"><div><span>Members</span><h2>Accountability state</h2></div></div>
          {members.map(([name, role, progress, status]) => (
            <div className="member-row" key={name}>
              <div className="avatar">{name[0]}</div>
              <div><strong>{name}</strong><span>{role}</span></div>
              <div className="member-progress"><i style={{ width: progress }} /></div>
              <em className={status === "At risk" ? "risk" : ""}>{status}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
