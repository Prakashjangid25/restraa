import { db } from './config';
import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, addDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import menuDataDefault from '../data/menuData';

const MENU_COLLECTION = 'menu_categories';
const MENU_CACHE_KEY = 'restra_menu_cache';

// ===== LOCAL CACHE HELPERS =====
function getCachedMenu() {
  try {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

function setCachedMenu(menu) {
  try {
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menu));
  } catch { /* ignore quota errors */ }
}

// ===== MENU SERVICES =====

// Initialize menu in Firestore with default data (run once)
export async function initializeMenu() {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  if (snapshot.empty) {
    const batch = writeBatch(db);
    menuDataDefault.forEach((cat, index) => {
      const catRef = doc(db, MENU_COLLECTION, `cat_${index}`);
      batch.set(catRef, {
        category: cat.category,
        icon: cat.icon,
        order: index,
        items: cat.items
      });
    });
    await batch.commit();
  }
}

// Listen to menu changes in real-time + cache locally
export function onMenuChange(callback) {
  // Show cached data immediately
  const cached = getCachedMenu();
  if (cached && cached.length > 0) {
    callback(cached);
  }

  const q = query(collection(db, MENU_COLLECTION), orderBy('order'));
  return onSnapshot(q, (snapshot) => {
    const menu = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    if (menu.length > 0) {
      setCachedMenu(menu);
      callback(menu);
    }
  });
}

// Get cached menu for instant display
export function getCachedMenuData() {
  return getCachedMenu() || [];
}

// Add a category
export async function addCategoryToFirestore(categoryName, icon) {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  const order = snapshot.size;
  const catRef = doc(db, MENU_COLLECTION, `cat_${Date.now()}`);
  await setDoc(catRef, {
    category: categoryName,
    icon: icon || '🍽️',
    order,
    items: []
  });
}

// Delete a category
export async function deleteCategoryFromFirestore(catDocId) {
  await deleteDoc(doc(db, MENU_COLLECTION, catDocId));
}

// Add item to a category
export async function addItemToCategory(catDocId, currentItems, newItem) {
  const maxId = currentItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
  newItem.id = maxId + 1;
  const updatedItems = [...currentItems, newItem];
  await updateDoc(doc(db, MENU_COLLECTION, catDocId), { items: updatedItems });
  return updatedItems;
}

// Update an item in a category
export async function updateItemInCategory(catDocId, currentItems, itemId, updatedData) {
  const updatedItems = currentItems.map(item =>
    item.id === itemId ? { ...item, ...updatedData } : item
  );
  await updateDoc(doc(db, MENU_COLLECTION, catDocId), { items: updatedItems });
  return updatedItems;
}

// Delete an item from a category
export async function deleteItemFromCategory(catDocId, currentItems, itemId) {
  const updatedItems = currentItems.filter(item => item.id !== itemId);
  await updateDoc(doc(db, MENU_COLLECTION, catDocId), { items: updatedItems });
  return updatedItems;
}

// ===== ORDER SERVICES =====

const ORDERS_COLLECTION = 'orders';

// Place a new order
export async function placeOrder(orderData) {
  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...orderData,
    status: 'Preparing',
    createdAt: serverTimestamp(),
    clientTime: new Date().toISOString(),
    updatedAt: serverTimestamp()
  });
  return orderRef.id;
}

// Listen to orders in real-time (for admin)
export function onOrdersChange(callback) {
  const q = query(collection(db, ORDERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({
      firebaseId: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().clientTime || new Date().toISOString()
    }));
    // Sort client-side: newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(orders);
  });
}

// Update order status
export async function updateOrderStatus(firebaseId, newStatus) {
  await updateDoc(doc(db, ORDERS_COLLECTION, firebaseId), {
    status: newStatus,
    updatedAt: serverTimestamp()
  });
}
