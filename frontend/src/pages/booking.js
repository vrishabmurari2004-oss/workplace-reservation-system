import { useEffect, useState } from 'react';
import api from '../api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [seats, setSeats] = useState([]);
  const [username] = useState(localStorage.getItem('username') || '');
  const [seatId, setSeatId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const bookingsRes = await api.get('/bookings');
      const seatsRes = await api.get('/seats');

      setBookings(bookingsRes.data);
      setSeats(seatsRes.data.filter((seat) => seat.available));
    } catch (err) {
      console.error(err);
      alert('Error loading data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!seatId) {
        alert('Select a seat');
        return;
      }

      if (endTime <= startTime) {
        alert('End time must be greater than start time');
        return;
      }

      await api.post('/bookings', {
        username: username,
        seatId: Number(seatId),
        bookingDate,
        startTime,
        endTime,
      });

      alert('Booking created successfully');

      setSeatId('');
      setBookingDate('');
      setStartTime('09:00');
      setEndTime('17:00');

      refresh();
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Failed to create booking');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      alert('Booking cancelled');
      refresh();
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Failed to cancel booking');
    }
  };

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

          <button type="submit">Create Booking</button>
        </form>
      </div>

      <div className="card">
        <h3>Booking List</h3>

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
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.username}</td>
                <td>{booking.seatCode}</td>
                <td>{booking.bookingDate}</td>
                <td>{booking.startTime}</td>
                <td>{booking.endTime}</td>
                <td>{booking.status}</td>
                <td>
                  <button onClick={() => handleCancel(booking.id)}>
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
}h
