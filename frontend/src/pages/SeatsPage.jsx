import { useEffect, useState } from 'react';
import api from '../api';

export default function SeatsPage() {
  const [seats, setSeats] = useState([]);
  const [code, setCode] = useState('');
  const [floor, setFloor] = useState('');
  const [zone, setZone] = useState('');
  const [seatType, setSeatType] = useState('Desk');
  const [description, setDescription] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [role, setRole] = useState(null);

  const loadSeats = () => {
    api.get('/seats').then((res) => setSeats(res.data));
  };

  const loadRole = () => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    } else {
      api.get('/auth/me').then((res) => {
        localStorage.setItem('role', res.data.role);
        setRole(res.data.role);
      }).catch(() => {
        setRole(null);
      });
    }
  };

  useEffect(() => {
    loadSeats();
    loadRole();
  }, []);

  const filteredSeats = seats.filter((seat) => {
    if (filterFloor && !seat.floor.toLowerCase().includes(filterFloor.toLowerCase())) {
      return false;
    }
    if (filterZone && !seat.zone.toLowerCase().includes(filterZone.toLowerCase())) {
      return false;
    }
    if (filterType && seat.seatType !== filterType) {
      return false;
    }
    if (filterAvailable !== 'all') {
      return filterAvailable === 'available' ? seat.available : !seat.available;
    }
    return true;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/seats', { code, floor, zone, seatType, description });
    setCode('');
    setFloor('');
    setZone('');
    setDescription('');
    loadSeats();
  };

  return (
    <div className="page">
      {role === 'ROLE_ADMIN' && (
        <div className="card">
          <h2>Seat Management</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Seat code
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label>
              Floor
              <input value={floor} onChange={(e) => setFloor(e.target.value)} required />
            </label>
            <label>
              Zone
              <input value={zone} onChange={(e) => setZone(e.target.value)} required />
            </label>
            <label>
              Type
              <select value={seatType} onChange={(e) => setSeatType(e.target.value)}>
                <option>Desk</option>
                <option>Hot Desk</option>
                <option>Meeting Room</option>
              </select>
            </label>
            <label>
              Description
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <button type="submit">Add Seat</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Seat Filters</h2>
        <div className="form-grid filter-row">
          <label>
            Floor
            <input value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} placeholder="Floor or building" />
          </label>
          <label>
            Zone
            <input value={filterZone} onChange={(e) => setFilterZone(e.target.value)} placeholder="Zone name" />
          </label>
          <label>
            Type
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option>Desk</option>
              <option>Hot Desk</option>
              <option>Meeting Room</option>
            </select>
          </label>
          <label>
            Status
            <select value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </label>
          <div className="filter-actions">
            <button type="button" onClick={() => {
              setFilterFloor('');
              setFilterZone('');
              setFilterType('');
              setFilterAvailable('all');
            }}>
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Available Seats</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Floor</th>
              <th>Zone</th>
              <th>Type</th>
              <th>Status</th>
              {role === 'ROLE_ADMIN' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSeats.map((seat) => (
              <tr key={seat.id}>
                <td>{seat.code}</td>
                <td>{seat.floor}</td>
                <td>{seat.zone}</td>
                <td>{seat.seatType}</td>
                <td>
                  <span className={`status-badge ${seat.available ? 'available' : 'booked'}`}>
                    {seat.available ? 'Available' : 'Booked'}
                  </span>
                </td>
                {role === 'ROLE_ADMIN' && (
                  <td>
                    <button type="button" onClick={async () => {
                      await api.delete(`/seats/${seat.id}`);
                      loadSeats();
                    }}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
