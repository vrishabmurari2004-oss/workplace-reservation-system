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

  
  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const bookingsRes = await api.get('/bookings');
      const seatsRes = await api.get('/seats');

      setBookings(bookingsRes.data);
      setSeats(seatsRes.data.filter((seat) => seat.available));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!seatId) {
        alert('Please select a seat');
        return;
      }

      if (endTime <= startTime) {
        alert('End time must be after start time');
        return;
      }

      const selectedSeat = seats.find(
        (seat) => seat.id === Number(seatId)
      );

      if (!selectedSeat) {
        alert('Invalid seat selected');
        return;
      }

      await api.post('/bookings', {
        username: username,   // ✅ FIXED
        seatId: selectedSeat.id, // ✅ FIXED
        bookingDate,
        startTime,
        endTime,
      });

      alert('Booking created successfully');

      // Reset form
      setBookingDate('');
      setSeatId('');
      setStartTime('09:00');
      setEndTime('17:00');

      refresh();
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      alert('Booking cancelled');
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
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
                <td>{booking.user.username}</td> {/* ✅ FIXED */}
                <td>{booking.seat.code}</td> {/* ✅ FIXED */}
                <td>{booking.bookingDate}</td>
                <td>{booking.startTime}</td>
                <td>{booking.endTime}</td>
                <td>{booking.status}</td>
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