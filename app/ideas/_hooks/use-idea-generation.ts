'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ideaStorage } from '@/lib/idea-storage'
import { aiFetch } from '@/lib/ai-fetch'
import { outputTypeStorage } from '@/lib/output-type-library'
import { fieldStorage } from '@/lib/field-library'
import {
  getFrameworkDef,
  assembleIdeaDescription,
  type Idea,
  type IdeaFramework,
  type ImplementationHint,
} from '@/lib/idea-types'

export function useIdeaGeneration(reload: () => void, ideas: Idea[]) {
  const router = useRouter()

  // New idea dialog
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newFramework, setNewFramework] = useState<IdeaFramework>('problem-solution')

  // AI generation dialog
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiFramework, setAiFramework] = useState<IdeaFramework>('problem-solution')
  const [aiCount, setAiCount] = useState(5)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Config generation
  const [generatingConfigId, setGeneratingConfigId] = useState<string | null>(null)

  // Output type recommendations
  const [recommendingId, setRecommendingId] = useState<string | null>(null)

  const handleCreateIdea = () => {
    if (!newTitle.trim()) {
      toast.error('Title is required')
      return
    }
    const fw = getFrameworkDef(newFramework)
    const frameworkData: Record<string, string> = {}
    for (const f of fw.fields) frameworkData[f.key] = ''
    ideaStorage.save({
      title: newTitle.trim(),
      status: 'spark',
      framework: newFramework,
      frameworkData,
      suggestedOutputTypes: [],
      tags: [],
      notes: '',
    })
    reload()
    setShowNewDialog(false)
    setNewTitle('')
    toast.success('Idea created')
  }

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error('Enter a topic first')
      return
    }
    setAiGenerating(true)
    try {
      const data = await aiFetch('/api/generate-ideas', {
        topic: aiTopic.trim(),
        framework: aiFramework,
        count: aiCount,
        existingIdeas: ideas.map((i) => i.title),
      }, { action: 'Generate Ideas' })
      const generated = data.ideas || []
      let saved = 0
      for (const raw of generated) {
        ideaStorage.save({
          title: raw.title || 'Untitled Idea',
          status: 'spark',
          framework: aiFramework,
          frameworkData: raw.frameworkData || {},
          suggestedOutputTypes: raw.suggestedOutputTypes || [],
          tags: [],
          notes: '',
        })
        saved++
      }
      reload()
      setShowAIDialog(false)
      setAiTopic('')
      toast.success(`Generated ${saved} idea${saved !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate ideas')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleCreateConfiguration = async (idea: Idea) => {
    setGeneratingConfigId(idea.id)
    try {
      const outputTypes = outputTypeStorage.getAll()
      const fields = fieldStorage.getAll()

      const outputTypeNames: Record<string, string> = {}
      for (const ot of outputTypes) outputTypeNames[ot.id] = ot.name

      const description = assembleIdeaDescription(idea, outputTypeNames)

      const data = await aiFetch('/api/generate-configuration', {
        description,
        availableFields: fields.map((f) => ({ id: f.id, name: f.name, description: f.description, category: f.category })),
        availableOutputTypes: outputTypes.map((ot) => ({ id: ot.id, name: ot.name, description: ot.description, sectionLabel: ot.sectionLabel, elementLabel: ot.elementLabel })),
      }, { action: 'Generate Configuration' })
      const cfg = data.configuration

      ideaStorage.update(idea.id, { status: 'built' })
      reload()

      const params = new URLSearchParams({ ideaConfig: JSON.stringify(cfg), ideaId: idea.id })
      router.push(`/configurations?${params.toString()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate configuration')
    } finally {
      setGeneratingConfigId(null)
    }
  }

  const handleGetRecommendations = async (idea: Idea) => {
    setRecommendingId(idea.id)
    try {
      const outputTypes = outputTypeStorage.getAll()
      const outputTypeNames: Record<string, string> = {}
      for (const ot of outputTypes) outputTypeNames[ot.id] = ot.name

      const ideaDescription = assembleIdeaDescription(idea, outputTypeNames)

      const data = await aiFetch('/api/recommend-output-types', {
        ideaDescription,
        outputTypes: outputTypes.map((ot) => ({
          id: ot.id,
          name: ot.name,
          description: ot.description,
          sectionLabel: ot.sectionLabel,
          elementLabel: ot.elementLabel,
          supportsDeepDive: ot.supportsDeepDive,
        })),
      }, { action: 'Recommend Output Types' })

      const hint: ImplementationHint = {
        summary: data.summary || '',
        recommendations: data.recommendations || [],
        generatedAt: new Date().toISOString(),
      }

      ideaStorage.update(idea.id, {
        implementationHint: hint,
        suggestedOutputTypes: hint.recommendations.map((r: { outputTypeId: string }) => r.outputTypeId),
      })
      reload()
      toast.success('Recommendations ready')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get recommendations')
    } finally {
      setRecommendingId(null)
    }
  }

  return {
    showNewDialog, setShowNewDialog,
    newTitle, setNewTitle,
    newFramework, setNewFramework,
    handleCreateIdea,
    showAIDialog, setShowAIDialog,
    aiTopic, setAiTopic,
    aiFramework, setAiFramework,
    aiCount, setAiCount,
    aiGenerating,
    handleAIGenerate,
    generatingConfigId,
    handleCreateConfiguration,
    recommendingId,
    handleGetRecommendations,
  }
}
