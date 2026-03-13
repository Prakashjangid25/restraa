import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../firebase/services';
import { useState } from 'react';

export default function Cart() {
  const { cart, increment, decrement, clearCart, seatNumber, subtotal, tax, total, totalItems } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);

    const orderData = {
      orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
      seatNumber,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        emoji: item.emoji,
        veg: item.veg
      })),
      subtotal,
      tax,
      total,
      estimatedTime: Math.max(15, totalItems * 5)
    };

    // Try to save for max 4 seconds, navigate regardless
    const goToConfirmation = () => {
      clearCart();
      navigate('/confirmation', { state: { order: orderData } });
    };

    // Timeout: navigate after 4s no matter what
    const timer = setTimeout(goToConfirmation, 4000);

    try {
      await placeOrder(orderData);
      clearTimeout(timer);
      goToConfirmation();
    } catch (err) {
      console.error('Order save error:', err);
      clearTimeout(timer);
      goToConfirmation();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate('/menu')}>←</button>
          <h2>Your Cart</h2>
          <div></div>
        </div>
        <div className="cart-empty">
          <span className="empty-cart-emoji">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add some delicious dishes from the menu!</p>
          <button className="browse-menu-btn" onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate('/menu')} id="cart-back-btn">←</button>
        <h2>Your Cart</h2>
        <button className="clear-cart-btn" onClick={clearCart} id="clear-cart-btn">Clear</button>
      </div>

      <div className="cart-seat-info">
        <span>💺</span>
        <span>Seat {seatNumber}</span>
      </div>

      <div className="cart-items-list">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-emoji">{item.emoji}</div>
            <div className="cart-item-info">
              <div className="cart-item-name-row">
                <span className={`veg-badge ${item.veg ? 'veg' : 'non-veg'}`}>
                  <span className="badge-dot"></span>
                </span>
                <h4>{item.name}</h4>
              </div>
              <span className="cart-item-price">₹{item.price}</span>
            </div>
            <div className="cart-item-actions">
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => decrement(item.id)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => increment(item.id)}>+</button>
              </div>
              <span className="cart-item-total">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="bill-summary">
        <h3 className="bill-title">Bill Summary</h3>
        <div className="bill-row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="bill-row">
          <span>GST (5%)</span>
          <span>₹{tax}</span>
        </div>
        <div className="bill-row bill-total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        className={`place-order-btn ${placing ? 'placing' : ''}`}
        onClick={handlePlaceOrder}
        disabled={placing}
        id="place-order-btn"
      >
        <span>{placing ? '⏳ Placing Order...' : 'Place Order'}</span>
        <span className="order-total">₹{total}</span>
      </button>
    </div>
  );
}
