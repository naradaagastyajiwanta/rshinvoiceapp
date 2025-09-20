import type { Product } from "./types"

// Default products for initial setup
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sehat Dalam Sekejap',
    description: 'Program kesehatan cepat dan efektif',
    price: 300000,
    category: 'Konsultasi',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '2',
    name: 'Quantum Scan',
    description: 'Pemeriksaan kesehatan dengan teknologi quantum',
    price: 180000,
    category: 'Pemeriksaan',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '3',
    name: 'Program 7 Hari Menuju Sehat Raga & Jiwa',
    description: 'Program holistik 7 hari untuk kesehatan optimal',
    price: 6300000,
    category: 'Program',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '4',
    name: 'Konsultasi Kesehatan',
    description: 'Konsultasi langsung dengan ahli kesehatan',
    price: 250000,
    category: 'Konsultasi',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '5',
    name: 'Terapi Holistik',
    description: 'Terapi kesehatan secara menyeluruh',
    price: 350000,
    category: 'Terapi',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '6',
    name: 'Paket Detox',
    description: 'Program detoksifikasi tubuh alami',
    price: 500000,
    category: 'Program',
    is_active: true,
    user_id: 'default'
  },
  {
    id: '7',
    name: 'Herbal Treatment',
    description: 'Pengobatan dengan ramuan herbal alami',
    price: 275000,
    category: 'Terapi',
    is_active: true,
    user_id: 'default'
  }
]

// Get all products from localStorage
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS
  
  try {
    const saved = localStorage.getItem('products')
    if (saved) {
      return JSON.parse(saved)
    }
    // If no saved products, initialize with defaults
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS))
    return DEFAULT_PRODUCTS
  } catch (error) {
    console.error('Error loading products:', error)
    return DEFAULT_PRODUCTS
  }
}

// Get only active products for invoice form
export function getActiveProducts(): Product[] {
  return getProducts().filter(product => product.is_active)
}

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return getProducts().find(product => product.id === id)
}

// Legacy function for backward compatibility
export function getServiceOptions() {
  return getActiveProducts().map(product => ({
    value: product.id,
    label: product.name,
    price: product.price
  }))
}
