'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { productStorage } from '@/lib/product-storage'
import { getOutputType, getOutputTypes } from '@/lib/output-types'
import { configStorage } from '@/lib/setup-config-storage'
import type { Product } from '@/lib/product-types'
import { formatCost } from '@/lib/ai-pricing'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  MessageSquareText,
  Coins,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  LayoutGrid,
  Download,
  Upload,
  Check,
} from 'lucide-react'
import { downloadJson, buildFilename, openFilePicker, readJsonFile, type ExportBundle } from '@/lib/export-import'

type GroupBy = 'none' | 'outputType' | 'configuration' | 'status'
type SortBy = 'updated' | 'created' | 'name'
type StatusFilter = 'all' | 'draft' | 'published'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ProductsPage() {
  const router = useRouter()
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [configs, setConfigs] = useState<SetupConfiguration[]>([])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [outputTypeFilter, setOutputTypeFilter] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  useEffect(() => {
    setProducts(productStorage.getAll())
    setConfigs(configStorage.getAll())
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

  const handleExportAll = () => {
    if (products.length === 0) { toast.error('No products to export'); return }
    const bundle: ExportBundle<Product> = {
      version: 1, type: 'products', exportedAt: new Date().toISOString(), items: products,
    }
    downloadJson(bundle, buildFilename('products', products.length))
    toast.success(`Exported ${products.length} product${products.length !== 1 ? 's' : ''}`)
  }

  const handleExportSelected = () => {
    const selected = products.filter((p) => selectedForExport.has(p.id))
    if (selected.length === 0) { toast.error('No products selected'); return }
    const bundle: ExportBundle<Product> = {
      version: 1, type: 'products', exportedAt: new Date().toISOString(), items: selected,
    }
    downloadJson(bundle, buildFilename('products', selected.length))
    toast.success(`Exported ${selected.length} product${selected.length !== 1 ? 's' : ''}`)
    setSelectMode(false)
    setSelectedForExport(new Set())
  }

  const handleImport = async () => {
    try {
      const file = await openFilePicker()
      if (!file) return
      const bundle = await readJsonFile<Product>(file)
      if (bundle.type !== 'products' && bundle.type !== 'full-backup') {
        toast.error('Wrong file type — expected a products export')
        return
      }
      const existingIds = new Set(products.map((p) => p.id))
      let imported = 0
      let skipped = 0
      for (const item of bundle.items) {
        if (!item.id || !item.name || !item.sections) { skipped++; continue }
        if (existingIds.has(item.id)) {
          productStorage.update(item.id, item)
        } else {
          const raw = localStorage.getItem('digicraft-products')
          const all: Product[] = raw ? JSON.parse(raw) : []
          all.unshift(item)
          localStorage.setItem('digicraft-products', JSON.stringify(all.slice(0, 100)))
        }
        imported++
      }
      setProducts(productStorage.getAll())
      if (imported > 0) toast.success(`Imported ${imported} product${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`)
      else toast.error('No valid products found in the file')
    } catch (err) {
      toast.error('Import failed', { description: err instanceof Error ? err.message : 'Invalid file' })
    }
  }

  const toggleExportSelect = (id: string) => {
    setSelectedForExport((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const outputTypes = useMemo(() => getOutputTypes(), [])
  const usedOutputTypes = useMemo(
    () => [...new Set(products.map((p) => p.outputType))],
    [products]
  )
  const usedConfigIds = useMemo(
    () => [...new Set(products.map((p) => p.configurationId).filter(Boolean))],
    [products]
  )

  const filtered = useMemo(() => {
    let result = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          Object.values(p.contextFields || {}).some((v) => v?.toLowerCase().includes(q)) ||
          p.industry?.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    if (outputTypeFilter !== 'all') {
      result = result.filter((p) => p.outputType === outputTypeFilter)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [products, search, statusFilter, outputTypeFilter, sortBy])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { '': filtered }

    const groups: Record<string, Product[]> = {}
    for (const product of filtered) {
      let key: string
      switch (groupBy) {
        case 'outputType': {
          const otDef = getOutputType(product.outputType)
          key = otDef?.name || product.outputType || 'Unknown'
          break
        }
        case 'configuration': {
          const cfg = configs.find((c) => c.id === product.configurationId)
          key = cfg?.name || (product.configurationId ? 'Deleted configuration' : 'No configuration')
          break
        }
        case 'status':
          key = product.status === 'published' ? 'Published' : 'Draft'
          break
        default:
          key = ''
      }
      ;(groups[key] ??= []).push(product)
    }
    return groups
  }, [filtered, groupBy, configs])

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalAnnotations = (p: Product) =>
    Object.values(p.annotations).reduce((sum, arr) => sum + arr.length, 0)

  const visibleElements = (p: Product) =>
    p.sections
      .filter((s) => !s.hidden)
      .reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)

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

  const hasFilters = search || statusFilter !== 'all' || outputTypeFilter !== 'all'
  const groupEntries = Object.entries(grouped)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/products')} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="font-display text-lg font-bold text-foreground">DigiCraft</h1>
            </button>
            <nav className="hidden items-center gap-1 sm:flex">
              <button onClick={() => router.push('/ideas')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Ideas</button>
              <button className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Products</button>
              <button onClick={() => router.push('/configurations')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Configurations</button>
              <button onClick={() => router.push('/library')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Library</button>
              <button onClick={() => router.push('/info')} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    Legacy
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => router.push('/legacy')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/legacy?view=history')}>History</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Digital Products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''} &middot; Create, curate, and annotate AI-generated content
            </p>
          </div>
          <Button onClick={() => router.push('/products/new')} className="gap-2">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>

        {/* Export/Import toolbar */}
        {products.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport} className="h-8 gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll} className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export All
            </Button>
            {!selectMode ? (
              <Button variant="ghost" size="sm" onClick={() => setSelectMode(true)} className="h-8 gap-1.5 text-xs text-muted-foreground">
                Export Selected...
              </Button>
            ) : (
              <>
                <div className="h-5 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {selectedForExport.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={handleExportSelected} disabled={selectedForExport.size === 0} className="h-8 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export {selectedForExport.size > 0 ? selectedForExport.size : ''}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); setSelectedForExport(new Set()) }} className="h-8 text-xs text-muted-foreground">
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}

        {/* Filter & Group Bar */}
        {products.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-8 pl-8 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              {/* Output Type Filter */}
              {usedOutputTypes.length > 1 && (
                <select
                  value={outputTypeFilter}
                  onChange={(e) => setOutputTypeFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All types</option>
                  {usedOutputTypes.map((otId) => {
                    const otDef = getOutputType(otId)
                    return (
                      <option key={otId} value={otId}>
                        {otDef?.name || otId}
                      </option>
                    )
                  })}
                </select>
              )}

              <div className="h-5 w-px bg-border" />

              {/* Group By */}
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={groupBy}
                  onChange={(e) => { setGroupBy(e.target.value as GroupBy); setCollapsedGroups(new Set()) }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="none">No grouping</option>
                  <option value="outputType">Group by output type</option>
                  {usedConfigIds.length > 0 && <option value="configuration">Group by configuration</option>}
                  <option value="status">Group by status</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="updated">Last updated</option>
                  <option value="created">Date created</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setOutputTypeFilter('all') }}
                  className="h-8 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results summary */}
            {hasFilters && (
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No products yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first product by selecting a configuration and output type.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={handleImport} className="gap-2">
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button onClick={() => router.push('/products/new')} className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Product
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">No matching products</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupEntries.map(([groupKey, groupProducts]) => {
              const isCollapsed = collapsedGroups.has(groupKey)
              const showGroupHeader = groupBy !== 'none' && groupKey

              return (
                <div key={groupKey || '__ungrouped'}>
                  {showGroupHeader && (
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="mb-2 flex w-full items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold text-foreground">{groupKey}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {groupProducts.length}
                      </span>
                    </button>
                  )}

                  {!isCollapsed && (
                    <div className="space-y-2">
                      {groupProducts.map((product) => {
                        const otDef = getOutputType(product.outputType)
                        const cfg = configs.find((c) => c.id === product.configurationId)
                        const annCount = totalAnnotations(product)
                        const elemCount = visibleElements(product)

                        return (
                          <div
                            key={product.id}
                            className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 cursor-pointer"
                            onClick={() => selectMode ? toggleExportSelect(product.id) : router.push(`/products/${product.id}`)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              {selectMode && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleExportSelect(product.id) }}
                                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${selectedForExport.has(product.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                                >
                                  {selectedForExport.has(product.id) && <Check className="h-3 w-3" />}
                                </button>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2 flex-wrap">
                                  <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${product.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                    {product.status}
                                  </span>
                                  {otDef && (
                                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                      {otDef.name}
                                    </span>
                                  )}
                                  {cfg && (
                                    <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                      {cfg.name}
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
                                  <span>{elemCount} {otDef?.elementLabel?.toLowerCase() || 'element'}{elemCount !== 1 ? 's' : ''}</span>
                                  {annCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <MessageSquareText className="h-3 w-3" />
                                      {annCount} annotation{annCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {product.costData && product.costData.totalCost > 0 && (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                      <Coins className="h-3 w-3" />
                                      {formatCost(product.costData.totalCost)}
                                    </span>
                                  )}
                                </div>
                                {/* Timestamps */}
                                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground/70">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Created {relativeTime(product.createdAt)}
                                  </span>
                                  {product.updatedAt !== product.createdAt && (
                                    <span>
                                      Updated {relativeTime(product.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
