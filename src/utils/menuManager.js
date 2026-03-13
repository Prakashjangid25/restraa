import menuData from '../data/menuData';

const MENU_STORAGE_KEY = 'restra_menu';

// Initialize localStorage with default menu data if not already set
export function getMenu() {
  const stored = localStorage.getItem(MENU_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // First time: save default menu to localStorage
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuData));
  return menuData;
}

export function saveMenu(menu) {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
}

export function addMenuItem(categoryIndex, item) {
  const menu = getMenu();
  if (menu[categoryIndex]) {
    const maxId = menu.reduce((max, cat) =>
      Math.max(max, ...cat.items.map(i => i.id)), 0
    );
    item.id = maxId + 1;
    menu[categoryIndex].items.push(item);
    saveMenu(menu);
  }
  return menu;
}

export function updateMenuItem(categoryIndex, itemId, updatedItem) {
  const menu = getMenu();
  if (menu[categoryIndex]) {
    const itemIndex = menu[categoryIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex >= 0) {
      menu[categoryIndex].items[itemIndex] = { ...menu[categoryIndex].items[itemIndex], ...updatedItem };
      saveMenu(menu);
    }
  }
  return menu;
}

export function deleteMenuItem(categoryIndex, itemId) {
  const menu = getMenu();
  if (menu[categoryIndex]) {
    menu[categoryIndex].items = menu[categoryIndex].items.filter(i => i.id !== itemId);
    saveMenu(menu);
  }
  return menu;
}

export function addCategory(categoryName, icon) {
  const menu = getMenu();
  menu.push({ category: categoryName, icon: icon || '🍽️', items: [] });
  saveMenu(menu);
  return menu;
}

export function deleteCategory(categoryIndex) {
  const menu = getMenu();
  menu.splice(categoryIndex, 1);
  saveMenu(menu);
  return menu;
}

export function resetMenu() {
  localStorage.removeItem(MENU_STORAGE_KEY);
  return getMenu();
}
