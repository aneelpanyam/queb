import { useState } from 'react'

export function useInlineEditing(
  updateElementField: (sIndex: number, eIndex: number, fieldKey: string, value: string) => void,
) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const startEdit = (fieldKey: string, currentValue: string) => {
    setEditingField(fieldKey)
    setEditValue(currentValue)
  }

  const saveEdit = (sIndex: number, eIndex: number, fieldKey: string) => {
    if (editValue.trim()) {
      updateElementField(sIndex, eIndex, fieldKey, editValue.trim())
    }
    setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  return {
    editingField, editValue, setEditValue,
    editingName, setEditingName,
    nameValue, setNameValue,
    startEdit, saveEdit, cancelEdit,
  }
}
