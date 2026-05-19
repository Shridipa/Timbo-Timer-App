import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Loader2, Zap, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success('Workspace initialized successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Strategist Name', type: 'text', icon: User, value: name, onChange: setName, placeholder: 'John Doe' },
    { id: 'email', label: 'Email Coordinates', type: 'email', icon: Mail, value: email, onChange: setEmail, placeholder: 'you@timbo.ai' },
    { id: 'password', label: 'Security Key', type: 'password', icon: Lock, value: password, onChange: setPassword, placeholder: '••••••••' },
  ];

  return (
    <div style={{ fontFamily: "'Syne', sans-serif" }} className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080c10] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .timboi-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.3s ease;
        }
        .timboi-input:focus {
          background: rgba(0, 255, 180, 0.04);
          border-color: rgba(0, 255, 180, 0.4);
          box-shadow: 0 0 0 3px rgba(0, 255, 180, 0.08), inset 0 1px 0 rgba(0, 255, 180, 0.05);
          outline: none;
        }
        .timboi-input::placeholder { color: rgba(255,255,255,0.2); }

        .btn-primary {
          background: linear-gradient(135deg, #00ffb4 0%, #00d4ff 100%);
          color: #050c10;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #00d4ff 0%, #00ffb4 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0, 255, 180, 0.35); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary > * { position: relative; z-index: 1; }

        .glass-card {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,180,0.4), transparent);
          animation: scan 5s ease-in-out infinite;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .badge-pill {
          background: rgba(0, 212, 255, 0.08);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .label-text {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
        }

        .step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(0, 255, 180, 0.3);
        }
        .step-dot.active { background: #00ffb4; box-shadow: 0 0 8px rgba(0,255,180,0.5); }
      `}</style>

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 0.9, 1.1, 1], x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,140,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 0.95, 1], x: [0, -30, 20, 0], y: [0, 25, -30, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,180,255,0.10) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.03) 0%, transparent 70%)'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '100% 80px',
        }} />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-[420px] mx-4 rounded-2xl z-10 relative overflow-hidden"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
      >
        {/* Scan line */}
        <div className="scan-line" />

        {/* Top accent bar — cyan tint for register */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #00d4ff 40%, #00ffb4 70%, transparent 100%)' }} />

        {/* Corner markers */}
        {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'], ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r']].map(([pos, borders], i) => (
          <div key={i} className={`absolute ${pos} w-3 h-3 ${borders}`} style={{ borderColor: 'rgba(0,212,255,0.3)' }} />
        ))}

        <div className="p-8 pt-10">
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-5">
              <motion.div
                initial={{ scale: 0.8, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #00ffb4)',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.3)'
                }}
              >
                <Zap className="w-5 h-5 text-[#050c10]" strokeWidth={2.5} />
              </motion.div>
              <div className="badge-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse inline-block" />
                INITIALIZING CORE
              </div>
            </div>

            <h1 className="text-[2rem] font-extrabold leading-none tracking-tight mb-2"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
              Create Account
            </h1>
            <p className="label-text">Initialize your AI operating system</p>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-1.5 mb-6">
            {[true, false, false].map((active, i) => (
              <div key={i} className="step-dot" style={{
                background: active ? '#00ffb4' : 'rgba(255,255,255,0.1)',
                boxShadow: active ? '0 0 8px rgba(0,255,180,0.5)' : 'none'
              }} />
            ))}
            <span className="label-text ml-2">Step 1 of 1</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ id, label, type, icon: Icon, value, onChange, placeholder }, idx) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.07 }}
              >
                <label className="label-text block mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{
                    color: focusedField === id ? '#00ffb4' : 'rgba(255,255,255,0.25)',
                    transition: 'color 0.3s'
                  }} />
                  <input
                    type={type}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocusedField(id)}
                    onBlur={() => setFocusedField(null)}
                    className="timboi-input w-full rounded-xl py-3.5 pl-11 pr-4 text-white text-sm"
                    placeholder={placeholder}
                  />
                </div>
              </motion.div>
            ))}

            {/* Password strength hint */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i <= Math.min(Math.floor(password.length / 3), 4)
                        ? i <= 1 ? '#ff5555' : i <= 2 ? '#ffaa00' : i <= 3 ? '#00d4ff' : '#00ffb4'
                        : 'rgba(255,255,255,0.07)'
                    }} />
                ))}
                <span className="label-text" style={{ whiteSpace: 'nowrap' }}>
                  {password.length < 4 ? 'WEAK' : password.length < 7 ? 'FAIR' : password.length < 10 ? 'GOOD' : 'STRONG'}
                </span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span style={{ fontSize: '0.9rem', letterSpacing: '0.04em' }}>Activate Operating System</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              ALREADY REGISTERED?{' '}
            </span>
            <Link to="/login"
              className="font-bold transition-colors"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#00d4ff',
                letterSpacing: '0.05em',
              }}
            >
              ACCESS CORE →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
