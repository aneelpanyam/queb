'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Loader2, AlertCircle } from 'lucide-react'

interface LoginScreenProps {
  onSuccess: () => void
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code.trim() }),
      })

      if (res.ok) {
        toast.success('Welcome to Question Book!')
        onSuccess()
      } else {
        const data = await res.json()
        const msg = data.error || 'Invalid access code'
        setError(msg)
        toast.error('Access denied', { description: msg })
      }
    } catch {
      setError('Something went wrong. Please try again.')
      toast.error('Connection error', { description: 'Could not reach the server' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-sm">
        {/* White card - Decision Explorer style */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Question Book
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-code" className="mb-1.5 block text-sm font-medium text-foreground">
                Access Code
              </label>
              <Input
                id="access-code"
                type="password"
                placeholder="••••••••"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError('')
                }}
                className="h-11 border-primary/30 focus-visible:ring-primary"
                autoFocus
                aria-label="Access code"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full gap-2"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          AI-powered thinking companion. Session expires after 15 minutes of inactivity.
        </p>
      </div>
    </div>
  )
}
