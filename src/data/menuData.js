const menuData = [
  {
    category: "Starters",
    icon: "🍢",
    items: [
      { id: 1, name: "Paneer Tikka", price: 249, description: "Marinated cottage cheese grilled to perfection", emoji: "🧀", veg: true, isPopular: true },
      { id: 2, name: "Chicken Seekh Kebab", price: 299, description: "Minced chicken skewers with aromatic spices", emoji: "🍢", veg: false, isPopular: true },
      { id: 3, name: "Veg Spring Rolls", price: 199, description: "Crispy rolls stuffed with fresh vegetables", emoji: "🥟", veg: true, isPopular: false },
      { id: 4, name: "Tandoori Chicken", price: 349, description: "Classic clay oven roasted chicken", emoji: "🍗", veg: false, isPopular: true },
      { id: 5, name: "Hara Bhara Kebab", price: 219, description: "Spinach and green pea patties", emoji: "🥬", veg: true, isPopular: false },
      { id: 6, name: "Fish Amritsari", price: 329, description: "Crispy battered fish with tangy spices", emoji: "🐟", veg: false, isPopular: false },
    ]
  },
  {
    category: "Main Course",
    icon: "🍛",
    items: [
      { id: 7, name: "Butter Chicken", price: 349, description: "Creamy tomato-based curry with tender chicken", emoji: "🍗", veg: false, isPopular: true },
      { id: 8, name: "Paneer Butter Masala", price: 299, description: "Rich and creamy paneer in tomato gravy", emoji: "🧀", veg: true, isPopular: true },
      { id: 9, name: "Dal Makhani", price: 249, description: "Slow-cooked black lentils in butter cream", emoji: "🫘", veg: true, isPopular: true },
      { id: 10, name: "Chicken Biryani Masala", price: 379, description: "Spicy chicken curry with biryani spices", emoji: "🍖", veg: false, isPopular: false },
      { id: 11, name: "Palak Paneer", price: 279, description: "Cottage cheese in spinach gravy", emoji: "🥬", veg: true, isPopular: false },
      { id: 12, name: "Mutton Rogan Josh", price: 449, description: "Kashmiri-style slow cooked mutton", emoji: "🍖", veg: false, isPopular: true },
      { id: 13, name: "Chole Masala", price: 229, description: "Spiced chickpea curry, Punjabi style", emoji: "🫘", veg: true, isPopular: false },
    ]
  },
  {
    category: "Biryani & Rice",
    icon: "🍚",
    items: [
      { id: 14, name: "Chicken Biryani", price: 329, description: "Fragrant basmati rice with spiced chicken", emoji: "🍚", veg: false, isPopular: true },
      { id: 15, name: "Veg Biryani", price: 269, description: "Aromatic rice with seasonal vegetables", emoji: "🍚", veg: true, isPopular: false },
      { id: 16, name: "Mutton Biryani", price: 399, description: "Hyderabadi style with tender mutton", emoji: "🍚", veg: false, isPopular: true },
      { id: 17, name: "Jeera Rice", price: 149, description: "Cumin flavored basmati rice", emoji: "🍚", veg: true, isPopular: false },
      { id: 18, name: "Egg Fried Rice", price: 199, description: "Wok-tossed rice with scrambled eggs", emoji: "🥚", veg: false, isPopular: false },
    ]
  },
  {
    category: "Breads",
    icon: "🫓",
    items: [
      { id: 19, name: "Butter Naan", price: 59, description: "Soft leavened bread with butter", emoji: "🫓", veg: true, isPopular: true },
      { id: 20, name: "Garlic Naan", price: 79, description: "Naan topped with garlic and herbs", emoji: "🧄", veg: true, isPopular: true },
      { id: 21, name: "Tandoori Roti", price: 39, description: "Whole wheat bread from clay oven", emoji: "🫓", veg: true, isPopular: false },
      { id: 22, name: "Cheese Naan", price: 99, description: "Stuffed with melted cheese", emoji: "🧀", veg: true, isPopular: false },
      { id: 23, name: "Laccha Paratha", price: 69, description: "Layered flaky whole wheat bread", emoji: "🫓", veg: true, isPopular: false },
    ]
  },
  {
    category: "Drinks",
    icon: "🥤",
    items: [
      { id: 24, name: "Mango Lassi", price: 129, description: "Creamy yogurt smoothie with mango", emoji: "🥭", veg: true, isPopular: true },
      { id: 25, name: "Masala Chai", price: 69, description: "Indian spiced tea", emoji: "☕", veg: true, isPopular: true },
      { id: 26, name: "Fresh Lime Soda", price: 99, description: "Refreshing lime with soda water", emoji: "🍋", veg: true, isPopular: false },
      { id: 27, name: "Cold Coffee", price: 149, description: "Chilled coffee with ice cream", emoji: "🧊", veg: true, isPopular: false },
      { id: 28, name: "Buttermilk", price: 79, description: "Spiced traditional chaas", emoji: "🥛", veg: true, isPopular: false },
      { id: 29, name: "Mojito", price: 159, description: "Mint and lime refresher", emoji: "🍹", veg: true, isPopular: true },
    ]
  },
  {
    category: "Desserts",
    icon: "🍨",
    items: [
      { id: 30, name: "Gulab Jamun", price: 129, description: "Deep fried milk dumplings in sugar syrup", emoji: "🍩", veg: true, isPopular: true },
      { id: 31, name: "Rasmalai", price: 149, description: "Soft cottage cheese in saffron milk", emoji: "🍮", veg: true, isPopular: true },
      { id: 32, name: "Brownie with Ice Cream", price: 199, description: "Warm chocolate brownie with vanilla scoop", emoji: "🍫", veg: true, isPopular: false },
      { id: 33, name: "Kulfi", price: 119, description: "Traditional Indian frozen dessert", emoji: "🍦", veg: true, isPopular: false },
      { id: 34, name: "Phirni", price: 109, description: "Creamy rice pudding with cardamom", emoji: "🍮", veg: true, isPopular: false },
    ]
  }
];

export default menuData;
