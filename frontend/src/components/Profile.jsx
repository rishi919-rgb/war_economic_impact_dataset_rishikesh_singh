import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Sliders, 
  Star, 
  History, 
  Download, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye, 
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const Profile = ({ onSettingsChange, onViewConflict }) => {
  const { user, token, logout } = useAuth();
  
  // Account Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'user');
  
  // Status feedback
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  
  // Watchlist State
  const [watchlist, setWatchlist] = useState([]);
  
  // Activity Logs State
  const [logs, setLogs] = useState([]);
  
  // Preferences State
  const [glowTheme, setGlowTheme] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [defaultSort, setDefaultSort] = useState('-startYear');
  const [healthInterval, setHealthInterval] = useState(30);

  // Avatar Options
  const avatars = [
    { emoji: '🕵️', label: 'Analyst', bg: '#00f2fe' },
    { emoji: '📈', label: 'Strategist', bg: '#4facfe' },
    { emoji: '🏛️', label: 'Diplomat', bg: '#d4af37' },
    { emoji: '🌍', label: 'Observer', bg: '#10b981' },
    { emoji: '🎖️', label: 'General', bg: '#ef4444' }
  ];
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);

  // Load Watchlist, Logs, and Preferences from localStorage
  useEffect(() => {
    if (user) {
      // 1. Watchlist
      const storedWatchlist = localStorage.getItem(`watchlist_${user._id}`);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }

      // 2. Logs
      const storedLogs = localStorage.getItem(`logs_${user._id}`);
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      } else {
        const defaultLogs = [
          { timestamp: new Date().toLocaleTimeString(), action: 'Profile loaded', type: 'info' }
        ];
        setLogs(defaultLogs);
        localStorage.setItem(`logs_${user._id}`, JSON.stringify(defaultLogs));
      }

      // 3. Settings
      const storedSettings = localStorage.getItem(`settings_${user._id}`);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setGlowTheme(parsed.glow ?? true);
        setCompactView(parsed.compact ?? false);
        setDefaultSort(parsed.defaultSort ?? '-startYear');
        setHealthInterval(parsed.interval ?? 30);
        setSelectedAvatarIdx(parsed.avatarIdx ?? 0);
      }
    }
  }, [user]);

  // Synchronize settings with parent and localStorage
  const saveSettings = (newSettings) => {
    if (!user) return;
    const settings = {
      glow: glowTheme,
      compact: compactView,
      defaultSort,
      interval: healthInterval,
      avatarIdx: selectedAvatarIdx,
      ...newSettings
    };
    localStorage.setItem(`settings_${user._id}`, JSON.stringify(settings));
    
    // Dispatch to parent components
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  const handleToggleGlow = () => {
    const newVal = !glowTheme;
    setGlowTheme(newVal);
    saveSettings({ glow: newVal });
    addActivityLog('Toggled dashboard glowing borders', 'preference');
  };

  const handleToggleCompact = () => {
    const newVal = !compactView;
    setCompactView(newVal);
    saveSettings({ compact: newVal });
    addActivityLog('Toggled compact explorer mode', 'preference');
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setDefaultSort(val);
    saveSettings({ defaultSort: val });
    addActivityLog(`Changed default registry sorting to: ${val}`, 'preference');
  };

  const handleIntervalChange = (e) => {
    const val = Number(e.target.value);
    setHealthInterval(val);
    saveSettings({ interval: val });
    addActivityLog(`Adjusted API health check interval to ${val}s`, 'preference');
  };

  const handleSelectAvatar = (idx) => {
    setSelectedAvatarIdx(idx);
    saveSettings({ avatarIdx: idx });
    addActivityLog(`Selected profile avatar: ${avatars[idx].emoji} ${avatars[idx].label}`, 'profile');
  };

  // Helper to add activity logs
  const addActivityLog = (action, type = 'info') => {
    if (!user) return;
    const time = new Date().toLocaleTimeString();
    const newLog = { timestamp: time, action, type };
    const updated = [newLog, ...logs].slice(0, 50); // limit to 50 logs
    setLogs(updated);
    localStorage.setItem(`logs_${user._id}`, JSON.stringify(updated));
  };

  // Profile Form submit
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    if (password && password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = { name, email, role };
      if (password) payload.password = password;

      const response = await api.put('/auth/update', payload);

      if (response.data && response.data.success) {
        setFormSuccess('Profile details successfully updated!');
        setPassword('');
        setConfirmPassword('');
        
        // Update user state dynamically (saves role changes and updates details)
        // By saving details and triggering auth storage updates
        const updatedUser = response.data.data.user;
        const updatedToken = response.data.data.token;
        if (updatedToken) {
          localStorage.setItem('jwt_token', updatedToken);
        }
        
        addActivityLog('Updated account credentials and details', 'security');
        
        // Soft reload user profile details
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error updating user profile details.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Watchlist removal
  const handleRemoveFromWatchlist = (id, name) => {
    const updated = watchlist.filter(item => item._id !== id);
    setWatchlist(updated);
    localStorage.setItem(`watchlist_${user._id}`, JSON.stringify(updated));
    addActivityLog(`Removed "${name}" from watchlist`, 'watchlist');
  };

  // Watchlist clear
  const handleClearWatchlist = () => {
    if (window.confirm('Clear all items from your watchlist?')) {
      setWatchlist([]);
      localStorage.setItem(`watchlist_${user._id}`, JSON.stringify([]));
      addActivityLog('Cleared conflict watchlist', 'watchlist');
    }
  };

  // Logs clear
  const handleClearLogs = () => {
    const cleared = [{ timestamp: new Date().toLocaleTimeString(), action: 'Activity logs cleared', type: 'info' }];
    setLogs(cleared);
    localStorage.setItem(`logs_${user._id}`, JSON.stringify(cleared));
  };

  // Database Export
  const [exportLoading, setExportLoading] = useState(false);
  const handleExportRegistry = async () => {
    setExportLoading(true);
    addActivityLog('Initiated registry database download', 'export');
    try {
      const response = await api.get('/conflicts', { params: { limit: 1000 } });
      if (response.data && response.data.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `war_economic_impact_registry_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error('Failed to export conflicts:', err);
      alert('Error fetching conflicts for export. Ensure the backend database is reachable.');
    } finally {
      setExportLoading(false);
    }
  };

  // Watchlist summary math
  const getWatchlistStats = () => {
    if (watchlist.length === 0) return { totalCost: 0, avgInflation: 0, avgGdp: 0 };
    const totalCost = watchlist.reduce((acc, item) => acc + (item.warCostUsd || 0), 0);
    const avgInflation = (watchlist.reduce((acc, item) => acc + (item.inflationRate || 0), 0) / watchlist.length).toFixed(1);
    const avgGdp = (watchlist.reduce((acc, item) => acc + (item.gdpChange || 0), 0) / watchlist.length).toFixed(1);
    return { totalCost, avgInflation, avgGdp };
  };

  const { totalCost, avgInflation, avgGdp } = getWatchlistStats();

  const formatCost = (val) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Hero Card */}
      <div className="glass-panel-glow" style={{ 
        padding: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dynamic Glowing background flare */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${avatars[selectedAvatarIdx].bg} 0%, #000000 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)',
          border: `2px solid ${avatars[selectedAvatarIdx].bg}`
        }}>
          {avatars[selectedAvatarIdx].emoji}
        </div>

        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{user?.name}</h2>
            <span className="badge badge-info">{user?.role}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Mail size={14} /> {user?.email}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
            Account ID: <code style={{ color: 'var(--primary)' }}>{user?._id}</code>
          </p>
        </div>

        {/* Avatar Select Row */}
        <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Select Avatar Designation</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {avatars.map((av, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelectAvatar(idx)}
                style={{
                  background: selectedAvatarIdx === idx ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: selectedAvatarIdx === idx ? `1px solid ${av.bg}` : '1px solid transparent',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  transition: 'var(--transition-fast)'
                }}
                title={av.label}
              >
                {av.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Content Split Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Left Side: Account Update Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Account Profile Settings</h3>
          </div>

          {formSuccess && (
            <div className="alert" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399' }}>
              <CheckCircle size={16} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="alert">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Test helper - allows toggling roles to see admin feature logs */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Access Privilege (Testing Toggle)</label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                >
                  <option value="user">User (Read & Edit)</option>
                  <option value="admin">Administrator (Full CRUD + Delete permission)</option>
                </select>
                <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>New Password (Leave blank to keep current)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ paddingLeft: '38px' }}
                />
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {password && (
              <div className="form-group" style={{ margin: 0 }}>
                <label>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Match password"
                    style={{ paddingLeft: '38px' }}
                  />
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ marginTop: '6px' }}>
              {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Right Side: Interactive Preferences & Settings */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sliders size={18} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>UX & Session Preferences</h3>
          </div>

          {/* Toggle 1: Glow Borders */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Dashboard Glowing Cards</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Add glowing border and drop shadows to KPI widgets</div>
            </div>
            <button 
              onClick={handleToggleGlow} 
              className={`btn ${glowTheme ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', minWidth: '80px' }}
            >
              {glowTheme ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Toggle 2: Compact Explorer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Compact Explorer Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reduce rows spacing in registry table list</div>
            </div>
            <button 
              onClick={handleToggleCompact} 
              className={`btn ${compactView ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', minWidth: '80px' }}
            >
              {compactView ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Selector 1: Default Sort */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Default Sort Criteria</label>
            <select value={defaultSort} onChange={handleSortChange}>
              <option value="-startYear">Start Year (Newest)</option>
              <option value="startYear">Start Year (Oldest)</option>
              <option value="-inflationRate">Inflation Rate (Highest)</option>
              <option value="gdpChange">GDP Change (Worst Contraction)</option>
              <option value="-warCostUsd">War Cost (Highest)</option>
            </select>
          </div>

          {/* Selector 2: Health check frequency */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>API Connection Health Check Interval</label>
            <select value={healthInterval} onChange={handleIntervalChange}>
              <option value={10}>Every 10 seconds (Frequent)</option>
              <option value={30}>Every 30 seconds (Default)</option>
              <option value={60}>Every 60 seconds (Relaxed)</option>
            </select>
          </div>

          {/* Export DB Panel */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(0, 242, 254, 0.1)', background: 'rgba(0, 242, 254, 0.02)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Registry Administration
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Download all registered conflict economic metrics as a standardized JSON database file.
            </p>
            <button 
              onClick={handleExportRegistry} 
              disabled={exportLoading} 
              className="btn btn-secondary" 
              style={{ alignSelf: 'start', fontSize: '0.8rem', padding: '6px 12px', borderColor: 'rgba(0, 242, 254, 0.2)' }}
            >
              {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Export Registry Dataset
            </button>
          </div>
        </div>
      </div>

      {/* 3. Watchlist Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>My Bookmarked Watchlist</h3>
          </div>
          {watchlist.length > 0 && (
            <button onClick={handleClearWatchlist} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }}>
              <Trash2 size={14} />
              Clear Watchlist
            </button>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <Star size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontSize: '0.9rem' }}>No bookmarked conflicts. Star records inside the Explorer registry to track them here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Watchlist aggregate stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>WATCHED ECONOMIC COST</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCost(totalCost)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AVG INFLATION RATE</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{avgInflation}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AVG GDP CHANGE</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: avgGdp < 0 ? 'var(--danger)' : 'var(--success)' }}>{avgGdp}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL TRACKED</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{watchlist.length} items</div>
              </div>
            </div>

            {/* List */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Conflict</th>
                    <th>Region</th>
                    <th>War Cost</th>
                    <th>Inflation</th>
                    <th>GDP Impact</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map(item => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: '600' }}>{item.conflictName}</td>
                      <td>{item.region}</td>
                      <td>{formatCost(item.warCostUsd)}</td>
                      <td style={{ color: item.inflationRate >= 15 ? 'var(--danger)' : 'inherit' }}>{item.inflationRate}%</td>
                      <td style={{ color: item.gdpChange < 0 ? 'var(--danger)' : 'var(--success)' }}>{item.gdpChange}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => onViewConflict(item._id)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            <ExternalLink size={12} /> View
                          </button>
                          <button 
                            onClick={() => handleRemoveFromWatchlist(item._id, item.conflictName)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                            title="Remove from Watchlist"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Activity Logs Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Session Activity History</h3>
          </div>
          <button onClick={handleClearLogs} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Clear Logs
          </button>
        </div>

        <div style={{ 
          maxHeight: '180px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          padding: '10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.8rem'
        }}>
          {logs.map((lg, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', color: lg.type === 'watchlist' ? 'var(--accent)' : lg.type === 'security' ? 'var(--success)' : 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>[{lg.timestamp}]</span>
              <span style={{ fontWeight: '500' }}>{lg.action}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Profile;
