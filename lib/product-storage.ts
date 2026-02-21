import type { Product } from './product-types'
import { installSeedData } from './seed-data'

const STORAGE_KEY = 'digicraft-products'

function getAll(): Product[] {
  if (typeof window === 'undefined') return []
  installSeedData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getById(id: string): Product | undefined {
  return getAll().find((p) => p.id === id)
}

function save(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getAll()
  const now = new Date().toISOString()
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  }
  products.unshift(newProduct)
  const trimmed = products.slice(0, 100)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return newProduct
}

function update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | undefined {
  const products = getAll()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return undefined
  const updated: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  products[index] = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  return updated
}

function remove(id: string): void {
  const products = getAll().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export const productStorage = { getAll, getById, save, update, remove }
