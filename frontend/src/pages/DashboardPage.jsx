import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function DashboardPage() {
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/seats').then((res) => setSeats(res.data));
    api.get('/bookings').then((res) => setBookings(res.data));
  }, []);

  const availableCount = seats.filter((seat) => seat.available).length;
  const bookedCount = seats.length - availableCount;

  return (
    <div className="page">
      <div className="card summary-card">
        <h2>Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <span>{seats.length}</span>
            <p>Total seats</p>
          </div>
          <div className="stat-box">
            <span>{availableCount}</span>
            <p>Available seats</p>
          </div>
          <div className="stat-box">
            <span>{bookedCount}</span>
            <p>Booked seats</p>
          </div>
          <div className="stat-box">
            <span>{bookings.length}</span>
            <p>Bookings</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Quick actions</h3>
        <div className="link-row">
          <Link to="/seats" className="quick-action">
            <span className="action-icon">🪑</span>
            <span>Manage Seats</span>
          </Link>
          <Link to="/bookings" className="quick-action">
            <span className="action-icon">📋</span>
            <span>Manage Bookings</span>
          </Link>
          <Link to="/seat-layout" className="quick-action">
            <span className="action-icon">🏢</span>
            <span>Book Seat Layout view</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
