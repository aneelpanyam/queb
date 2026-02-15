'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Building2, Briefcase, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrgProfileFormProps {
  industry: string
  service: string
  onIndustryChange: (value: string) => void
  onServiceChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  suggestedIndustries: string[]
  suggestedServices: string[]
  industriesLoading: boolean
  servicesLoading: boolean
}

export function OrgProfileForm({
  industry,
  service,
  onIndustryChange,
  onServiceChange,
  onSubmit,
  isLoading,
  suggestedIndustries,
  suggestedServices,
  industriesLoading,
  servicesLoading,
}: OrgProfileFormProps) {
  const [focusField, setFocusField] = useState<'industry' | 'service' | null>(
    null
  )

  const canSubmit = industry.trim() && service.trim() && !isLoading

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-5">
        {/* Industry Field */}
        <div>
          <label
            htmlFor="industry"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Building2 className="h-4 w-4 text-primary" />
            What industry is your organization in?
          </label>
          <Input
            id="industry"
            placeholder="e.g. Healthcare, Technology, Financial Services, Education..."
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
            onFocus={() => setFocusField('industry')}
            onBlur={() => setTimeout(() => setFocusField(null), 200)}
            className="bg-card text-sm"
          />
          {/* Progress when fetching services for custom industry */}
          {industry.trim() && servicesLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>Loading services for this industry…</span>
            </div>
          )}
          {/* Industry suggestions */}
          {focusField === 'industry' && !industry.trim() && (
            <div className="mt-3">
              {industriesLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading suggestions...
                </div>
              ) : suggestedIndustries.length > 0 ? (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Common industries:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedIndustries.map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => {
                          onIndustryChange(ind)
                          setFocusField(null)
                        }}
                        className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Service Field */}
        <div>
          <label
            htmlFor="service"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Briefcase className="h-4 w-4 text-accent" />
            What service does your organization provide?
          </label>
          {/* Loading indicator for services – visible whenever we're fetching (e.g. when focused on service) */}
          {industry.trim() && servicesLoading && (
            <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>Loading services for this industry…</span>
            </div>
          )}
          <Input
            id="service"
            placeholder={
              industry.trim()
                ? `e.g. services offered in ${industry}...`
                : 'First select an industry above...'
            }
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            onFocus={() => setFocusField('service')}
            onBlur={() => setTimeout(() => setFocusField(null), 200)}
            className="bg-card text-sm"
            disabled={!industry.trim()}
          />
          {/* Service suggestions – show previous list while re-loading so it doesn't flash away */}
          {focusField === 'service' &&
            industry.trim() &&
            !service.trim() && (
              <div className="mt-3">
                {servicesLoading && suggestedServices.length === 0 ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading suggestions for {industry}...
                  </div>
                ) : suggestedServices.length > 0 ? (
                  <>
                    {servicesLoading && (
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating…
                      </div>
                    )}
                    <p className="mb-2 text-xs text-muted-foreground">
                      Common services in {industry}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedServices.map((svc) => (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => {
                            onServiceChange(svc)
                            setFocusField(null)
                          }}
                          className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                        >
                          {svc}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}
        </div>

        {/* Summary & Submit */}
        {industry.trim() && service.trim() && (
          <div
            className={cn(
              'rounded-lg border border-border bg-card p-3 transition-all',
              canSubmit && 'border-primary/30'
            )}
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Organization Profile
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {industry}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {service}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-1 w-full gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Roles...
            </>
          ) : (
            <>
              Find Roles
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
