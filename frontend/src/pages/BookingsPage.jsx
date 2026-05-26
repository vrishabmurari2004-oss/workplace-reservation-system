import { useEffect, useState } from 'react';
import api from '../api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [seats, setSeats] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [seatId, setSeatId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMyBookings, setShowMyBookings] = useState(true);

  const currentUsername = localStorage.getItem('username') || '';
  const role = localStorage.getItem('role') || '';
  const isAdmin = role === 'ROLE_ADMIN';

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setMessage('');
    setMessageType('');
    try {
      const bookingsRes = await api.get('/bookings');
      const seatsRes = await api.get('/seats');

      setBookings(bookingsRes.data);
      setSeats(seatsRes.data.filter((seat) => seat.available));
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Unable to load bookings.');
      setMessageType('error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!seatId) {
        setMessage('Please select a seat');
        setMessageType('error');
        return;
      }

      if (endTime <= startTime) {
        setMessage('End time must be after start time');
        setMessageType('error');
        return;
      }

      const selectedSeat = seats.find(
        (seat) => seat.id === Number(seatId)
      );

      if (!selectedSeat) {
        setMessage('Invalid seat selected');
        setMessageType('error');
        return;
      }

      await api.post('/bookings', {
        username: username,
        seatId: selectedSeat.id,
        bookingDate,
        startTime,
        endTime,
      });

      setMessage('Booking created successfully');
      setMessageType('success');

      // Reset form
      setBookingDate('');
      setSeatId('');
      setStartTime('09:00');
      setEndTime('17:00');

      refresh();
    } catch (error) {
      console.error('Booking failed:', error);
      setMessage('Failed to create booking');
      setMessageType('error');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      setMessage('Booking cancelled');
      setMessageType('success');
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage('Failed to cancel booking');
      setMessageType('error');
    }
  };

  const visibleBookings = bookings.filter((booking) => {
    if (showMyBookings) {
      return booking.user?.username === currentUsername;
    }
    return true;
  });

  return (
    <div className="page">
      <div className="card">
        <h2>Book a Seat</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Seat
            <select
              value={seatId}
              onChange={(e) => setSeatId(e.target.value)}
              required
            >
              <option value="">Select a seat</option>
              {seats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  {seat.code} - {seat.zone}
                </option>
              ))}
            </select>
          </label>

          <label>
            Booking date
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </label>

          <label>
            Start time
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>

          <label>
            End time
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>

          <label className="button-label">
            Book Seat
            <button type="submit" className="submit-button">Create Booking</button>
          </label>
        </form>
      </div>

      <div className="card">
        <h3>Booking List</h3>
        <div className="filter-row">
          <div>
            <strong>Viewing:</strong> {showMyBookings ? `My bookings (${currentUsername})` : 'All bookings'}
          </div>
          {isAdmin && (
            <label className="filter-label">
              Show
              <select value={showMyBookings ? 'mine' : 'all'} onChange={(e) => setShowMyBookings(e.target.value === 'mine')}>
                <option value="mine">My bookings</option>
                <option value="all">All bookings</option>
              </select>
            </label>
          )}
        </div>
        {message && <p className={`message ${messageType}`}>{message}</p>}
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Seat</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {visibleBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.user.username}</td> {/* ✅ FIXED */}
                <td>{booking.seat.code}</td> {/* ✅ FIXED */}
                <td>{booking.bookingDate}</td>
                <td>{booking.startTime}</td>
                <td>{booking.endTime}</td>
                <td>
                  <span className={`status-badge ${booking.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}