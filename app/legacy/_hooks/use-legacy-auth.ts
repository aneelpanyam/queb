import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

const SESSION_CHECK_INTERVAL = 60_000

export function useLegacyAuth() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const wasAuthenticated = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkingRef = useRef(false)

  useEffect(() => {
    const checkSession = async () => {
      if (checkingRef.current) return
      checkingRef.current = true
      try {
        const res = await fetch('/api/auth')
        if (res.ok) {
          setAuthenticated(true)
          wasAuthenticated.current = true
        } else {
          if (wasAuthenticated.current) {
            toast.warning('Session expired', { description: 'Please sign in again' })
            wasAuthenticated.current = false
          }
          setAuthenticated(false)
        }
      } catch {
        setAuthenticated(false)
      } finally {
        setAuthChecked(true)
        checkingRef.current = false
      }
    }
    checkSession()
    intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
      setAuthenticated(false)
      toast.info('Signed out')
    } catch {
      setAuthenticated(false)
    }
  }, [])

  return { authChecked, authenticated, setAuthenticated, handleLogout }
}
