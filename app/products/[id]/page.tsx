'use client'

import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/use-auth'
import { buildDirectoryProduct } from '@/lib/export-import'
import { generateCrosswordPdf } from '@/lib/crossword-pdf-export'
import { generateWorkbookPdf, type WorkbookPdfSettings } from '@/lib/workbook-pdf-export'
import { WorkbookPdfSettingsDialog } from '@/components/workbook-pdf-settings-dialog'
import { LoginScreen } from '@/components/login-screen'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

import { getContextEntries } from './_lib/product-editor-utils'
import { useProductEditor } from './_hooks/use-product-editor'
import { useProductEnrichments } from './_hooks/use-product-enrichments'
import { useProductAssistant } from './_hooks/use-product-assistant'
import { useInlineEditing } from './_hooks/use-inline-editing'
import { ProductEditorHeader } from './_components/product-editor-header'
import { ProductEditorSidebar } from './_components/product-editor-sidebar'
import { ProductDetailPanel } from './_components/product-detail-panel'
import { ProductAssistantSheet } from './_components/product-assistant-sheet'
import { ProductCoverPage } from './_components/product-cover-page'

export default function ProductEditorPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { authChecked, authenticated, setAuthenticated, handleLogout } = useAuth()

  const editor = useProductEditor(productId)
  const { product, outputTypeDef } = editor

  const markUnsaved = useCallback(() => {
    editor.setHasUnsavedChanges(true)
    editor.setSaveStatus('idle')
  }, [editor])

  const enrichments = useProductEnrichments(
    product,
    editor.dissectionMap, editor.setDissectionMap,
    editor.deeperMap, editor.setDeeperMap,
    editor.answerMap, editor.setAnswerMap,
    markUnsaved,
    editor.addCost,
  )

  const assistant = useProductAssistant(product, outputTypeDef, markUnsaved, editor.addCost)

  const inlineEdit = useInlineEditing(editor.updateElementField)

  const [exportLoading, setExportLoading] = useState(false)
  const [pdfExportLoading, setPdfExportLoading] = useState(false)
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false)

  const handleExportPdfDirect = useCallback(async () => {
    if (!product) return
    setPdfExportLoading(true)
    toast.info('Generating KDP-ready PDF...')
    try {
      const blob = await generateCrosswordPdf(product)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}-kdp.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('PDF exported!')
    } catch (err) {
      toast.error('PDF export failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setPdfExportLoading(false)
    }
  }, [product])

  const handleWorkbookPdfExport = useCallback(async (settings: WorkbookPdfSettings) => {
    if (!product) return
    setPdfExportLoading(true)
    toast.info('Generating KDP-ready PDF...')
    try {
      const blob = await generateWorkbookPdf(product, settings)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}-kdp.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('PDF exported!')
      setPdfSettingsOpen(false)
    } catch (err) {
      toast.error('PDF export failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setPdfExportLoading(false)
    }
  }, [product])

  const handleExportPdfClick = useCallback(() => {
    if (!product) return
    if (product.outputType === 'workbook') {
      setPdfSettingsOpen(true)
    } else {
      handleExportPdfDirect()
    }
  }, [product, handleExportPdfDirect])

  const handleExport = useCallback(async () => {
    if (!product || !outputTypeDef) return
    setExportLoading(true)
    toast.info('Generating product website...')
    try {
      const sections = product.sections
        .filter((s) => !s.hidden)
        .map((section) => {
          const origSIdx = product.sections.indexOf(section)
          return {
            name: section.name,
            description: section.description,
            resolvedFields: section.resolvedFields,
            elements: section.elements
              .filter((el) => !el.hidden)
              .map((el) => {
                const origEIdx = product.sections[origSIdx].elements.indexOf(el)
                const key = `${origSIdx}-${origEIdx}`
                return {
                  fields: el.fields,
                  dissection: editor.dissectionMap[key] || undefined,
                  deeperQuestions: editor.deeperMap[key] || undefined,
                  answer: editor.answerMap[key] || undefined,
                  annotations: product.annotations[key] || undefined,
                }
              }),
          }
        })

      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outputType: product.outputType,
          outputTypeDef: {
            name: outputTypeDef.name,
            sectionLabel: outputTypeDef.sectionLabel,
            elementLabel: outputTypeDef.elementLabel,
            fields: product.resolvedFields ?? outputTypeDef.fields,
            supportsDeepDive: outputTypeDef.supportsDeepDive,
            supportsDeeperQuestions: outputTypeDef.supportsDeeperQuestions,
          },
          contextEntries: getContextEntries(product),
          sections,
          productName: product.name,
          branding: product.branding,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Product exported!')
    } catch (err) {
      toast.error('Export failed', { description: err instanceof Error ? err.message : 'Please try again' })
    } finally {
      setExportLoading(false)
    }
  }, [product, outputTypeDef, editor.dissectionMap, editor.deeperMap, editor.answerMap])

  const handleExportJson = useCallback(() => {
    if (!product || !outputTypeDef) return
    const directoryProduct = buildDirectoryProduct(product, outputTypeDef, editor.dissectionMap, editor.deeperMap, editor.answerMap)
    const json = JSON.stringify(directoryProduct, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Product JSON exported!')
  }, [product, outputTypeDef, editor.dissectionMap, editor.deeperMap, editor.answerMap])

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

  if (!authenticated) return <LoginScreen onSuccess={() => setAuthenticated(true)} />

  if (editor.notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <Button variant="outline" onClick={() => router.push('/products')} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
      </div>
    )
  }

  if (!product || !outputTypeDef) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (editor.coverMode) {
    return (
      <ProductCoverPage
        product={product}
        outputTypeDef={outputTypeDef}
        onOpenEditor={() => editor.setCoverMode(false)}
        onSelectNode={(node) => { editor.setSelectedNode(node); editor.setCoverMode(false) }}
      />
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <ProductEditorHeader
        product={product}
        outputTypeDef={outputTypeDef}
        costData={editor.costData}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        saveStatus={editor.saveStatus}
        exportLoading={exportLoading}
        assistantLoading={assistant.assistantLoading}
        editingName={inlineEdit.editingName}
        nameValue={inlineEdit.nameValue}
        onBack={() => router.push('/products')}
        onSave={editor.handleSave}
        pdfExportLoading={pdfExportLoading}
        onExportHtml={handleExport}
        onExportJson={handleExportJson}
        onExportPdf={product?.outputType === 'crossword-puzzles' || product?.outputType === 'workbook' ? handleExportPdfClick : undefined}
        onAssistant={assistant.handleAssistant}
        onLogout={handleLogout}
        onStartEditName={() => { inlineEdit.setNameValue(product.name); inlineEdit.setEditingName(true) }}
        onSaveEditName={() => inlineEdit.setEditingName(false)}
        onCancelEditName={() => inlineEdit.setEditingName(false)}
        onNameValueChange={inlineEdit.setNameValue}
        onUpdateName={(name) => editor.updateProduct(() => ({ name }))}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ProductEditorSidebar
          product={product}
          outputTypeDef={outputTypeDef}
          costData={editor.costData}
          selectedNode={editor.selectedNode}
          deeperMap={editor.deeperMap}
          dissectionMap={editor.dissectionMap}
          assistantData={assistant.assistantData}
          onSelectNode={editor.setSelectedNode}
          onToggleSectionVisibility={editor.toggleSectionVisibility}
          onToggleElementVisibility={editor.toggleElementVisibility}
          onOpenAssistant={assistant.openAssistant}
          onCoverMode={() => editor.setCoverMode(true)}
        />

        <ProductDetailPanel
          product={product}
          outputTypeDef={outputTypeDef}
          selectedNode={editor.selectedNode}
          dissectionMap={editor.dissectionMap}
          deeperMap={editor.deeperMap}
          answerMap={editor.answerMap}
          assistantData={assistant.assistantData}
          dissectionLoading={enrichments.dissectionLoading}
          activeDissectKey={enrichments.activeDissectKey}
          deeperLoading={enrichments.deeperLoading}
          hiddenDissections={enrichments.hiddenDissections}
          answerLoading={enrichments.answerLoading}
          activeAnswerKey={enrichments.activeAnswerKey}
          hiddenAnswers={enrichments.hiddenAnswers}
          editingField={inlineEdit.editingField}
          editValue={inlineEdit.editValue}
          onStartEdit={inlineEdit.startEdit}
          onSaveEdit={inlineEdit.saveEdit}
          onCancelEdit={inlineEdit.cancelEdit}
          onEditValueChange={inlineEdit.setEditValue}
          onDissect={enrichments.handleDissect}
          onGoDeeper={enrichments.handleGoDeeper}
          onFindAnswer={enrichments.handleFindAnswer}
          onToggleHiddenDissection={(key) => enrichments.setHiddenDissections((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })}
          onToggleHiddenAnswer={(key) => enrichments.setHiddenAnswers((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })}
          onToggleElementVisibility={editor.toggleElementVisibility}
          onUpdateElementField={editor.updateElementField}
          onAddAnnotation={editor.addAnnotation}
          onUpdateAnnotation={editor.updateAnnotation}
          onDeleteAnnotation={editor.deleteAnnotation}
          onOpenAssistant={assistant.openAssistant}
        />
      </div>

      <ProductAssistantSheet
        product={product}
        outputTypeDef={outputTypeDef}
        open={assistant.assistantOpen}
        onOpenChange={assistant.setAssistantOpen}
        scope={assistant.assistantScope}
        onScopeChange={assistant.setAssistantScope}
        loading={assistant.assistantLoading}
        data={assistant.assistantData}
        onRunAnalysis={assistant.runAssistantAnalysis}
      />

      {product.outputType === 'workbook' && (
        <WorkbookPdfSettingsDialog
          open={pdfSettingsOpen}
          onOpenChange={setPdfSettingsOpen}
          onExport={handleWorkbookPdfExport}
          loading={pdfExportLoading}
        />
      )}
    </div>
  )
}
