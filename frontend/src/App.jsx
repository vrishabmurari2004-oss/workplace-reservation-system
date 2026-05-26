import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SeatsPage from './pages/SeatsPage';
import BookingsPage from './pages/BookingsPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const requireAuth = (element) => {
    return token ? element : <Navigate replace to="/login" />;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div>
      <div className="page-banner">
        <div className="banner-image">
          <div className="banner-topbar">
            <button onClick={() => navigate(-1)} className="back-button">← Back</button>
            <h1>Workplace Reservation System</h1>
            {token && <button onClick={logout}>Logout</button>}
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
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
