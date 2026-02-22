'use client'

import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/product-types'
import { fieldAsString } from '@/lib/product-types'
import type { OutputTypeDefinition } from '@/lib/output-types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, ChevronRight, Hash, MessageSquareText, Pencil } from 'lucide-react'
import {
  type SelectedNode,
  SECTION_NAV_TYPES, getContextEntries, getSectionPrimaryKey, getOutputTypeIcon, stripLeadingNumber,
} from '../_lib/product-editor-utils'

interface ProductCoverPageProps {
  product: Product
  outputTypeDef: OutputTypeDefinition
  onOpenEditor: () => void
  onSelectNode: (node: SelectedNode) => void
}

export function ProductCoverPage({ product, outputTypeDef, onOpenEditor, onSelectNode }: ProductCoverPageProps) {
  const router = useRouter()
  const TypeIcon = getOutputTypeIcon(product.outputType)
  const contextEntries = getContextEntries(product)
  const useSectionNav = SECTION_NAV_TYPES.has(product.outputType)
  const visibleSections = product.sections.filter((s) => !s.hidden)
  const sectionCount = visibleSections.length
  const elementCount = visibleSections.reduce((sum, s) => sum + s.elements.filter((el) => !el.hidden).length, 0)
  const annotationCount = Object.values(product.annotations).reduce((sum, arr) => sum + arr.length, 0)

  const handleSectionClick = (sIndex: number, eIndex?: number) => {
    if (eIndex !== undefined) {
      onSelectNode({ type: 'element', sIndex, eIndex })
    } else if (useSectionNav) {
      onSelectNode({ type: 'section', sIndex })
    } else {
      const firstVisible = product.sections[sIndex].elements.findIndex((el) => !el.hidden)
      if (firstVisible >= 0) {
        onSelectNode({ type: 'element', sIndex, eIndex: firstVisible })
      }
    }
    onOpenEditor()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center gap-3 px-6 py-3">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Products
        </button>
      </div>

      {/* Hero section */}
      <div className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-primary/[0.04] via-primary/[0.02] to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/10">
            <TypeIcon className="h-8 w-8 text-primary" />
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>

          <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/10">
            <TypeIcon className="h-3.5 w-3.5" />
            {outputTypeDef.name}
          </div>

          {(() => {
            if (product.description) {
              return (
                <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )
            }
            const ctx = contextEntries
            if (ctx.length > 0) {
              const summary = ctx.map((e) => e.value).join(' \u00B7 ')
              return (
                <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed text-muted-foreground/80">
                  {outputTypeDef.name} covering <span className="font-medium text-muted-foreground">{summary}</span>
                </p>
              )
            }
            return null
          })()}

          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <strong className="font-semibold text-foreground">{sectionCount}</strong>
              {useSectionNav
                ? (sectionCount === 1 ? 'checklist' : 'checklists')
                : (sectionCount === 1 ? outputTypeDef.sectionLabel.toLowerCase() : `${outputTypeDef.sectionLabel.toLowerCase()}s`)}
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Pencil className="h-3.5 w-3.5" />
              <strong className="font-semibold text-foreground">{elementCount}</strong>
              {elementCount === 1 ? outputTypeDef.elementLabel.toLowerCase() : `${outputTypeDef.elementLabel.toLowerCase()}s`}
            </div>
            {annotationCount > 0 && (<>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageSquareText className="h-3.5 w-3.5" />
                <strong className="font-semibold text-foreground">{annotationCount}</strong>
                annotation{annotationCount !== 1 ? 's' : ''}
              </div>
            </>)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto">
        <div className="w-full max-w-6xl px-6 py-10">

          {/* Context fields */}
          {contextEntries.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {contextEntries.map((e) => (
                <div key={e.label} className="rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{e.label}</div>
                  <div className="mt-1 text-[15px] font-semibold text-foreground">{e.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Table of Contents */}
          <div className={contextEntries.length > 0 ? 'mt-10' : ''}>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Table of Contents
              </h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="space-y-0.5">
              {product.sections.map((section, sIndex) => {
                if (section.hidden) return null
                const visibleElements = section.elements.filter((el) => !el.hidden)
                const sectionPK = getSectionPrimaryKey(product, outputTypeDef, sIndex)

                return (
                  <div key={sIndex}>
                    <button
                      onClick={() => handleSectionClick(sIndex)}
                      className="group flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-all hover:bg-muted/70"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary">
                        {sIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-display text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
                          {stripLeadingNumber(section.name)}
                        </span>
                        {section.description && (
                          <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">{section.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground/50">
                        {visibleElements.length} {visibleElements.length === 1
                          ? (outputTypeDef.elementLabel?.toLowerCase() || 'item')
                          : `${outputTypeDef.elementLabel?.toLowerCase() || 'item'}s`}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>

                    {!useSectionNav && visibleElements.length > 0 && (
                      <div className="ml-[52px] border-l border-border/40 pl-4 pb-2">
                        {visibleElements.slice(0, 5).map((el, eIndex) => {
                          const realEIndex = product.sections[sIndex].elements.indexOf(el)
                          const label = stripLeadingNumber(fieldAsString(el.fields[sectionPK]) || fieldAsString(Object.values(el.fields)[0]) || '(empty)')
                          return (
                            <button
                              key={eIndex}
                              onClick={() => handleSectionClick(sIndex, realEIndex)}
                              className="group/el flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            >
                              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/40">{sIndex + 1}.{eIndex + 1}</span>
                              <span className="min-w-0 flex-1 truncate">{label}</span>
                            </button>
                          )
                        })}
                        {visibleElements.length > 5 && (
                          <button
                            onClick={() => handleSectionClick(sIndex)}
                            className="ml-2.5 py-1 text-[12px] font-medium text-primary hover:underline"
                          >
                            +{visibleElements.length - 5} more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center gap-4 pb-6">
            <Button onClick={onOpenEditor} size="lg" className="gap-2.5 rounded-xl px-10 py-6 text-base shadow-md transition-shadow hover:shadow-lg">
              <BookOpen className="h-5 w-5" />
              Open Editor
            </Button>
            <p className="text-xs text-muted-foreground">or click any section above to jump in</p>
          </div>
        </div>
      </div>
    </div>
  )
}
