import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const TYPE_ICONS = {
  Desk: '🪑',
  'Hot Desk': '💼',
  'Meeting Room': '🧑‍🤝‍🧑',
};

export default function SeatLayoutPage() {
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('');

  const username = localStorage.getItem('username') || '';

  const loadData = async () => {
    try {
      const [seatsRes, bookingsRes] = await Promise.all([
        api.get('/seats'),
        api.get('/bookings'),
      ]);
      setSeats(seatsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load layout data', error);
      setMessage('Unable to load layout data.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const floors = useMemo(() => {
    return [...new Set(seats.map((seat) => seat.floor || 'Floor 1'))].sort();
  }, [seats]);

  useEffect(() => {
    if (!selectedFloor && floors.length) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => !selectedFloor || seat.floor === selectedFloor);
  }, [seats, selectedFloor]);

  const zones = useMemo(() => {
    return filteredSeats.reduce((grouped, seat) => {
      const zoneKey = seat.zone || 'General';
      if (!grouped[zoneKey]) {
        grouped[zoneKey] = [];
      }
      grouped[zoneKey].push(seat);
      return grouped;
    }, {});
  }, [filteredSeats]);

  const bookingMap = useMemo(() => {
    return bookings.reduce((map, booking) => {
      if (booking.seat?.id) {
        map[booking.seat.id] = booking;
      }
      return map;
    }, {});
  }, [bookings]);

  const showToast = (text, type = 'info') => {
    setToast(text);
    setToastType(type);
    setTimeout(() => {
      setToast('');
      setToastType('');
    }, 3000);
  };

  const handleSeatClick = (seat) => {
    const booking = bookingMap[seat.id];
    const isOwnBooking = booking?.user?.username === username;

    if (!seat.available && !isOwnBooking) {
      showToast('Seat already booked.', 'error');
      setSelectedSeat(null);
      setSelectedBooking(null);
      setBookingDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      return;
    }

    setSelectedSeat(seat);
    setSelectedBooking(isOwnBooking ? booking : null);
    setMessage('');

    if (isOwnBooking) {
      setBookingDate(booking.bookingDate || '');
      setStartTime(booking.startTime || '09:00');
      setEndTime(booking.endTime || '17:00');
    } else {
      setBookingDate('');
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSeat) {
      setMessage('Select a seat from the layout.');
      setMessageType('error');
      return;
    }
    if (!bookingDate) {
      setMessage('Please select a booking date.');
      setMessageType('error');
      return;
    }
    if (endTime <= startTime) {
      setMessage('End time must be after start time.');
      setMessageType('error');
      return;
    }

    try {
      if (selectedBooking) {
        await api.delete(`/bookings/${selectedBooking.id}`);
      }

      await api.post('/bookings', {
        username,
        seatId: selectedSeat.id,
        bookingDate,
        startTime,
        endTime,
      });

      setMessage(selectedBooking ? 'Booking updated successfully.' : 'Seat booked successfully.');
      setMessageType('success');
      setSelectedSeat(null);
      setSelectedBooking(null);
      setBookingDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      loadData();
    } catch (error) {
      console.error('Booking failed', error);
      setMessage('Booking failed. Please try again.');
      setMessageType('error');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) {
      return;
    }
    try {
      await api.delete(`/bookings/${selectedBooking.id}`);
      setMessage('Booking cancelled successfully.');
      setMessageType('success');
      setSelectedSeat(null);
      setSelectedBooking(null);
      setBookingDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      loadData();
    } catch (error) {
      console.error('Cancel failed', error);
      setMessage('Failed to cancel booking.');
      setMessageType('error');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="layout-header">
          <div>
            <h2>Book Seat Layout View</h2>
            <p>Choose a floor, inspect the zones, and book any available seat directly from the layout.</p>
          </div>
          <label className="floor-select">
            Floor
            <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
              {floors.map((floor) => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card layout-container">
        <div className="layout-sidebar">
          <div className="layout-panel">
            <h3>Booking panel</h3>
            <p>Click an available seat to open the quick booking form.</p>
            <div className="booking-summary">
              <div>
                <strong>Selected seat</strong>
                <p>{selectedSeat ? selectedSeat.code : 'None selected'}</p>
              </div>
              <div>
                <strong>Type</strong>
                <p>{selectedSeat ? selectedSeat.seatType : '-'}</p>
              </div>
              <div>
                <strong>Zone</strong>
                <p>{selectedSeat ? selectedSeat.zone : '-'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                Seat code
                <input value={selectedSeat?.code || ''} disabled />
              </label>
              <label>
                Booking date
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
              </label>
              <label>
                Start time
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </label>
              <label>
                End time
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </label>
              <div className="form-action-row">
                <button type="submit" disabled={!selectedSeat}>
                  {selectedBooking ? 'Update booking' : 'Book selected seat'}
                </button>
                {selectedBooking && (
                  <button type="button" className="cancel-button" onClick={handleCancelBooking}>
                    Cancel booking
                  </button>
                )}
              </div>
            </form>
            {message && <p className={`message ${messageType}`}>{message}</p>}
          </div>
        </div>

        <div className="layout-map">
          {toast && <div className={`toast ${toastType}`}>{toast}</div>}
          {Object.keys(zones).length === 0 ? (
            <p>No seats available for this floor yet.</p>
          ) : (
            Object.entries(zones).map(([zoneName, zoneSeats]) => (
              <div key={zoneName} className="seat-zone">
                <div className="seat-zone-header">
                  <strong>{zoneName}</strong>
                  <span>{zoneSeats.length} seats</span>
                </div>
                <div className="seat-grid">
                  {zoneSeats.map((seat) => {
                    const booking = bookingMap[seat.id];
                    const isBooked = !seat.available;
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        className={`seat-card ${seat.seatType.toLowerCase().replace(/\s+/g, '-')} ${seat.available ? 'available' : 'booked'}${selectedSeat?.id === seat.id ? ' selected' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        title={isBooked ? `${booking?.startTime || ''} → ${booking?.endTime || ''}` : 'Click to book this seat'}
                      >
                        <span className="seat-icon">{TYPE_ICONS[seat.seatType] || '🪑'}</span>
                        <div>
                          <div className="seat-label">{seat.code}</div>
                          <div className="seat-type">{seat.seatType}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
