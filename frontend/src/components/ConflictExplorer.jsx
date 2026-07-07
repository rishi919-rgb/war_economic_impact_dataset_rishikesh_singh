import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Star
} from 'lucide-react';

const ConflictExplorer = ({ onEditConflict, onCreateConflict, settings }) => {
  const { user } = useAuth();
  
  // 1. Core query state
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 2. Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // 3. Filtering and Sorting States
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [minInflation, setMinInflation] = useState('');
  const [sort, setSort] = useState(settings?.defaultSort || '-startYear');

  // Watchlist State
  const [watchlist, setWatchlist] = useState([]);

  // Sync sorting setting changes
  useEffect(() => {
    if (settings?.defaultSort) {
      setSort(settings.defaultSort);
    }
  }, [settings?.defaultSort]);

  // Load watchlist on user change or load
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`watchlist_${user._id}`);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    }
  }, [user]);

  const isWatchlisted = (id) => watchlist.some(item => item._id === id);

  const handleToggleWatchlist = (conflict) => {
    if (!user) {
      alert("Please sign in to bookmark items in your watchlist.");
      return;
    }
    let updated;
    const key = `watchlist_${user._id}`;
    if (isWatchlisted(conflict._id)) {
      updated = watchlist.filter(item => item._id !== conflict._id);
      logActivity(`Removed "${conflict.conflictName}" from watchlist`);
    } else {
      const summary = {
        _id: conflict._id,
        conflictName: conflict.conflictName,
        region: conflict.region,
        warCostUsd: conflict.warCostUsd,
        inflationRate: conflict.inflationRate,
        gdpChange: conflict.gdpChange,
        primaryCountry: conflict.primaryCountry
      };
      updated = [...watchlist, summary];
      logActivity(`Added "${conflict.conflictName}" to watchlist`);
    }
    setWatchlist(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const logActivity = (action) => {
    if (!user) return;
    try {
      const storedLogs = localStorage.getItem(`logs_${user._id}`);
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      const time = new Date().toLocaleTimeString();
      const newLog = { timestamp: time, action, type: 'watchlist' };
      const updated = [newLog, ...logs].slice(0, 50);
      localStorage.setItem(`logs_${user._id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to log activity in explorer", e);
    }
  };

  // Trigger data fetch when query criteria changes
  useEffect(() => {
    fetchConflicts();
  }, [page, region, status, sort]);

  const fetchConflicts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sort,
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (region) params.region = region;
      if (status) params.status = status;
      if (minInflation) params.minInflation = Number(minInflation);

      const response = await api.get('/conflicts', { params });
      
      if (response.data && response.data.success) {
        setConflicts(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages);
          setTotalRecords(response.data.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to query conflicts:', err.message);
      setError('Failed to load conflicts records. Make sure the API is running and connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchConflicts();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setRegion('');
    setStatus('');
    setMinInflation('');
    setSort('-startYear');
    setPage(1);
    // Explicitly call fetch for state updates in next cycle
    setTimeout(fetchConflicts, 0);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      return;
    }
    try {
      const response = await api.delete(`/conflicts/${id}`);
      if (response.data && response.data.success) {
        alert('Conflict record deleted successfully.');
        fetchConflicts();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unauthorized: Only administrators are permitted to delete records.';
      alert(msg);
    }
  };

  const formatCost = (val) => {
    if (val === undefined || val === null || val === 0) return 'N/A';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Upper header action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Macroeconomic Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Showing {conflicts.length} of {totalRecords} logged global records
          </p>
        </div>
        {user && (
          <button onClick={onCreateConflict} className="btn btn-primary">
            <Plus size={18} />
            Create Record
          </button>
        )}
      </div>

      {/* Filter and search layout panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Keyword Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="search-keyword">Keyword Search</label>
            <div style={{ position: 'relative' }}>
              <input
                id="search-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Name, region, country..."
                style={{ paddingLeft: '38px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Region Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-region">Geographical Region</label>
            <select
              id="filter-region"
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
            >
              <option value="">All Regions</option>
              <option value="Middle East">Middle East</option>
              <option value="East Africa">East Africa</option>
              <option value="South Asia">South Asia</option>
              <option value="Eastern Europe">Eastern Europe</option>
              <option value="Southeast Asia">Southeast Asia</option>
              <option value="South America">South America</option>
              <option value="Central America">Central America</option>
              <option value="Global">Global</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-status">Conflict Status</label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All States</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Inflation Filter Threshold */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-inflation">Min Inflation (%)</label>
            <input
              id="filter-inflation"
              type="number"
              value={minInflation}
              onChange={(e) => setMinInflation(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>

          {/* Sorting rule dropdown */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="sort-field">Sort Metrics By</label>
            <select
              id="sort-field"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="-startYear">Start Year (Newest)</option>
              <option value="startYear">Start Year (Oldest)</option>
              <option value="-inflationRate">Inflation Rate (Highest)</option>
              <option value="gdpChange">GDP Change (Worst contraction)</option>
              <option value="-warCostUsd">War Cost (Highest)</option>
              <option value="-reconstructionCostUsd">Reconstruction (Highest)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
              <Filter size={16} />
              Query
            </button>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '10px' }} title="Reset Filters">
              <RotateCcw size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Primary Data Grid / Table */}
      {error ? (
        <div className="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(0, 242, 254, 0.15)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Filtering records...</p>
        </div>
      ) : conflicts.length === 0 ? (
        <div className="glass-panel flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
          No logged records match the specified query filters.
        </div>
      ) : (
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr>
                {user && <th style={{ width: '40px', ...(settings?.compact ? { padding: '6px 12px' } : {}) }}></th>}
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>Conflict Details</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>Region</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>Duration</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>Status</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>Inflation</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>GDP Impact</th>
                <th style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>War Cost (USD)</th>
                {user && <th style={{ textAlign: 'right', ...(settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}) }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {conflicts.map((item) => (
                <tr key={item._id} className="animate-fade-in">
                  {user && (
                    <td style={settings?.compact ? { padding: '6px 12px' } : {}}>
                      <button
                        onClick={() => handleToggleWatchlist(item)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isWatchlisted(item._id) ? 'var(--accent)' : 'var(--text-muted)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                        title={isWatchlisted(item._id) ? "Remove from Watchlist" : "Add to Watchlist"}
                      >
                        <Star size={15} fill={isWatchlisted(item._id) ? 'var(--accent)' : 'transparent'} />
                      </button>
                    </td>
                  )}
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>
                    <div style={{ fontWeight: '600', color: 'white' }}>{item.conflictName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.primaryCountry}</div>
                  </td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>{item.region}</td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>
                    {item.startYear} – {item.endYear || 'Present'}
                  </td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>
                    <span className={`badge ${item.status === 'Ongoing' ? 'badge-danger' : 'badge-success'}`} style={settings?.compact ? { fontSize: '0.6rem', padding: '1px 6px' } : {}}>
                      {item.status}
                    </span>
                  </td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: item.inflationRate >= 15 ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {item.inflationRate >= 15 ? <TrendingUp size={12} /> : null}
                      {item.inflationRate}%
                    </span>
                  </td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: item.gdpChange < 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {item.gdpChange < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {item.gdpChange}%
                    </span>
                  </td>
                  <td style={settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}}>{formatCost(item.warCostUsd)}</td>
                  {user && (
                    <td style={{ textAlign: 'right', ...(settings?.compact ? { padding: '6px 12px', fontSize: '0.85rem' } : {}) }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onEditConflict(item)}
                          className="btn btn-secondary"
                          style={{ padding: settings?.compact ? '4px' : '6px', borderRadius: '6px' }}
                          title="Edit Record"
                        >
                          <Edit2 size={12} />
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(item._id, item.conflictName)}
                            className="btn btn-danger"
                            style={{ padding: settings?.compact ? '4px' : '6px', borderRadius: '6px' }}
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pager / Pagination panel */}
      {totalPages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing page <strong>{page}</strong> of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ConflictExplorer;
