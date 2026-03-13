import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onMenuChange, onOrdersChange, updateOrderStatus,
  addCategoryToFirestore, deleteCategoryFromFirestore,
  addItemToCategory, updateItemInCategory, deleteItemFromCategory,
  initializeMenu
} from '../firebase/services';

const ADMIN_PIN = '1234';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('restra_admin') === 'true');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Item form state
  const [itemForm, setItemForm] = useState({
    name: '', price: '', description: '', emoji: '🍽️',
    veg: true, isPopular: false, image: ''
  });

  // Category form state
  const [catForm, setCatForm] = useState({ name: '', icon: '🍽️' });

  useEffect(() => {
    if (isAuthenticated) {
      initializeMenu();
      const unsubMenu = onMenuChange((menuData) => setMenu(menuData));
      const unsubOrders = onOrdersChange((ordersData) => setOrders(ordersData));
      return () => { unsubMenu(); unsubOrders(); };
    }
  }, [isAuthenticated]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('restra_admin', 'true');
      setPinError('');
    } else {
      setPinError('Wrong PIN! Try again');
      setPin('');
    }
  };

  const resetItemForm = () => {
    setItemForm({ name: '', price: '', description: '', emoji: '🍽️', veg: true, isPopular: false, image: '' });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('⚠️ Image must be under 2MB');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let w = img.width, h = img.height;
        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
        else { w = (w / h) * maxSize; h = maxSize; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        setItemForm(prev => ({ ...prev, image: base64 }));
        setUploading(false);
        showToast('📸 Photo added!');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.price) {
      showToast('⚠️ Name and price required');
      return;
    }
    const currentCat = menu[activeCatIndex];
    if (!currentCat) return;

    const item = {
      name: itemForm.name.trim(),
      price: Number(itemForm.price),
      description: itemForm.description.trim(),
      emoji: itemForm.emoji || '🍽️',
      veg: itemForm.veg,
      isPopular: itemForm.isPopular,
      image: itemForm.image || ''
    };

    try {
      if (editingItem) {
        await updateItemInCategory(currentCat.id, currentCat.items, editingItem.id, item);
        showToast('✅ Item updated!');
      } else {
        await addItemToCategory(currentCat.id, currentCat.items, item);
        showToast('✅ Item added!');
      }
      resetItemForm();
    } catch (error) {
      console.error('Save error:', error);
      showToast('⚠️ Failed to save');
    }
  };

  const handleEditItem = (item) => {
    setItemForm({
      name: item.name,
      price: item.price,
      description: item.description || '',
      emoji: item.emoji || '🍽️',
      veg: item.veg,
      isPopular: item.isPopular || false,
      image: item.image || ''
    });
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    const currentCat = menu[activeCatIndex];
    if (!currentCat) return;
    try {
      await deleteItemFromCategory(currentCat.id, currentCat.items, itemId);
      showToast('🗑️ Item deleted');
    } catch (error) {
      showToast('⚠️ Failed to delete');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      showToast('⚠️ Category name required');
      return;
    }
    try {
      await addCategoryToFirestore(catForm.name.trim(), catForm.icon);
      setCatForm({ name: '', icon: '🍽️' });
      setShowCategoryForm(false);
      showToast('✅ Category added!');
    } catch (error) {
      showToast('⚠️ Failed to add');
    }
  };

  const handleDeleteCategory = async (index) => {
    const cat = menu[index];
    if (cat.items.length > 0) {
      if (!window.confirm(`Delete "${cat.category}" with ${cat.items.length} items?`)) return;
    }
    try {
      await deleteCategoryFromFirestore(cat.id);
      if (activeCatIndex >= menu.length - 1) setActiveCatIndex(Math.max(0, menu.length - 2));
      showToast('🗑️ Category deleted');
    } catch (error) {
      showToast('⚠️ Failed to delete');
    }
  };

  const handleStatusChange = async (firebaseId, newStatus) => {
    try {
      await updateOrderStatus(firebaseId, newStatus);
      showToast(`✅ Order → ${newStatus}`);
    } catch (error) {
      showToast('⚠️ Failed to update');
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const statusColors = {
    Preparing: '#e8973f',
    Ready: '#4ade80',
    Served: '#6d6358',
    Cancelled: '#ef4444'
  };

  const getOrderCounts = () => {
    const preparing = orders.filter(o => o.status === 'Preparing').length;
    const ready = orders.filter(o => o.status === 'Ready').length;
    return { preparing, ready };
  };

  // ===== PIN LOGIN SCREEN =====
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-lock-icon">🔒</div>
          <h2>Admin Access</h2>
          <p>Enter PIN to manage menu</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="admin-pin-input"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(''); }}
              maxLength={6}
              autoFocus
              id="admin-pin-input"
            />
            {pinError && <p className="admin-pin-error">{pinError}</p>}
            <button type="submit" className="admin-login-btn" id="admin-login-btn">
              Unlock
            </button>
          </form>
          <p className="admin-hint">Default PIN: 1234</p>
          <button className="admin-back-link" onClick={() => navigate('/')}>
            ← Back to app
          </button>
        </div>
      </div>
    );
  }

  const currentCategory = menu[activeCatIndex];
  const { preparing, ready } = getOrderCounts();

  // ===== ADMIN DASHBOARD =====
  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Header */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/')} id="admin-back-btn">←</button>
        <h2>Admin Panel</h2>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Tab Switcher */}
      <div className="admin-tab-switcher">
        <button
          className={`admin-main-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
          {preparing > 0 && <span className="tab-badge pulse">{preparing}</span>}
        </button>
        <button
          className={`admin-main-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Menu
        </button>
      </div>

      {/* ===== ORDERS TAB ===== */}
      {activeTab === 'orders' && (
        <div className="admin-orders-section">
          {/* Status Summary */}
          <div className="orders-status-bar">
            <div className="status-chip preparing">
              <span className="status-dot" style={{ background: statusColors.Preparing }}></span>
              Preparing: {preparing}
            </div>
            <div className="status-chip ready">
              <span className="status-dot" style={{ background: statusColors.Ready }}></span>
              Ready: {ready}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="admin-empty">
              <span>📭</span>
              <p>No orders yet</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Orders will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {orders.map(order => (
                <div key={order.firebaseId} className={`admin-order-card status-${order.status?.toLowerCase()}`}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">{order.orderId}</span>
                      <span className="order-time">{formatTime(order.createdAt)}</span>
                    </div>
                    <div className="order-seat-badge">💺 {order.seatNumber}</div>
                  </div>

                  <div className="order-card-items">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="order-item-line">
                        <span>{item.emoji} {item.name}</span>
                        <span>×{item.quantity} — ₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-bottom">
                    <span className="order-total-amount">Total: ₹{order.total}</span>
                    <div className="order-status-actions">
                      {order.status === 'Preparing' && (
                        <button
                          className="status-btn ready-btn"
                          onClick={() => handleStatusChange(order.firebaseId, 'Ready')}
                        >
                          ✅ Ready
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button
                          className="status-btn served-btn"
                          onClick={() => handleStatusChange(order.firebaseId, 'Served')}
                        >
                          🍽️ Served
                        </button>
                      )}
                      {order.status === 'Served' && (
                        <span className="status-badge served">✓ Served</span>
                      )}
                      {order.status !== 'Served' && order.status !== 'Cancelled' && (
                        <button
                          className="status-btn cancel-btn"
                          onClick={() => handleStatusChange(order.firebaseId, 'Cancelled')}
                        >
                          ✕
                        </button>
                      )}
                      {order.status === 'Cancelled' && (
                        <span className="status-badge cancelled">Cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MENU TAB ===== */}
      {activeTab === 'menu' && (
        <>
          {/* Category Tabs */}
          <div className="admin-cat-section">
            <div className="admin-cat-tabs">
              {menu.map((cat, i) => (
                <div
                  key={cat.id}
                  className={`admin-cat-tab ${activeCatIndex === i ? 'active' : ''}`}
                  onClick={() => setActiveCatIndex(i)}
                >
                  <span>{cat.icon}</span>
                  <span className="admin-cat-name">{cat.category}</span>
                  <span className="admin-cat-count">{(cat.items || []).length}</span>
                  {menu.length > 1 && (
                    <button
                      className="admin-cat-delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(i); }}
                    >×</button>
                  )}
                </div>
              ))}
              <button
                className="admin-cat-tab add-cat-tab"
                onClick={() => setShowCategoryForm(true)}
              >
                <span>＋</span>
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          {currentCategory && (
            <div className="admin-items-section">
              <div className="admin-items-header">
                <h3>{currentCategory.icon} {currentCategory.category}</h3>
                <button
                  className="admin-add-item-btn"
                  onClick={() => { resetItemForm(); setShowItemForm(true); }}
                  id="add-item-btn"
                >
                  ＋ Add Item
                </button>
              </div>

              {(currentCategory.items || []).length === 0 ? (
                <div className="admin-empty">
                  <span>📭</span>
                  <p>No items in this category</p>
                  <button className="admin-btn primary" onClick={() => { resetItemForm(); setShowItemForm(true); }}>
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="admin-items-list">
                  {currentCategory.items.map(item => (
                    <div key={item.id} className="admin-item-card">
                      <div className="admin-item-visual">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="admin-item-img" />
                        ) : (
                          <span className="admin-item-emoji">{item.emoji}</span>
                        )}
                      </div>
                      <div className="admin-item-info">
                        <div className="admin-item-top">
                          <span className={`veg-badge ${item.veg ? 'veg' : 'non-veg'}`}>
                            <span className="badge-dot"></span>
                          </span>
                          <h4>{item.name}</h4>
                          {item.isPopular && <span className="popular-tag">⭐</span>}
                        </div>
                        <p className="admin-item-desc">{item.description}</p>
                        <span className="admin-item-price">₹{item.price}</span>
                      </div>
                      <div className="admin-item-actions">
                        <button className="admin-action-btn edit" onClick={() => handleEditItem(item)}>✏️</button>
                        <button className="admin-action-btn delete" onClick={() => handleDeleteItem(item.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="admin-modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>New Category</h3>
            <form onSubmit={handleAddCategory} className="admin-form">
              <div className="admin-field">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mocktails"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="admin-field">
                <label>Icon (emoji)</label>
                <input
                  type="text"
                  placeholder="🍹"
                  value={catForm.icon}
                  onChange={e => setCatForm({ ...catForm, icon: e.target.value })}
                  className="emoji-input"
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setShowCategoryForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showItemForm && (
        <div className="admin-modal-overlay" onClick={resetItemForm}>
          <div className="admin-modal item-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Item' : 'New Item'}</h3>
            <form onSubmit={handleSaveItem} className="admin-form">
              {/* Photo Upload */}
              <div className="admin-photo-section">
                <div
                  className="admin-photo-preview"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <div className="photo-placeholder">
                      <div className="loading-spinner small"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : itemForm.image ? (
                    <img src={itemForm.image} alt="Preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>📷</span>
                      <span>Tap to upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {itemForm.image && (
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => setItemForm(prev => ({ ...prev, image: '' }))}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="admin-field">
                <label>Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Paneer Tikka"
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={itemForm.price}
                    onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="admin-field">
                  <label>Emoji</label>
                  <input
                    type="text"
                    placeholder="🍽️"
                    value={itemForm.emoji}
                    onChange={e => setItemForm({ ...itemForm, emoji: e.target.value })}
                    className="emoji-input"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>Description</label>
                <textarea
                  placeholder="Short description..."
                  value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="admin-toggles-row">
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={itemForm.veg}
                    onChange={e => setItemForm({ ...itemForm, veg: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                  <span>🟢 Veg</span>
                </label>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={itemForm.isPopular}
                    onChange={e => setItemForm({ ...itemForm, isPopular: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                  <span>⭐ Popular</span>
                </label>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn secondary" onClick={resetItemForm}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={uploading}>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
