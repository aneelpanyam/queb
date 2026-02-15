'use client'

import { cn } from '@/lib/utils'
import {
  Briefcase,
  Code,
  Palette,
  BarChart3,
  Settings,
  DollarSign,
  Megaphone,
  PenTool,
  Wrench,
  Heart,
  Scale,
  GraduationCap,
  ShoppingCart,
  Headphones,
  Target,
  Users,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect } from 'react'

const iconMap: Record<string, LucideIcon> = {
  leadership: Briefcase,
  technical: Code,
  creative: Palette,
  analytical: BarChart3,
  operations: Settings,
  finance: DollarSign,
  marketing: Megaphone,
  design: PenTool,
  engineering: Wrench,
  medical: Heart,
  legal: Scale,
  education: GraduationCap,
  sales: ShoppingCart,
  support: Headphones,
  strategy: Target,
  team: Users,
}

interface Role {
  name: string
  description: string
  icon: string
}

interface Department {
  departmentName: string
  roles: Role[]
}

interface RoleSelectorProps {
  departments: Department[]
  selectedRole: string | null
  onSelect: (role: string) => void
  isLoading: boolean
}

export function RoleSelector({
  departments,
  selectedRole,
  onSelect,
  isLoading,
}: RoleSelectorProps) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())

  // Start with all departments expanded when data loads
  useEffect(() => {
    if (departments.length > 0) {
      setExpandedDepts(new Set(departments.map((d) => d.departmentName)))
    }
  }, [departments.length])

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(dept)) {
        next.delete(dept)
      } else {
        next.add(dept)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-5 w-40" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {departments.map((dept) => {
        const isExpanded = expandedDepts.has(dept.departmentName)
        const hasSelected = dept.roles.some((r) => r.name === selectedRole)

        return (
          <div
            key={dept.departmentName}
            className={cn(
              'rounded-lg border transition-colors',
              hasSelected
                ? 'border-primary/30 bg-primary/[0.02]'
                : 'border-border bg-card/50'
            )}
          >
            <button
              onClick={() => toggleDept(dept.departmentName)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {dept.departmentName}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {dept.roles.length} roles
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                {dept.roles.map((role) => {
                  const IconComponent =
                    iconMap[role.icon?.toLowerCase()] || Briefcase
                  const isSelected = selectedRole === role.name
                  return (
                    <button
                      key={role.name}
                      onClick={() => onSelect(role.name)}
                      className={cn(
                        'group flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-card/80'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm font-semibold transition-colors',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {role.name}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
