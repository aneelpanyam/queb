import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { sessionStorage as store, type SavedSession } from '@/lib/session-storage'

export function useLegacySessions(
  dissectionsRef: React.RefObject<Record<string, unknown>>,
  deeperRef: React.RefObject<Record<string, unknown>>,
) {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [viewingSession, setViewingSession] = useState<SavedSession | null>(null)

  useEffect(() => {
    setSavedSessions(store.getAll())
  }, [])

  const handleAutoSave = useCallback((data: {
    industry: string; service: string; role: string; activity: string;
    situation: string; additionalContext: { label: string; value: string }[];
    perspectives: unknown[];
    dissections: Record<string, unknown> | undefined;
    deeperQuestions: Record<string, unknown> | undefined;
  }) => {
    try {
      store.save(data as Parameters<typeof store.save>[0])
      setSavedSessions(store.getAll())
      setSaveStatus('saved')
      toast.success('Saved to History', { description: 'You can access this session anytime from History' })
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      // ignore storage errors for auto-save
    }
  }, [])

  const handleSaveSession = useCallback((data: {
    industry: string; service: string; role: string; activity: string;
    situation: string; additionalContext: { label: string; value: string }[];
    perspectives: unknown[];
  }) => {
    try {
      store.save({
        ...data,
        dissections: Object.keys(dissectionsRef.current!).length > 0 ? dissectionsRef.current as SavedSession['dissections'] : undefined,
        deeperQuestions: Object.keys(deeperRef.current!).length > 0 ? deeperRef.current as SavedSession['deeperQuestions'] : undefined,
      } as Parameters<typeof store.save>[0])
      setSavedSessions(store.getAll())
      setSaveStatus('saved')
      toast.success('Session saved', { description: 'You can access it anytime from History' })
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      toast.error('Failed to save session', { description: err instanceof Error ? err.message : 'Storage may be full' })
    }
  }, [dissectionsRef, deeperRef])

  const handleLoadSession = useCallback((session: SavedSession) => {
    if (session.dissections) {
      (dissectionsRef as React.MutableRefObject<Record<string, unknown>>).current = session.dissections as Record<string, unknown>
    } else {
      (dissectionsRef as React.MutableRefObject<Record<string, unknown>>).current = {}
    }
    if (session.deeperQuestions) {
      (deeperRef as React.MutableRefObject<Record<string, unknown>>).current = session.deeperQuestions as Record<string, unknown>
    } else {
      (deeperRef as React.MutableRefObject<Record<string, unknown>>).current = {}
    }
    setViewingSession(session)
  }, [dissectionsRef, deeperRef])

  const handleDeleteSession = useCallback((id: string) => {
    store.remove(id)
    setSavedSessions(store.getAll())
    toast.success('Session deleted')
  }, [])

  const handleDissectionUpdate = useCallback(
    (perspectiveIndex: number, questionIndex: number, data: unknown) => {
      const key = `${perspectiveIndex}-${questionIndex}`
      if (data) {
        (dissectionsRef as React.MutableRefObject<Record<string, unknown>>).current[key] = data
      } else {
        delete (dissectionsRef as React.MutableRefObject<Record<string, unknown>>).current[key]
      }
      if (viewingSession) {
        try {
          const updated = store.update(viewingSession.id, {
            dissections: Object.keys(dissectionsRef.current!).length > 0 ? dissectionsRef.current as SavedSession['dissections'] : undefined,
            deeperQuestions: Object.keys(deeperRef.current!).length > 0 ? deeperRef.current as SavedSession['deeperQuestions'] : undefined,
          })
          if (updated) {
            setViewingSession(updated)
            setSavedSessions(store.getAll())
          }
        } catch { /* Silently fail for auto-save */ }
      }
    },
    [viewingSession, dissectionsRef, deeperRef]
  )

  const handleDeeperUpdate = useCallback(
    (perspectiveIndex: number, questionIndex: number, data: unknown) => {
      (deeperRef as React.MutableRefObject<Record<string, unknown>>).current[`${perspectiveIndex}-${questionIndex}`] = data
      if (viewingSession) {
        try {
          const updated = store.update(viewingSession.id, {
            dissections: Object.keys(dissectionsRef.current!).length > 0 ? dissectionsRef.current as SavedSession['dissections'] : undefined,
            deeperQuestions: Object.keys(deeperRef.current!).length > 0 ? deeperRef.current as SavedSession['deeperQuestions'] : undefined,
          })
          if (updated) {
            setViewingSession(updated)
            setSavedSessions(store.getAll())
          }
        } catch { /* Silently fail for auto-save */ }
      }
    },
    [viewingSession, dissectionsRef, deeperRef]
  )

  const refreshSessions = useCallback(() => {
    setSavedSessions(store.getAll())
  }, [])

  return {
    savedSessions, saveStatus, setSaveStatus,
    viewingSession, setViewingSession,
    handleAutoSave, handleSaveSession,
    handleLoadSession, handleDeleteSession,
    handleDissectionUpdate, handleDeeperUpdate,
    refreshSessions,
  }
}
