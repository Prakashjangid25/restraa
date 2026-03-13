import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function SeatEntry() {
  const [seat, setSeat] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setSeatNumber } = useCart();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!seat.trim()) {
      setError('Please enter your seat number');
      return;
    }
    if (isNaN(seat) || Number(seat) < 1 || Number(seat) > 100) {
      setError('Enter a valid seat number (1–100)');
      return;
    }
    setSeatNumber(seat.trim());
    navigate('/menu');
  };

  return (
    <div className="seat-entry-page">
      <div className="seat-entry-bg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`floating-emoji floating-emoji-${i}`}>
            {['🍕', '🍔', '🍜', '🥗', '☕', '🍰'][i]}
          </div>
        ))}
      </div>

      <div className="seat-entry-container">
        <div className="brand-section">
          <div className="brand-logo">🍽️</div>
          <h1 className="brand-name">Restra</h1>
          <p className="brand-tagline">Order from your seat</p>
        </div>

        <form className="seat-form" onSubmit={handleSubmit}>
          <div className={`seat-input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
            <span className="seat-input-icon">💺</span>
            <input
              type="number"
              className="seat-input"
              placeholder="Enter Seat Number"
              value={seat}
              onChange={(e) => { setSeat(e.target.value); setError(''); }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              min="1"
              max="100"
              id="seat-number-input"
            />
          </div>
          {error && <p className="seat-error">{error}</p>}

          <button type="submit" className="seat-submit-btn" id="view-menu-btn">
            <span>View Menu</span>
            <span className="btn-arrow">→</span>
          </button>
        </form>

        <div className="seat-features">
          <div className="feature-badge">
            <span>📋</span>
            <span>Full Menu</span>
          </div>
          <div className="feature-badge">
            <span>⚡</span>
            <span>Quick Order</span>
          </div>
          <div className="feature-badge">
            <span>🔔</span>
            <span>Live Status</span>
          </div>
        </div>

        <button className="admin-link" onClick={() => navigate('/admin')} id="admin-link">
          🔧 Admin Panel
        </button>
      </div>
    </div>
  );
}
