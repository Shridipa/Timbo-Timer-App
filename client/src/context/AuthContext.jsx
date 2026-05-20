import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const createDemoUser = (profile = {}) => ({
  _id: 'demo-user',
  name: 'Timbo Demo',
  email: 'demo@timbo.local',
  level: profile.level === 'Advanced' ? 5 : profile.level === 'Intermediate' ? 3 : 1,
  points: 140,
  momentumScore: 82,
  onboardingProfile: profile,
  demo: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        const demoProfile = localStorage.getItem('timbo_demo_profile');
        setUser(demoProfile ? createDemoUser(JSON.parse(demoProfile)) : null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('timbo_token', data.token);
    }
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.token) {
      localStorage.setItem('timbo_token', data.token);
    }
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('timbo_token');
    localStorage.removeItem('timbo_demo_profile');
    setUser(null);
  };

  const enterDemo = (profile) => {
    localStorage.setItem('timbo_demo_profile', JSON.stringify(profile));
    const demoUser = createDemoUser(profile);
    setUser(demoUser);
    return demoUser;
  };

  const reloadUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reloadUser, enterDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
