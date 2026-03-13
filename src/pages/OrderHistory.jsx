import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('restra_orders') || '[]');
    setOrders(saved);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('restra_orders');
    setOrders([]);
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <button className="back-btn" onClick={() => navigate('/menu')} id="orders-back-btn">←</button>
        <h2>Order History</h2>
        {orders.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>Clear</button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <span className="empty-emoji">📜</span>
          <h3>No orders yet</h3>
          <p>Your past orders will appear here</p>
          <button className="browse-menu-btn" onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={index} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">{order.id}</span>
                  <span className="order-time">{formatTime(order.timestamp)}</span>
                </div>
                <span className={`order-status status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-card-items">
                {order.items.map(item => (
                  <span key={item.id} className="order-item-chip">
                    {item.emoji} {item.name} ×{item.quantity}
                  </span>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-seat">💺 Seat {order.seatNumber}</span>
                <span className="order-total-amount">₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
