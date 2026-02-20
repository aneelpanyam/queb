'use client'

import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

/**
 * Normalize AI-generated text that contains inline numbered items
 * (e.g. "...intro: 1) First thing. 2) Second thing.") into proper
 * markdown list formatting so the parser can render them as lists.
 * Only activates when the text has zero newlines — if the AI already
 * formatted with newlines we leave it untouched.
 */
function normalizeInlineLists(text: string): string {
  if (!text || text.includes('\n')) return text

  const hasNumberedItems = /\s\d+\)\s/.test(text)
  const hasBulletItems = /[.!?:;]\s+[-–•]\s/.test(text)
  if (!hasNumberedItems && !hasBulletItems) return text

  let result = text
  if (hasNumberedItems) {
    result = result.replace(/\s+(\d+)\)\s+/g, '\n$1. ')
  }
  if (hasBulletItems) {
    result = result.replace(/([.!?:;])\s+([-–•])\s+/g, '$1\n$2 ')
  }
  return result
}

interface MarkdownProseProps {
  children: string
  className?: string
}

export function MarkdownProse({ children, className }: MarkdownProseProps) {
  const processed = normalizeInlineLists(children)

  return (
    <div className={cn('text-[14px] leading-relaxed text-foreground', className)}>
      <Markdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-lg font-bold text-foreground first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-5 text-[15px] font-bold text-foreground first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-[14px] font-bold text-foreground first:mt-0">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 text-[0.9em] font-mono">{children}</code>
          ),
          hr: () => <hr className="my-4 border-border" />,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-primary/30 pl-4 italic text-muted-foreground">{children}</blockquote>
          ),
        }}
      >
        {processed}
      </Markdown>
    </div>
  )
}
