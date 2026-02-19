'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { productStorage } from '@/lib/product-storage'
import { getOutputType } from '@/lib/output-types'
import type { Product } from '@/lib/product-types'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  MessageSquareText,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setProducts(productStorage.getAll())
  }, [])

  const handleDelete = (id: string) => {
    productStorage.remove(id)
    setProducts(productStorage.getAll())
    toast.success('Product deleted')
  }

  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === 'draft' ? 'published' : 'draft'
    productStorage.update(product.id, { status: newStatus })
    setProducts(productStorage.getAll())
    toast.success(`Product marked as ${newStatus}`)
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />
  }

  const totalAnnotations = (p: Product) =>
    Object.values(p.annotations).reduce((sum, arr) => sum + arr.length, 0)

  const visibleElements = (p: Product) =>
    p.sections
      .filter((s) => !s.hidden)
      .reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">Question Book</h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button onClick={() => router.push('/')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Home</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</button>
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Products</button>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Digital Products</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create, curate, and annotate AI-generated content for your audience</p>
          </div>
          <Button onClick={() => router.push('/products/new')} className="gap-2">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No products yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first product by selecting a configuration and output type.
            </p>
            <Button onClick={() => router.push('/products/new')} className="mt-6 gap-2">
              <Plus className="h-4 w-4" /> Create Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const otDef = getOutputType(product.outputType)
              return (
                <div key={product.id} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${product.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {product.status}
                        </span>
                        {otDef && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {otDef.name}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">{product.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span><strong className="font-medium text-foreground">Context:</strong> {
                          product.contextFields && Object.keys(product.contextFields).length > 0
                            ? Object.values(product.contextFields).filter(Boolean).slice(0, 3).join(' · ')
                            : product.targetAudience || `${product.role} in ${product.industry}`
                        }</span>
                        <span>{visibleElements(product)} {otDef?.elementLabel.toLowerCase() || 'element'}s</span>
                        <span className="flex items-center gap-1">
                          <MessageSquareText className="h-3 w-3" />
                          {totalAnnotations(product)} annotations
                        </span>
                        <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(product)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title={product.status === 'draft' ? 'Publish' : 'Revert to draft'}>
                        {product.status === 'draft' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${product.id}`)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
