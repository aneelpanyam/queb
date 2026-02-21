import { useState } from 'react'
import { toast } from 'sonner'
import { configStorage } from '@/lib/setup-config-storage'
import type { SetupConfiguration } from '@/lib/setup-config-types'
import { fieldStorage, type FieldDefinition } from '@/lib/field-library'
import { outputTypeStorage, type OutputTypeDefinition } from '@/lib/output-type-library'
import { type BuilderState, emptyBuilder, configToBuilder } from '../_lib/config-builder-utils'

export function useConfigurations() {
  const [configs, setConfigs] = useState<SetupConfiguration[]>([])
  const [allFields, setAllFields] = useState<FieldDefinition[]>([])
  const [allOutputTypes, setAllOutputTypes] = useState<OutputTypeDefinition[]>([])
  const [builderMode, setBuilderMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [builderInit, setBuilderInit] = useState<BuilderState>(emptyBuilder())

  const loadData = () => {
    const fields = fieldStorage.getAll()
    const outputTypes = outputTypeStorage.getAll()
    setAllFields(fields)
    setAllOutputTypes(outputTypes)
    setConfigs(configStorage.getAll())
    return { fields, outputTypes }
  }

  const refreshFields = () => {
    setAllFields(fieldStorage.getAll())
  }

  const openCreate = () => {
    setBuilderInit(emptyBuilder())
    setEditingId(null)
    setBuilderMode('create')
  }

  const openEdit = (config: SetupConfiguration) => {
    setBuilderInit(configToBuilder(config))
    setEditingId(config.id)
    setBuilderMode('edit')
  }

  const openDuplicate = (config: SetupConfiguration) => {
    setBuilderInit({ ...configToBuilder(config), name: `${config.name} (copy)` })
    setEditingId(null)
    setBuilderMode('create')
  }

  const closeBuilder = () => {
    setBuilderMode('closed')
    setEditingId(null)
  }

  const openBuilderWithState = (builderState: BuilderState) => {
    setBuilderInit(builderState)
    setEditingId(null)
    setBuilderMode('create')
  }

  const handleSave = (data: BuilderState) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      steps: data.steps,
      outputs: data.outputs,
      generationInputs: data.generationInputs,
    }
    if (builderMode === 'create') {
      configStorage.save(payload)
      toast.success('Configuration created')
    } else if (editingId) {
      configStorage.update(editingId, payload)
      toast.success('Configuration updated')
    }
    setConfigs(configStorage.getAll())
    closeBuilder()
  }

  const handleDelete = (id: string) => {
    configStorage.remove(id)
    setConfigs(configStorage.getAll())
    toast.success('Configuration deleted')
  }

  return {
    configs, allFields, allOutputTypes,
    builderMode, builderInit, editingId,
    loadData, refreshFields,
    openCreate, openEdit, openDuplicate, closeBuilder, openBuilderWithState,
    handleSave, handleDelete,
    setConfigs,
  }
}
