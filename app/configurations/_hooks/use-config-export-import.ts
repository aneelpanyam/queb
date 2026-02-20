import { useState } from 'react'
import { toast } from 'sonner'
import { configStorage } from '@/lib/setup-config-storage'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import { downloadJson, buildFilename, openFilePicker, readJsonFile, type ExportBundle } from '@/lib/export-import'

export function useConfigExportImport(
  configs: SetupConfiguration[],
  onRefresh: () => void,
) {
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  const handleExportAll = () => {
    if (configs.length === 0) { toast.error('No configurations to export'); return }
    const bundle: ExportBundle<SetupConfiguration> = {
      version: 1, type: 'configurations', exportedAt: new Date().toISOString(), items: configs,
    }
    downloadJson(bundle, buildFilename('configurations', configs.length))
    toast.success(`Exported ${configs.length} configuration${configs.length !== 1 ? 's' : ''}`)
  }

  const handleExportSelected = () => {
    const selected = configs.filter((c) => selectedForExport.has(c.id))
    if (selected.length === 0) { toast.error('No configurations selected'); return }
    const bundle: ExportBundle<SetupConfiguration> = {
      version: 1, type: 'configurations', exportedAt: new Date().toISOString(), items: selected,
    }
    downloadJson(bundle, buildFilename('configurations', selected.length))
    toast.success(`Exported ${selected.length} configuration${selected.length !== 1 ? 's' : ''}`)
    setSelectMode(false)
    setSelectedForExport(new Set())
  }

  const handleImport = async () => {
    try {
      const file = await openFilePicker()
      if (!file) return
      const bundle = await readJsonFile<SetupConfiguration>(file)
      if (bundle.type !== 'configurations' && bundle.type !== 'full-backup') {
        toast.error('Wrong file type — expected a configurations export')
        return
      }
      const existingIds = new Set(configs.map((c) => c.id))
      let imported = 0
      let skipped = 0
      for (const item of bundle.items) {
        if (!item.id || !item.name || !item.steps) { skipped++; continue }
        if (existingIds.has(item.id)) {
          configStorage.update(item.id, item)
        } else {
          const raw = localStorage.getItem('queb-setup-configurations')
          const all: SetupConfiguration[] = raw ? JSON.parse(raw) : []
          all.unshift(item)
          localStorage.setItem('queb-setup-configurations', JSON.stringify(all.slice(0, 200)))
        }
        imported++
      }
      onRefresh()
      if (imported > 0) toast.success(`Imported ${imported} configuration${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`)
      else toast.error('No valid configurations found in the file')
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

  const cancelSelectMode = () => {
    setSelectMode(false)
    setSelectedForExport(new Set())
  }

  return {
    selectedForExport, selectMode, setSelectMode,
    handleExportAll, handleExportSelected, handleImport,
    toggleExportSelect, cancelSelectMode,
  }
}
