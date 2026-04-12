import { Product } from './types';

export const CATEGORIES = [
  { id: 'accessories', name: 'HANDCRAFTED ACCESSORIES', icon: '💍' },
  { id: 'visual-arts', name: 'VISUAL ARTS', icon: '🎨' },
  { id: 'crochets', name: 'CROCHETS', icon: '🧶' },
  { id: 'delicacies', name: 'HOME-MADE DELICACIES', icon: '🧁' },
];

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Custom Chibi Portrait', price: 150, images: ['https://picsum.photos/seed/chibi/300/300', 'https://picsum.photos/seed/chibi2/300/300'], category: 'visual-arts', sellerId: 'system', sellerName: 'Everga Artists', stock: 10 },
  { id: '2', name: 'Satin Flowers', price: 250, images: ['https://picsum.photos/seed/flowers/300/300', 'https://picsum.photos/seed/flowers2/300/300'], category: 'accessories', sellerId: 'system', sellerName: 'Everga Crafts', stock: 5 },
  { id: '3', name: 'Anime Keychains', price: 75, images: ['https://picsum.photos/seed/keychain/300/300'], category: 'accessories', sellerId: 'system', sellerName: 'Everga Crafts', stock: 20 },
  { id: '4', name: 'Crochet Plushies', price: 450, images: ['https://picsum.photos/seed/crochet/300/300'], category: 'crochets', sellerId: 'system', sellerName: 'Everga Crafts', stock: 3 },
  { id: '5', name: 'Home-made Delicacies', price: 200, images: ['https://picsum.photos/seed/cupcake/300/300'], category: 'delicacies', sellerId: 'system', sellerName: 'Everga Bakers', stock: 15 },
  { id: '6', name: 'Portrait Pencil Sketch', price: 500, images: ['https://picsum.photos/seed/sketch/300/300'], category: 'visual-arts', sellerId: 'system', sellerName: 'Everga Artists', stock: 2 },
];

export const ADMIN_EMAILS = ['systemppdea@gmail.com', 'abadjustine679@gmail.com', 'euctindahan371@gmail.com'];
