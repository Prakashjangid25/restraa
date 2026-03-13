import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { seatNumber } = useCart();
  const [showCheck, setShowCheck] = useState(false);
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
      return;
    }
    setTimeout(() => setShowCheck(true), 300);
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className={`check-animation ${showCheck ? 'show' : ''}`}>
          <div className="check-circle">
            <span className="check-mark">✓</span>
          </div>
        </div>

        <h2 className="conf-title">Order Placed!</h2>
        <p className="conf-subtitle">Your order has been sent to the kitchen</p>

        <div className="conf-details">
          <div className="conf-detail-row">
            <span className="conf-label">Order ID</span>
            <span className="conf-value">{order.id}</span>
          </div>
          <div className="conf-detail-row">
            <span className="conf-label">Seat</span>
            <span className="conf-value">💺 {order.seatNumber}</span>
          </div>
          <div className="conf-detail-row">
            <span className="conf-label">Items</span>
            <span className="conf-value">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          <div className="conf-detail-row">
            <span className="conf-label">Total</span>
            <span className="conf-value conf-total">₹{order.total}</span>
          </div>
        </div>

        <div className="conf-eta">
          <div className="eta-icon">⏱️</div>
          <div className="eta-text">
            <span className="eta-label">Estimated Time</span>
            <span className="eta-time">{order.estimatedTime} minutes</span>
          </div>
        </div>

        <div className="conf-items-summary">
          <h4>Order Items</h4>
          {order.items.map(item => (
            <div key={item.id} className="conf-item">
              <span>{item.emoji} {item.name}</span>
              <span>×{item.quantity} — ₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="conf-actions">
          <button className="conf-btn primary" onClick={() => navigate('/menu')} id="order-more-btn">
            Order More
          </button>
          <button className="conf-btn secondary" onClick={() => navigate('/orders')} id="view-orders-btn">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}
