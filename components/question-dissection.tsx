'use client'

import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Lightbulb,
  Wrench,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  Library,
} from 'lucide-react'

interface ThinkingStep {
  step: number
  title: string
  description: string
}

interface ChecklistItem {
  item: string
  description: string
  isRequired: boolean
}

interface Resource {
  title: string
  type: string
  url: string
  description: string
}

interface DissectionData {
  thinkingFramework: ThinkingStep[]
  checklist: ChecklistItem[]
  resources: Resource[]
  keyInsight: string
}

interface QuestionDissectionProps {
  data: DissectionData
}

const typeIcons: Record<string, typeof BookOpen> = {
  Blog: FileText,
  Book: BookOpen,
  Tool: Wrench,
  Framework: BarChart3,
  Report: FileText,
  Course: GraduationCap,
  Community: Users,
}

const typeColors: Record<string, string> = {
  Blog: 'bg-emerald-500/10 text-emerald-400',
  Book: 'bg-amber-500/10 text-amber-400',
  Tool: 'bg-primary/10 text-primary',
  Framework: 'bg-purple-500/10 text-purple-400',
  Report: 'bg-rose-500/10 text-rose-400',
  Course: 'bg-teal-500/10 text-teal-400',
  Community: 'bg-indigo-500/10 text-indigo-400',
}

export function QuestionDissection({ data }: QuestionDissectionProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const completedCount = checkedItems.size
  const totalRequired = data.checklist.filter((c) => c.isRequired).length

  return (
    <div className="mt-4 space-y-6">
      {/* Thinking Framework */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Lightbulb className="h-4 w-4 text-primary" />
          Thinking Framework
        </h4>
        <div className="space-y-2">
          {data.thinkingFramework.map((step) => (
            <div
              key={step.step}
              className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                {step.step}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Action Checklist
          </h4>
          <span className="text-xs text-muted-foreground">
            {completedCount} / {data.checklist.length} done
            {totalRequired > 0 && (
              <span className="ml-1 text-primary">
                ({totalRequired} required)
              </span>
            )}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{
              width: `${data.checklist.length > 0 ? (completedCount / data.checklist.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="space-y-1.5">
          {data.checklist.map((item, idx) => {
            const isChecked = checkedItems.has(idx)
            return (
              <button
                key={idx}
                onClick={() => toggleCheck(idx)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-left group"
              >
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    >
                      {item.item}
                    </p>
                    {item.isRequired && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Library className="h-4 w-4 text-primary" />
          Resources
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.resources.map((resource, idx) => {
            const Icon = typeIcons[resource.type] || BookOpen
            const colorClass =
              typeColors[resource.type] || 'bg-primary/10 text-primary'
            return (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${colorClass}`}
                  >
                    <Icon className="h-3 w-3" />
                    {resource.type}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {resource.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </a>
            )
          })}
        </div>
      </div>

      {/* Key Insight */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
          Key Insight
        </p>
        <p className="text-sm leading-relaxed text-foreground">
          {data.keyInsight}
        </p>
      </div>
    </div>
  )
}
