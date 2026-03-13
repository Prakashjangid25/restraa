import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { onMenuChange, initializeMenu, getCachedMenuData } from '../firebase/services';
import menuDataDefault from '../data/menuData';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Show cached or default data INSTANTLY — no waiting
  const initialData = getCachedMenuData();
  const [menuData, setMenuData] = useState(
    initialData.length > 0 ? initialData : menuDataDefault
  );

  const { cart, addToCart, increment, decrement, totalItems, seatNumber } = useCart();
  const navigate = useNavigate();
  const categoryRefs = useRef([]);

  useEffect(() => {
    // Firestore syncs in background — doesn't block UI
    initializeMenu().catch(() => {});
    const unsubscribe = onMenuChange((menu) => {
      if (menu.length > 0) setMenuData(menu);
    });
    return () => unsubscribe();
  }, []);

  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleCategoryClick = (index) => {
    setActiveCategory(index);
    categoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredData = menuData.map(cat => ({
    ...cat,
    items: (cat.items || []).filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegOnly ? item.veg : true;
      return matchesSearch && matchesVeg;
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-header">
        <div className="menu-header-top">
          <div className="menu-seat-info">
            <span className="seat-badge">💺 Seat {seatNumber}</span>
          </div>
          <h2 className="menu-title">Menu</h2>
          <button className="menu-history-btn" onClick={() => navigate('/orders')} id="order-history-btn">
            📜
          </button>
        </div>

        {/* Search */}
        <div className="menu-search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="menu-search"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="menu-search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Veg Toggle + Category Tabs */}
        <div className="menu-filters-row">
          <button
            className={`veg-toggle ${vegOnly ? 'active' : ''}`}
            onClick={() => setVegOnly(!vegOnly)}
            id="veg-toggle-btn"
          >
            <span className="veg-dot"></span>
            Veg Only
          </button>
        </div>

        <div className="category-tabs">
          {menuData.map((cat, index) => (
            <button
              key={cat.id || cat.category}
              className={`category-tab ${activeCategory === index ? 'active' : ''}`}
              onClick={() => handleCategoryClick(index)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-content">
        {filteredData.map((cat, catIndex) => (
          <div
            key={cat.id || cat.category}
            className="menu-category-section"
            ref={el => categoryRefs.current[catIndex] = el}
          >
            <h3 className="category-heading">
              <span>{cat.icon}</span> {cat.category}
            </h3>
            <div className="menu-items-grid">
              {cat.items.map(item => {
                const qty = getItemQuantity(item.id);
                return (
                  <div key={item.id} className={`menu-item-card ${qty > 0 ? 'in-cart' : ''}`}>
                    <div className="item-emoji">
                      {item.image ? <img src={item.image} alt={item.name} className="item-img" /> : item.emoji}
                    </div>
                    <div className="item-details">
                      <div className="item-name-row">
                        <span className={`veg-badge ${item.veg ? 'veg' : 'non-veg'}`}>
                          <span className="badge-dot"></span>
                        </span>
                        <h4 className="item-name">{item.name}</h4>
                        {item.isPopular && <span className="popular-tag">⭐</span>}
                      </div>
                      <p className="item-desc">{item.description}</p>
                      <div className="item-bottom-row">
                        <span className="item-price">₹{item.price}</span>
                        {qty === 0 ? (
                          <button
                            className="add-btn"
                            onClick={() => addToCart(item)}
                            id={`add-item-${item.id}`}
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => decrement(item.id)}>−</button>
                            <span className="qty-value">{qty}</span>
                            <button className="qty-btn" onClick={() => increment(item.id)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="empty-results">
            <span className="empty-emoji">😕</span>
            <p>No dishes found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button className="floating-cart-btn" onClick={() => navigate('/cart')} id="go-to-cart-btn">
          <span className="cart-icon-text">🛒</span>
          <span className="cart-btn-label">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          <span className="cart-btn-arrow">→</span>
        </button>
      )}
    </div>
  );
}
