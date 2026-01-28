import type { Ingredient } from '../types'

export const ingredients: Ingredient[] = [
  // 蛋白質 Protein
  { id: 'chicken-thigh', name: 'Chicken Thigh', nameZh: '雞腿', category: 'protein' },
  { id: 'chicken-breast', name: 'Chicken Breast', nameZh: '雞胸', category: 'protein' },
  { id: 'pork', name: 'Pork', nameZh: '豬肉', category: 'protein' },
  { id: 'pork-belly', name: 'Pork Belly', nameZh: '五花肉', category: 'protein' },
  { id: 'ground-pork', name: 'Ground Pork', nameZh: '豬絞肉', category: 'protein' },
  { id: 'beef', name: 'Beef', nameZh: '牛肉', category: 'protein' },
  { id: 'egg', name: 'Egg', nameZh: '蛋', category: 'protein' },
  { id: 'tofu', name: 'Tofu', nameZh: '豆腐', category: 'protein' },
  { id: 'fish', name: 'Fish', nameZh: '魚', category: 'protein' },
  { id: 'salmon', name: 'Salmon', nameZh: '鮭魚', category: 'protein' },
  { id: 'shrimp', name: 'Shrimp', nameZh: '蝦', category: 'protein' },
  { id: 'bacon', name: 'Bacon', nameZh: '培根', category: 'protein' },
  { id: 'ham', name: 'Ham', nameZh: '火腿', category: 'protein' },
  { id: 'sausage', name: 'Sausage', nameZh: '香腸', category: 'protein' },

  // 蔬菜 Vegetables
  { id: 'leafy-greens', name: 'Leafy Greens', nameZh: '青菜', category: 'vegetable' },
  { id: 'cabbage', name: 'Cabbage', nameZh: '高麗菜', category: 'vegetable' },
  { id: 'chinese-cabbage', name: 'Chinese Cabbage', nameZh: '大白菜', category: 'vegetable' },
  { id: 'onion', name: 'Onion', nameZh: '洋蔥', category: 'vegetable' },
  { id: 'green-onion', name: 'Green Onion', nameZh: '蔥', category: 'vegetable' },
  { id: 'tomato', name: 'Tomato', nameZh: '番茄', category: 'vegetable' },
  { id: 'carrot', name: 'Carrot', nameZh: '紅蘿蔔', category: 'vegetable' },
  { id: 'potato', name: 'Potato', nameZh: '馬鈴薯', category: 'vegetable' },
  { id: 'corn', name: 'Corn', nameZh: '玉米', category: 'vegetable' },
  { id: 'mushroom', name: 'Mushroom', nameZh: '香菇', category: 'vegetable' },
  { id: 'broccoli', name: 'Broccoli', nameZh: '花椰菜', category: 'vegetable' },
  { id: 'spinach', name: 'Spinach', nameZh: '菠菜', category: 'vegetable' },
  { id: 'bean-sprouts', name: 'Bean Sprouts', nameZh: '豆芽菜', category: 'vegetable' },
  { id: 'cucumber', name: 'Cucumber', nameZh: '小黃瓜', category: 'vegetable' },
  { id: 'eggplant', name: 'Eggplant', nameZh: '茄子', category: 'vegetable' },
  { id: 'bell-pepper', name: 'Bell Pepper', nameZh: '甜椒', category: 'vegetable' },
  { id: 'garlic', name: 'Garlic', nameZh: '蒜頭', category: 'vegetable' },
  { id: 'ginger', name: 'Ginger', nameZh: '薑', category: 'vegetable' },

  // 主食 Grains
  { id: 'rice', name: 'Rice', nameZh: '白飯', category: 'grain' },
  { id: 'noodles', name: 'Noodles', nameZh: '麵條', category: 'grain' },
  { id: 'udon', name: 'Udon', nameZh: '烏龍麵', category: 'grain' },
  { id: 'ramen', name: 'Ramen Noodles', nameZh: '拉麵', category: 'grain' },
  { id: 'rice-noodles', name: 'Rice Noodles', nameZh: '米粉', category: 'grain' },
  { id: 'bread', name: 'Bread', nameZh: '麵包', category: 'grain' },

  // 調味料 Seasonings
  { id: 'soy-sauce', name: 'Soy Sauce', nameZh: '醬油', category: 'seasoning' },
  { id: 'mirin', name: 'Mirin', nameZh: '味醂', category: 'seasoning' },
  { id: 'sake', name: 'Cooking Sake', nameZh: '米酒', category: 'seasoning' },
  { id: 'sesame-oil', name: 'Sesame Oil', nameZh: '麻油', category: 'seasoning' },
  { id: 'oyster-sauce', name: 'Oyster Sauce', nameZh: '蠔油', category: 'seasoning' },
  { id: 'vinegar', name: 'Vinegar', nameZh: '醋', category: 'seasoning' },
  { id: 'sugar', name: 'Sugar', nameZh: '糖', category: 'seasoning' },
  { id: 'salt', name: 'Salt', nameZh: '鹽', category: 'seasoning' },
  { id: 'miso', name: 'Miso', nameZh: '味噌', category: 'seasoning' },
  { id: 'dashi', name: 'Dashi Stock', nameZh: '高湯', category: 'seasoning' },
  { id: 'chili', name: 'Chili', nameZh: '辣椒', category: 'seasoning' },
  { id: 'pepper', name: 'Pepper', nameZh: '胡椒', category: 'seasoning' },
  { id: 'curry-powder', name: 'Curry Powder', nameZh: '咖哩粉', category: 'seasoning' },

  // 其他 Other
  { id: 'cheese', name: 'Cheese', nameZh: '起司', category: 'dairy' },
  { id: 'milk', name: 'Milk', nameZh: '牛奶', category: 'dairy' },
  { id: 'butter', name: 'Butter', nameZh: '奶油', category: 'dairy' },
]

export const categoryLabels: Record<Ingredient['category'], string> = {
  protein: '蛋白質',
  vegetable: '蔬菜',
  grain: '主食',
  seasoning: '調味料',
  dairy: '乳製品',
  other: '其他',
}

export const getIngredientsByCategory = () => {
  const grouped: Record<string, Ingredient[]> = {}
  for (const ing of ingredients) {
    if (!grouped[ing.category]) grouped[ing.category] = []
    grouped[ing.category].push(ing)
  }
  return grouped
}

export const getIngredientById = (id: string) =>
  ingredients.find(i => i.id === id)

export const searchIngredients = (query: string) => {
  const q = query.toLowerCase()
  return ingredients.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.nameZh.includes(q)
  )
}
