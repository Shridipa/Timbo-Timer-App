import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // Add external fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Reveal on scroll
    const reveals = document.querySelectorAll('.lp-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    
    reveals.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      document.head.removeChild(link);
    };
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <div className="landing-page-container">
      <div className="lp-grid-bg"></div>
      
      {/* NAV */}
      <nav className="lp-nav">
        <Link to="/" className="lp-logo">Timbo<span>AI</span></Link>
        <ul className="lp-nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#premium">Premium</a></li>
          <li><Link to="/register" className="lp-nav-cta">Get Started Free</Link></li>
        </ul>
      </nav>
      
      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-orb lp-orb1"></div>
        <div className="lp-hero-orb lp-orb2"></div>
        <div className="lp-hero-orb lp-orb3"></div>
        <div>
          <div className="lp-badge">Your Personal Strategic Operations Center</div>
          <h1>
            Stop Managing Tasks.<br />
            <span className="line2">Start Executing Life.</span>
          </h1>
          <p className="lp-hero-sub">
            Timbo AI is an autonomous life management platform that takes your biggest goals, 
            builds a phase-by-phase roadmap, schedules your deep work, and coaches you with 
            real accountability — not just reminders.
          </p>
          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn-primary">
              Begin Your Roadmap
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#features" className="lp-btn-ghost">Explore Features</a>
          </div>
          <div className="lp-hero-stats">
            <div className="lp-stat">
              <div className="lp-stat-num">6<span>×</span></div>
              <div className="lp-stat-label">More Goals Completed</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">87<span>%</span></div>
              <div className="lp-stat-label">Average Focus Rate</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">24<span>/7</span></div>
              <div className="lp-stat-label">AI Accountability</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* HUD PREVIEW */}
      <div className="lp-hud-preview lp-reveal">
        <div className="lp-hud-card">
          <div className="lp-hud-header">
            <div className="lp-hud-dots">
              <div className="lp-hud-dot"></div>
              <div className="lp-hud-dot"></div>
              <div className="lp-hud-dot"></div>
            </div>
            <div className="lp-hud-title">LifeOS Dashboard — Day 47 of 180</div>
          </div>
          <div className="lp-hud-grid">
            <div className="lp-hud-widget">
              <div className="lp-widget-label">Execution Probability</div>
              <div className="lp-widget-value green">94%</div>
              <div className="lp-widget-bar"><div className="lp-widget-fill" style={{width: '94%'}}></div></div>
            </div>
            <div className="lp-hud-widget">
              <div className="lp-widget-label">Deep Work Today</div>
              <div className="lp-widget-value">4.2 hrs</div>
              <div className="lp-widget-bar"><div className="lp-widget-fill" style={{width: '70%', background: 'linear-gradient(90deg, var(--accent2), var(--accent))'}}></div></div>
            </div>
            <div className="lp-hud-widget">
              <div className="lp-widget-label">Burnout Risk</div>
              <div className="lp-widget-value blue">LOW</div>
              <div className="lp-widget-bar"><div className="lp-widget-fill" style={{width: '18%', background: 'linear-gradient(90deg, var(--accent), #28c840)'}}></div></div>
            </div>
          </div>
        </div>
      </div>
      
      <hr className="lp-divider" />
      
      {/* HOW IT WORKS */}
      <div className="lp-how lp-reveal" id="how">
        <div className="lp-how-header">
          <div className="lp-section-tag">The Loop</div>
          <div className="lp-section-title">Three steps to<br />autonomous execution</div>
        </div>
        <div className="lp-steps">
          <div className="lp-step lp-reveal">
            <div className="lp-step-num">Step 01</div>
            <div className="lp-step-icon">🎯</div>
            <h3>Define Your Mission</h3>
            <p>Give the AI your biggest goal, your deadline, and how many hours per day you can commit. It calculates everything — including your burnout threshold.</p>
          </div>
          <div className="lp-step lp-reveal">
            <div className="lp-step-num">Step 02</div>
            <div className="lp-step-icon">🗺️</div>
            <h3>AI Builds Your Roadmap</h3>
            <p>The Strategy Engine breaks your goal into distinct phases, milestones, and daily tasks — then auto-schedules them into your calendar intelligently.</p>
          </div>
          <div className="lp-step lp-reveal">
            <div className="lp-step-num">Step 03</div>
            <div className="lp-step-icon">⚡</div>
            <h3>Execute & Be Held Accountable</h3>
            <p>Work in the Focus Arena, and if you try to skip — the AI appraises your excuse using CBT patterns and tells you if it's valid or just procrastination.</p>
          </div>
        </div>
      </div>
      
      <hr className="lp-divider" />
      
      {/* FEATURES */}
      <div className="lp-features lp-reveal" id="features">
        <div className="lp-features-header">
          <div>
            <div className="lp-section-tag">Core Platform</div>
            <div className="lp-section-title">Every tool an<br />elite performer needs</div>
          </div>
          <p className="lp-section-sub">Seven interconnected modules that talk to each other — not isolated apps that you have to manually sync.</p>
        </div>
        <div className="lp-feature-cards">
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">🗺️</span>
            <h3>Roadmap Engine</h3>
            <p>AI breaks any massive life goal into a phase-by-phase, milestone-driven plan with execution probability scores.</p>
          </div>
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">🖥️</span>
            <h3>Command Dashboard</h3>
            <p>Your daily HUD. AI-generated morning brief, streak tracking, and gamification to keep momentum alive.</p>
          </div>
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">📅</span>
            <h3>AI Auto-Scheduler</h3>
            <p>Define your deep work windows. The AI fills them with the right tasks — no manual drag-and-drop required.</p>
          </div>
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">🔥</span>
            <h3>Focus Arena</h3>
            <p>Immersive Pomodoro-style timers that track interruptions and calculate your true completion rate and focus score.</p>
          </div>
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">🤖</span>
            <h3>AI Coach</h3>
            <p>Reviews your distraction logs, your skip-excuses, and your consistency — then delivers personalized tough-love corrections.</p>
          </div>
          <div className="lp-feat-card lp-reveal">
            <span className="lp-feat-icon">📊</span>
            <h3>Analytics Center</h3>
            <p>Beautiful charts showing deep work vs recovery ratios, weekly performance, and progress toward your master goal.</p>
          </div>
        </div>
      </div>
      
      <hr className="lp-divider" />
      
      {/* PREMIUM */}
      <div className="lp-premium lp-reveal" id="premium">
        <div className="lp-premium-wrap">
          <div className="lp-premium-header">
            <div>
              <div className="lp-section-tag">Pro Tier</div>
              <div className="lp-section-title">For elite performers<br />who want zero friction</div>
              <p className="lp-section-sub" style={{marginTop: '12px'}}>The next level of autonomous life management is on its way.</p>
            </div>
            <div className="lp-coming-soon-badge">🔒 Coming Soon</div>
          </div>
          <div className="lp-premium-features">
            <div className="lp-prem-feat lp-reveal">
              <div className="lp-prem-feat-icon">📆</div>
              <div className="lp-prem-feat-text">
                <h4>Two-Way Calendar Sync</h4>
                <p>Connects to your Google Calendar and Outlook. The AI reads your real schedule and weaves deep-work sessions into the empty gaps — no double-booking.</p>
              </div>
            </div>
            <div className="lp-prem-feat lp-reveal">
              <div className="lp-prem-feat-icon">🎙️</div>
              <div className="lp-prem-feat-text">
                <h4>Advanced Voice Coaching</h4>
                <p>Two-way voice conversations with your AI coach. Talk through mental blocks, anxiety, and resistance before a deep-work session — like a real coach.</p>
              </div>
            </div>
            <div className="lp-prem-feat lp-reveal">
              <div className="lp-prem-feat-icon">♾️</div>
              <div className="lp-prem-feat-text">
                <h4>Unlimited Concurrent Strategies</h4>
                <p>Run parallel roadmaps — Career, Fitness, Financial Independence — and the AI balances scheduling across all of them without causing burnout.</p>
              </div>
            </div>
            <div className="lp-prem-feat lp-reveal">
              <div className="lp-prem-feat-icon">⌚</div>
              <div className="lp-prem-feat-text">
                <h4>Wearable Health Integration</h4>
                <p>Syncs with Apple Health, Oura Ring, or Whoop. Bad sleep last night? The AI automatically adjusts your day — swapping deep work for lighter tasks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* REGISTER */}
      <section className="lp-register" id="register">
        <div className="lp-register-card lp-reveal">
          <div className="lp-badge" style={{marginBottom: '24px'}}>Free to Start — No Credit Card</div>
          <h2>Your biggest goal<br />starts <em style={{color: 'var(--accent)', fontStyle: 'normal'}}>today</em>.</h2>
          <p>Join thousands of people who stopped drowning in to-do lists and started running their lives like a Strategic Operations Center.</p>
          <div className="lp-register-form">
            <input ref={inputRef} type="email" className="lp-register-input" placeholder="Enter your email address" />
            <button onClick={handleCreateAccount} className="lp-btn-primary" style={{whiteSpace: 'nowrap'}}>
              Create Account
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <p className="lp-register-note">Free forever on one goal. No spam, ever. Upgrade when you're ready.</p>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="lp-footer">
        <Link to="/" className="lp-logo">Timbo<span>AI</span></Link>
        <ul className="lp-footer-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#premium">Premium</a></li>
          <li><Link to="/register">Sign Up</Link></li>
        </ul>
        <div className="lp-footer-copy">© 2026 TimboAI. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
