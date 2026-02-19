import Link from 'next/link'
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  Users, 
  Zap,
  TrendingUp,
  Award,
  Share2,
  DollarSign,
  BarChart3,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export default function LeanCanvasPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/products" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="font-display text-lg font-bold text-foreground">
              DigiCraft
            </h1>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/products"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/configurations"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Configurations
            </Link>
            <Link
              href="/library"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Library
            </Link>
            <Link
              href="/info"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              About
            </Link>
            <span className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              Lean Canvas
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Legacy
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild><a href="/legacy">Home</a></DropdownMenuItem>
                <DropdownMenuItem asChild><a href="/legacy?view=history">History</a></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="mb-6 text-center">
          {/*<Link 
            href="/info"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Link>*/}
          <h1 className="font-display text-4xl font-bold text-balance text-foreground sm:text-5xl">
            Lean Canvas
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Our business model at a glance
          </p>
        </div>

        {/* Lean Canvas Grid */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3 lg:grid-rows-3">
          {/* Problem - Top Left */}
          <div className="rounded-xl border-2 border-red-200 bg-card p-6 shadow-sm lg:row-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Problem
              </h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Top 3 Problems:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-red-600">1.</span>
                  <span>Professionals rush to solutions without fully exploring the problem space</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">2.</span>
                  <span>Critical stakeholder perspectives are missed in decision-making</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">3.</span>
                  <span>Lack of structured frameworks for systematic situation analysis</span>
                </li>
              </ul>
              <p className="pt-2 text-xs italic">
                Existing Alternatives: Generic checklist templates, manual brainstorming, static question frameworks
              </p>
            </div>
          </div>

          {/* Solution - Top Middle */}
          <div className="rounded-xl border-2 border-green-200 bg-card p-6 shadow-sm lg:row-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Solution
              </h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Top 3 Features:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-green-600">1.</span>
                  <span>AI-generated questions tailored to your specific role, activity, and situation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">2.</span>
                  <span>Multi-perspective analysis covering technical, business, UX, operations, and more</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">3.</span>
                  <span>Deep exploration tools: thinking frameworks, checklists, second/third-order questions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Unique Value Proposition - Top Right */}
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 shadow-sm lg:row-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Unique Value Proposition
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-base font-semibold text-foreground">
                Context-aware AI questioning that thinks like a coach, not a chatbot
              </p>
              <p className="text-sm text-muted-foreground">
                Unlike generic AI assistants or static templates, DigiCraft generates deeply contextual digital products organized by stakeholder perspectives, with the ability to dive infinitely deeper into any area that matters.
              </p>
              <div className="rounded-lg bg-primary/10 p-3 text-xs text-foreground">
                <strong>Single Clear Message:</strong> Get the questions you didn't know you needed to ask
              </div>
            </div>
          </div>

          {/* Customer Segments - Middle Left */}
          <div className="rounded-xl border-2 border-purple-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Customer Segments
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Target Customers:</p>
              <ul className="space-y-1 pl-4">
                <li>• Product managers planning features</li>
                <li>• Consultants analyzing client situations</li>
                <li>• Team leads making decisions</li>
                <li>• Coaches guiding clients</li>
              </ul>
              <p className="pt-2 text-xs font-medium text-foreground">
                Early Adopters: Decision-makers who value thorough thinking
              </p>
            </div>
          </div>

          {/* Key Metrics - Middle Center */}
          <div className="rounded-xl border-2 border-blue-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Key Metrics
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1.5">
                <li>• Active users per month</li>
                <li>• Products generated</li>
                <li>• Deep dives per session</li>
                <li>• Exported question sets</li>
                <li>• Session retention rate</li>
                <li>• Time saved vs. manual analysis</li>
              </ul>
            </div>
          </div>

          {/* Unfair Advantage - Middle Right */}
          <div className="rounded-xl border-2 border-amber-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Unfair Advantage
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1.5">
                <li>• Proprietary perspective framework based on stakeholder theory</li>
                <li>• Context-aware AI prompting that improves with use</li>
                <li>• Deep integration between questions and exploration tools</li>
                <li>• Export capability creates viral sharing</li>
              </ul>
            </div>
          </div>

          {/* Channels - Bottom Left */}
          <div className="rounded-xl border-2 border-teal-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
                <Share2 className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Channels
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1.5">
                <li>• Direct web app access</li>
                <li>• Exported HTML products (viral)</li>
                <li>• Professional networks (LinkedIn)</li>
                <li>• Consulting/coaching communities</li>
                <li>• Product management forums</li>
              </ul>
            </div>
          </div>

          {/* Cost Structure - Bottom Center */}
          <div className="rounded-xl border-2 border-orange-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Cost Structure
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1.5">
                <li>• AI API costs (variable)</li>
                <li>• Cloud hosting infrastructure</li>
                <li>• Development & maintenance</li>
                <li>• Customer support</li>
              </ul>
            </div>
          </div>

          {/* Revenue Streams - Bottom Right */}
          <div className="rounded-xl border-2 border-emerald-200 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Revenue Streams
              </h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1.5">
                <li>• Freemium model (limited free use)</li>
                <li>• Professional subscriptions</li>
                <li>• Team/enterprise licenses</li>
                <li>• API access for integrations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="text-center">
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Ask Better Questions?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start exploring your next challenge with AI-powered perspective-based questioning
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>DigiCraft - AI-Powered Digital Product Creation</p>
      </footer>
    </div>
  )
}
