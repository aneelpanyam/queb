'use client'

import { useRef, useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { MarkdownProse } from '@/components/markdown-prose'
import { Button } from '@/components/ui/button'
import {
  Bold, Italic, Heading, List, ListOrdered, Link2, Code, Quote, Eye, Pencil,
  Check, X,
} from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  onCancel?: () => void
  placeholder?: string
  minRows?: number
  autoFocus?: boolean
  className?: string
  mono?: boolean
}

type FormatAction = 'bold' | 'italic' | 'heading' | 'ul' | 'ol' | 'link' | 'code' | 'quote'

function applyFormat(
  textarea: HTMLTextAreaElement,
  action: FormatAction,
  value: string,
  onChange: (v: string) => void,
) {
  const { selectionStart: start, selectionEnd: end } = textarea
  const selected = value.slice(start, end)
  const before = value.slice(0, start)
  const after = value.slice(end)

  let newValue = value
  let cursorStart = start
  let cursorEnd = end

  switch (action) {
    case 'bold': {
      const wrapped = `**${selected || 'bold text'}**`
      newValue = before + wrapped + after
      cursorStart = start + 2
      cursorEnd = selected ? end + 2 : start + 2 + 'bold text'.length
      break
    }
    case 'italic': {
      const wrapped = `*${selected || 'italic text'}*`
      newValue = before + wrapped + after
      cursorStart = start + 1
      cursorEnd = selected ? end + 1 : start + 1 + 'italic text'.length
      break
    }
    case 'heading': {
      const lineStart = before.lastIndexOf('\n') + 1
      const linePrefix = value.slice(lineStart, start)
      const match = linePrefix.match(/^(#{1,3})\s?/)
      if (match) {
        const level = match[1].length
        if (level >= 3) {
          newValue = value.slice(0, lineStart) + linePrefix.replace(/^#{1,3}\s?/, '') + value.slice(start)
          cursorStart = start - match[0].length
          cursorEnd = cursorStart
        } else {
          const newPrefix = '#'.repeat(level + 1) + ' '
          newValue = value.slice(0, lineStart) + linePrefix.replace(/^#{1,3}\s?/, newPrefix) + value.slice(start)
          cursorStart = start + (newPrefix.length - match[0].length)
          cursorEnd = cursorStart
        }
      } else {
        const prefix = '## '
        newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
        cursorStart = start + prefix.length
        cursorEnd = cursorStart + (end - start)
      }
      break
    }
    case 'ul': {
      const lineStart = before.lastIndexOf('\n') + 1
      const lineContent = value.slice(lineStart)
      if (lineContent.startsWith('- ')) {
        newValue = value.slice(0, lineStart) + lineContent.slice(2)
        cursorStart = Math.max(start - 2, lineStart)
        cursorEnd = cursorStart
      } else {
        newValue = value.slice(0, lineStart) + '- ' + value.slice(lineStart)
        cursorStart = start + 2
        cursorEnd = cursorStart + (end - start)
      }
      break
    }
    case 'ol': {
      const lineStart = before.lastIndexOf('\n') + 1
      const lineContent = value.slice(lineStart)
      if (/^\d+\.\s/.test(lineContent)) {
        const match2 = lineContent.match(/^\d+\.\s/)!
        newValue = value.slice(0, lineStart) + lineContent.slice(match2[0].length)
        cursorStart = Math.max(start - match2[0].length, lineStart)
        cursorEnd = cursorStart
      } else {
        newValue = value.slice(0, lineStart) + '1. ' + value.slice(lineStart)
        cursorStart = start + 3
        cursorEnd = cursorStart + (end - start)
      }
      break
    }
    case 'link': {
      const text = selected || 'link text'
      const wrapped = `[${text}](url)`
      newValue = before + wrapped + after
      cursorStart = start + text.length + 3
      cursorEnd = start + text.length + 3 + 3
      break
    }
    case 'code': {
      if (selected.includes('\n')) {
        const wrapped = '```\n' + selected + '\n```'
        newValue = before + wrapped + after
        cursorStart = start + 4
        cursorEnd = start + 4 + selected.length
      } else {
        const text = selected || 'code'
        const wrapped = '`' + text + '`'
        newValue = before + wrapped + after
        cursorStart = start + 1
        cursorEnd = selected ? end + 1 : start + 1 + 'code'.length
      }
      break
    }
    case 'quote': {
      const lineStart = before.lastIndexOf('\n') + 1
      const lineContent = value.slice(lineStart)
      if (lineContent.startsWith('> ')) {
        newValue = value.slice(0, lineStart) + lineContent.slice(2)
        cursorStart = Math.max(start - 2, lineStart)
        cursorEnd = cursorStart
      } else {
        newValue = value.slice(0, lineStart) + '> ' + value.slice(lineStart)
        cursorStart = start + 2
        cursorEnd = cursorStart + (end - start)
      }
      break
    }
  }

  onChange(newValue)

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorStart, cursorEnd)
  })
}

function ToolbarButton({
  icon: Icon, label, onClick, className,
}: {
  icon: typeof Bold; label: string; onClick: () => void; className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

export function MarkdownEditor({
  value, onChange, onSave, onCancel,
  placeholder, minRows = 4, autoFocus = true, className, mono,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 22
    const minH = lineHeight * minRows + 24
    el.style.height = Math.max(minH, Math.min(el.scrollHeight, 400)) + 'px'
  }, [minRows])

  useEffect(() => {
    autoResize()
  }, [value, autoResize])

  const handleFormat = useCallback((action: FormatAction) => {
    if (!textareaRef.current) return
    applyFormat(textareaRef.current, action, value, onChange)
  }, [value, onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey

    if (mod && e.key === 'b') { e.preventDefault(); handleFormat('bold') }
    else if (mod && e.key === 'i') { e.preventDefault(); handleFormat('italic') }
    else if (mod && e.key === 'k') { e.preventDefault(); handleFormat('link') }
    else if (mod && e.key === 'Enter') { e.preventDefault(); onSave?.() }
    else if (e.key === 'Escape') { e.preventDefault(); onCancel?.() }
    else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const ta = textareaRef.current!
      const { selectionStart: s, selectionEnd: end2 } = ta
      const newVal = value.slice(0, s) + '  ' + value.slice(end2)
      onChange(newVal)
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + 2, s + 2) })
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      const ta = textareaRef.current!
      const { selectionStart: s } = ta
      const lineStart = value.lastIndexOf('\n', s - 1) + 1
      const lineContent = value.slice(lineStart)
      if (lineContent.startsWith('  ')) {
        const newVal = value.slice(0, lineStart) + lineContent.slice(2)
        onChange(newVal)
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(Math.max(s - 2, lineStart), Math.max(s - 2, lineStart)) })
      }
    }
  }, [value, onChange, onSave, onCancel, handleFormat])

  return (
    <div className={cn('overflow-hidden rounded-xl border border-input bg-background', className)}>
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1">
        <ToolbarButton icon={Bold} label="Bold (Ctrl+B)" onClick={() => handleFormat('bold')} />
        <ToolbarButton icon={Italic} label="Italic (Ctrl+I)" onClick={() => handleFormat('italic')} />
        <ToolbarButton icon={Heading} label="Heading" onClick={() => handleFormat('heading')} />
        <div className="mx-0.5 h-4 w-px bg-border" />
        <ToolbarButton icon={List} label="Bullet list" onClick={() => handleFormat('ul')} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => handleFormat('ol')} />
        <ToolbarButton icon={Quote} label="Blockquote" onClick={() => handleFormat('quote')} />
        <div className="mx-0.5 h-4 w-px bg-border" />
        <ToolbarButton icon={Link2} label="Link (Ctrl+K)" onClick={() => handleFormat('link')} />
        <ToolbarButton icon={Code} label="Code" onClick={() => handleFormat('code')} />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
            mode === 'preview'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          title={mode === 'write' ? 'Preview' : 'Edit'}
        >
          {mode === 'write' ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {mode === 'write' ? 'Preview' : 'Edit'}
        </button>
      </div>

      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'block w-full resize-none bg-transparent px-4 py-3 text-[13.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60',
            mono ? 'font-mono' : 'font-sans',
          )}
          style={{ minHeight: minRows * 22 + 24, maxHeight: 400 }}
        />
      ) : (
        <div className="min-h-[120px] px-4 py-3">
          {value.trim() ? (
            <MarkdownProse className={mono ? 'font-mono text-[13.5px]' : undefined}>{value}</MarkdownProse>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">Nothing to preview</p>
          )}
        </div>
      )}

      {(onSave || onCancel) && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2">
          {onSave && (
            <Button size="sm" onClick={onSave} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            Ctrl+Enter to save · Esc to cancel
          </span>
        </div>
      )}
    </div>
  )
}
