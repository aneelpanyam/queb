'use client'

import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import type { AnswerData } from '@/lib/product-types'
import { ExternalLink, Globe, ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react'

interface QuestionAnswerProps {
  data: AnswerData
}

export function QuestionAnswer({ data }: QuestionAnswerProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(data.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Answer card */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            <Globe className="h-3.5 w-3.5" /> AI-Researched Answer
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <><CheckCheck className="h-3 w-3 text-green-500" /> Copied</>
            ) : (
              <><Copy className="h-3 w-3" /> Copy</>
            )}
          </button>
        </div>
        <div className="max-w-none text-[14px] leading-[1.75] text-foreground">
          <Markdown
            remarkPlugins={[remarkBreaks, remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mb-3 mt-5 text-lg font-bold text-foreground first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-2.5 mt-5 text-[15px] font-bold text-foreground first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-2 mt-4 text-[14px] font-bold text-foreground first:mt-0">{children}</h3>,
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1.5 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1.5 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline decoration-emerald-500/30 hover:text-emerald-700 hover:decoration-emerald-500/60 dark:text-emerald-400 dark:hover:text-emerald-300">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-emerald-500/10 px-1 py-0.5 text-[0.9em] font-mono">{children}</code>
              ),
              hr: () => <hr className="my-4 border-emerald-500/20" />,
              blockquote: ({ children }) => (
                <blockquote className="my-3 border-l-2 border-emerald-500/30 pl-4 italic text-muted-foreground">{children}</blockquote>
              ),
            }}
          >
            {data.answer}
          </Markdown>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              Sources ({data.sources.length})
            </div>
            {sourcesExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {sourcesExpanded && (
            <div className="border-t border-border px-4 pb-3 pt-2">
              <ul className="space-y-2">
                {data.sources.map((source, idx) => (
                  <li key={idx}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-foreground group-hover:text-primary">
                          {source.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {source.url}
                        </span>
                      </div>
                      <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[10px] text-muted-foreground/60">
        Researched {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}
