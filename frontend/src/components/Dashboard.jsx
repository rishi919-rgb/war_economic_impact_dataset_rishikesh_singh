import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Globe,
  AlertTriangle,
  Award,
  Zap,
  Activity,
  Layers,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = ({ settings }) => {
  const cardClass = settings?.glow ? 'glass-panel-glow' : 'glass-panel';
  const [overview, setOverview] = useState(null);
  const [costByRegion, setCostByRegion] = useState([]);
  const [inflationByRegion, setInflationByRegion] = useState([]);
  const [extremes, setExtremes] = useState({
    highestCost: null,
    highestInflation: null,
    lowestGdp: null,
    highestReconstruction: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          overviewRes,
          costRes,
          inflationRes,
          highCostRes,
          highInflationRes,
          lowGdpRes,
          highReconstructionRes
        ] = await Promise.all([
          api.get('/conflicts/stats/overview'),
          api.get('/conflicts/stats/warcost-by-region'),
          api.get('/conflicts/stats/inflation-by-region'),
          api.get('/conflicts/stats/highest-warcost'),
          api.get('/conflicts/stats/highest-inflation'),
          api.get('/conflicts/stats/lowest-gdp'),
          api.get('/conflicts/stats/highest-reconstruction')
        ]);

        if (overviewRes.data?.success) setOverview(overviewRes.data.data);
        if (costRes.data?.success) setCostByRegion(costRes.data.data);
        if (inflationRes.data?.success) setInflationByRegion(inflationRes.data.data);

        setExtremes({
          highestCost: highCostRes.data?.success ? highCostRes.data.data : null,
          highestInflation: highInflationRes.data?.success ? highInflationRes.data.data : null,
          lowestGdp: lowGdpRes.data?.success ? lowGdpRes.data.data : null,
          highestReconstruction: highReconstructionRes.data?.success ? highReconstructionRes.data.data : null,
        });

      } catch (err) {
        console.error('Failed to query dashboard statistics:', err.message);
        setError('Error retrieving analytics dashboard records. Ensure the backend database is seeded and online.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency display safely
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(0, 242, 254, 0.15)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Analyzing aggregate datasets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert" style={{ margin: '20px 0' }}>
        <AlertTriangle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Global Overview Metrics Grid */}
      {overview && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Total Cost of Conflicts */}
          <div className={cardClass} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total War Cost</span>
              <DollarSign size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{formatCurrency(overview.totalWarCostUsd)}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Direct military expenditure</span>
          </div>

          {/* Card 2: Avg Inflation Rate */}
          <div className={cardClass} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Avg Inflation Rate</span>
              <TrendingUp size={20} style={{ color: 'var(--secondary)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{overview.averageInflationRate}%</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Consumer price index shift</span>
          </div>

          {/* Card 3: Avg GDP Contraction */}
          <div className={cardClass} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Avg GDP Change</span>
              <ArrowDownRight size={20} style={{ color: 'var(--danger)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: overview.averageGDPChange < 0 ? '#ff4d4d' : '#34d399' }}>
              {overview.averageGDPChange}%
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Economic contraction index</span>
          </div>

          {/* Card 4: Total conflicts and status */}
          <div className={cardClass} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Datapoints</span>
              <Globe size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{overview.totalConflicts}</h2>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', marginTop: '4px' }}>
              <span style={{ color: 'var(--success)' }}>● {overview.resolvedConflicts} Resolved</span>
              <span style={{ color: 'var(--warning)' }}>● {overview.ongoingConflicts} Active</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Graphical Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginTop: '8px'
      }}>
        {/* Chart A: Regional Cost Distribution (BarChart) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Total Cost of War by Geographical Region</h3>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {costByRegion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costByRegion} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="region" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    formatter={(v) => [formatCurrency(v), 'Total Cost (USD)']}
                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="totalWarCostUsd" name="War Cost (USD)" fill="url(#colorCost)" radius={[4, 4, 0, 0]}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>No region data available.</div>
            )}
          </div>
        </div>

        {/* Chart B: Regional Inflation Profile (LineChart) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={18} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Regional Inflation Indices Overview</h3>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {inflationByRegion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inflationByRegion} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="region" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    formatter={(v) => [`${v}%`, 'Inflation Rate']}
                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="averageInflationRate" name="Avg Inflation" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="highestInflationRate" name="Max Inflation" stroke="var(--danger)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>No inflation data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Extreme Value Spotlight Grid */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Award size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '1.2rem' }}>Spotlight: Macroeconomic Extreme Case Studies</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {/* Spotlight 1: Highest War Cost */}
          {extremes.highestCost && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Zap size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Highest War Cost</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{extremes.highestCost.conflictName}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Location: <strong>{extremes.highestCost.primaryCountry}</strong> ({extremes.highestCost.startYear} - {extremes.highestCost.endYear})
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost (USD)</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(extremes.highestCost.warCostUsd)}</span>
              </div>
            </div>
          )}

          {/* Spotlight 2: Highest Inflation */}
          {extremes.highestInflation && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Zap size={16} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Highest Inflation</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{extremes.highestInflation.conflictName}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Location: <strong>{extremes.highestInflation.primaryCountry}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Rate</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--warning)' }}>{extremes.highestInflation.inflationRate}%</span>
              </div>
            </div>
          )}

          {/* Spotlight 3: Highest GDP Loss */}
          {extremes.lowestGdp && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Zap size={16} style={{ color: 'var(--danger)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Worst GDP Impact</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{extremes.lowestGdp.conflictName}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Location: <strong>{extremes.lowestGdp.primaryCountry}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contraction</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--danger)' }}>{extremes.lowestGdp.gdpChange}%</span>
              </div>
            </div>
          )}

          {/* Spotlight 4: Highest Reconstruction Cost */}
          {extremes.highestReconstruction && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Zap size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Max Reconstruction</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{extremes.highestReconstruction.conflictName}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Location: <strong>{extremes.highestReconstruction.primaryCountry}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Rebuild</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent)' }}>{formatCurrency(extremes.highestReconstruction.reconstructionCostUsd)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
