import { useEffect, useRef, useState } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SeatsPage from './pages/SeatsPage';
import BookingsPage from './pages/BookingsPage';
import SeatLayoutPage from './pages/SeatLayoutPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const token = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const roleLabel = role ? role.replace('ROLE_', '') : null;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const requireAuth = (element) => {
    return token ? element : <Navigate replace to="/login" />;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <div>
      <div className="page-banner">
        <div className="banner-image">
          <div className="banner-topbar">
            <button onClick={() => navigate(-1)} className="back-button">← Back</button>
            <div className="banner-title">
              <h1>Workplace Reservation System</h1>
              {token && (
                <div className="user-chip">
                  <span>{username ? `Welcome ${username?.toUpperCase()}` : 'Signed in'}</span>
                </div>
              )}
            </div>
            {token && (
              <div className="header-actions" ref={profileRef}>
                <button
                  type="button"
                  className="profile-button"
                  onClick={() => setShowProfile((current) => !current)}
                >
                  <span className="profile-icon">👤</span>
                </button>
                {showProfile && (
                  <div className="profile-dropdown">
                    <div className="profile-row"><strong>User</strong><span>{username || 'Unknown'}</span></div>
                  </div>
                )}
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={isAuthPage ? 'app-shell-auth' : 'app-shell'}>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={requireAuth(<DashboardPage />)} />
            <Route path="/seats" element={requireAuth(<SeatsPage />)} />
            <Route path="/bookings" element={requireAuth(<BookingsPage />)} />
            <Route path="/seat-layout" element={requireAuth(<SeatLayoutPage />)} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
