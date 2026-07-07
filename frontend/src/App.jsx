import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ConflictExplorer from './components/ConflictExplorer';
import ConflictModal from './components/ConflictModal';
import Profile from './components/Profile';
import api from './utils/api';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [explorerRefreshKey, setExplorerRefreshKey] = useState(0);

  // Settings State mapped from local storage
  const [userSettings, setUserSettings] = useState({
    glow: true,
    compact: false,
    defaultSort: '-startYear',
    interval: 30
  });

  // Sync settings when user loads
  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(`settings_${user._id}`);
        if (stored) {
          setUserSettings(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load user settings", e);
      }
    }
  }, [user]);

  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 242, 254, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: '500' }}>
          Loading user profile session...
        </p>
      </div>
    );
  }

  // Handle switching views
  const handleViewChange = (view) => {
    setCurrentView(view);
    setShowAuthModal(false);
  };

  // Open modal for editing
  const handleEditConflict = (conflict) => {
    setSelectedConflict(conflict);
    setShowModal(true);
  };

  // Open modal for creating
  const handleCreateConflict = () => {
    setSelectedConflict(null);
    setShowModal(true);
  };

  // Open modal for viewing watchlist item
  const handleViewConflict = async (id) => {
    try {
      const res = await api.get(`/conflicts/${id}`);
      if (res.data && res.data.success) {
        setSelectedConflict(res.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Could not fetch conflict details", err);
      alert("Error loading conflict record details.");
    }
  };

  // Callback on successful modal save
  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedConflict(null);
    setExplorerRefreshKey((k) => k + 1); // Trigger refresh
  };

  return (
    <div className="app-container">
      {/* Central Navigation Header */}
      <Navbar
        currentView={showAuthModal ? 'auth' : currentView}
        onViewChange={handleViewChange}
        onAuthTrigger={() => setShowAuthModal(true)}
      />

      <main className="main-content">
        {showAuthModal ? (
          <Auth onSuccess={() => setShowAuthModal(false)} />
        ) : (
          <div className="animate-fade-in">
            {currentView === 'dashboard' && (
              <Dashboard key={explorerRefreshKey} settings={userSettings} />
            )}

            {currentView === 'explorer' && (
              <ConflictExplorer
                key={explorerRefreshKey}
                onEditConflict={handleEditConflict}
                onCreateConflict={handleCreateConflict}
                settings={userSettings}
              />
            )}

            {currentView === 'profile' && (
              <Profile
                onSettingsChange={handleSettingsChange}
                onViewConflict={handleViewConflict}
              />
            )}
          </div>
        )}
      </main>

      {/* Popup CRUD Form Modal */}
      {showModal && (
        <ConflictModal
          conflict={selectedConflict}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
