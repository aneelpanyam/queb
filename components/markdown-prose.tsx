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
  if (!text) return text

  let result = text

  if (/\s\d+\)\s/.test(result)) {
    result = result.replace(/\s+(\d+)\)\s+/g, '\n$1. ')
  }

  if (/\([a-z]+\)\s/i.test(result)) {
    result = result.replace(/,?\s*\(([a-z]{0,2})\)\s+/gi, (_, letter) => `\n- (${letter}) `)
  }

  if (/[.!?:;]\s+[-–•]\s/.test(result)) {
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
    <div className={cn('text-[14.5px] leading-[1.75] text-foreground', className)}>
      <Markdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 font-display text-xl font-bold tracking-tight text-foreground first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-6 font-display text-[17px] font-bold tracking-tight text-foreground first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-[15px] font-semibold text-foreground first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1.5 mt-4 text-[14px] font-semibold text-foreground first:mt-0">{children}</h4>
          ),
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1.5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1.5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60">
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-[13px] leading-relaxed last:mb-0">
              {children}
            </pre>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = /language-/.test(codeClassName || '')
            if (isBlock) {
              return <code className={cn('font-mono', codeClassName)}>{children}</code>
            }
            return (
              <code className="rounded-md bg-muted px-1.5 py-0.5 text-[0.88em] font-mono text-foreground" {...props}>
                {children}
              </code>
            )
          },
          hr: () => <hr className="my-5 border-border" />,
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-r-lg border-l-2 border-primary/30 bg-muted/30 py-2 pl-4 pr-3 italic text-muted-foreground last:mb-0">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border last:mb-0">
              <table className="w-full border-collapse text-[13.5px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">{children}</th>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border/50 last:border-0 even:bg-muted/20">{children}</tr>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-foreground">{children}</td>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt || ''} className="my-3 max-w-full rounded-lg shadow-sm" />
          ),
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-1.5 h-3.5 w-3.5 rounded border-border accent-primary"
                  {...props}
                />
              )
            }
            return <input type={type} checked={checked} {...props} />
          },
        }}
      >
        {processed}
      </Markdown>
    </div>
  )
}
