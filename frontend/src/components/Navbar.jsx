import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Database, LogIn, LogOut, User, Activity } from 'lucide-react';
import api from '../utils/api';

const Navbar = ({ currentView, onViewChange, onAuthTrigger }) => {
  const { user, logout } = useAuth();
  const [dbStatus, setDbStatus] = useState('checking');

  // Query health status on navbar render to show API status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.success && res.data.data.status === 'UP') {
          setDbStatus('UP');
        } else {
          setDbStatus('DOWN');
        }
      } catch (err) {
        setDbStatus('DOWN');
      }
    };

    checkHealth();

    let checkInterval = 30000;
    if (user) {
      try {
        const savedSettings = localStorage.getItem(`settings_${user._id}`);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.interval) checkInterval = parsed.interval * 1000;
        }
      } catch (e) {
        console.warn('Could not parse user settings in navbar', e);
      }
    }

    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="glass-panel" style={{
      margin: '16px 16px 0 16px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '12px'
    }}>
      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onViewChange('dashboard')}>
        <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: '800',
          fontSize: '1.2rem',
          background: 'linear-gradient(90deg, #ffffff, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          WAR ECON
        </span>
        <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>v1.0.0</span>
      </div>

      {/* Main navigation tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <BarChart3 size={16} />
          Dashboard
        </button>
        <button
          onClick={() => onViewChange('explorer')}
          className={`btn ${currentView === 'explorer' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Database size={16} />
          Explorer
        </button>
        {user && (
          <button
            onClick={() => onViewChange('profile')}
            className={`btn ${currentView === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <User size={16} />
            Profile
          </button>
        )}
      </div>

      {/* Right controls: health status and auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Health status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Activity size={14} style={{ color: dbStatus === 'UP' ? 'var(--success)' : 'var(--danger)' }} />
          <span>API:</span>
          {dbStatus === 'checking' && <span style={{ color: 'var(--warning)' }}>Checking...</span>}
          {dbStatus === 'UP' && <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Online</span>}
          {dbStatus === 'DOWN' && <span className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Offline</span>}
        </div>

        {/* User profile controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              onClick={() => onViewChange('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              title="View Profile Settings"
            >
              <User size={16} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontWeight: '500', textDecoration: currentView === 'profile' ? 'underline' : 'none' }}>{user.name}</span>
              <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthTrigger}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', gap: '6px' }}
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
