import Link from 'next/link'
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="font-display text-lg font-bold text-foreground">
              Question Book
            </h1>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Home
            </Link>
            <span className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              About
            </span>
            <Link
              href="/info/lean-canvas"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Lean Canvas
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-full px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-balance text-foreground sm:text-5xl">
            Better Questions, Better Decisions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            An AI-powered tool that helps you think more deeply about your work
          </p>
          {/*<div className="mt-6 flex justify-center">
            <Link href="/info/lean-canvas">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                View Lean Canvas
              </Button>
            </Link>
          </div>*/}  
        </div>

        {/* The Problem Section */}
        <section className="mb-8">
          <div className="rounded-xl border-2 border-red-200 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                The Problem
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-base sm:text-lg">
                In today's complex work environment, professionals face decisions that require thoughtful consideration from multiple angles. Yet, we often:
              </p>
              <ul className="space-y-3 pl-6">
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-foreground">Rush to solutions</strong> without fully understanding the problem space</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-foreground">Miss critical perspectives</strong> from stakeholders who will be affected by our decisions</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-foreground">Overlook important questions</strong> that could reveal risks or opportunities</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                  <span><strong className="text-foreground">Lack structured frameworks</strong> for exploring complex situations</span>
                </li>
              </ul>
              <p className="text-base sm:text-lg">
                The result? Incomplete analysis, missed opportunities, and decisions that fail to account for important factors.
              </p>
            </div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="mb-8">
          <div className="rounded-xl border-2 border-green-200 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Our Solution
              </h2>
            </div>
            <div className="space-y-6 text-muted-foreground">
              <p className="text-base sm:text-lg">
                Question Book uses AI to generate contextually relevant questions from multiple perspectives, helping you explore your challenges systematically and thoroughly.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Multi-Perspective Analysis</h3>
                  </div>
                  <p className="text-sm">
                    Every situation is viewed through different lenses: technical, business, user experience, operations, and more. This ensures comprehensive understanding.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-background/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Context-Specific Questions</h3>
                  </div>
                  <p className="text-sm">
                    Questions are tailored to your specific role, activity, industry, and situation. Not generic, but deeply relevant to what you're actually working on.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-background/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Deep Exploration Tools</h3>
                  </div>
                  <p className="text-sm">
                    For any question, you can dive deeper with dissection tools, thinking frameworks, checklists, and second/third-order questions to uncover hidden insights.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-background/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Reusable Question Banks</h3>
                  </div>
                  <p className="text-sm">
                    Save your question sets for later use, export as standalone websites, and build a library of thinking tools for your most common activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-8">
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                How It Works
              </h2>
            </div>
            <div className="space-y-4">
              <ol className="space-y-4 text-sm sm:text-base">
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                  <div>
                    <strong className="text-foreground">Define your context:</strong>
                    <span className="text-muted-foreground"> Tell us about your organization, role, and what you're working on</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                  <div>
                    <strong className="text-foreground">Pick your activity:</strong>
                    <span className="text-muted-foreground"> Select from role-specific activities generated for your context</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                  <div>
                    <strong className="text-foreground">Describe your situation:</strong>
                    <span className="text-muted-foreground"> Add specific details about your current challenge or opportunity</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</span>
                  <div>
                    <strong className="text-foreground">Generate your question book:</strong>
                    <span className="text-muted-foreground"> AI creates perspective-organized questions tailored to your needs</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">5</span>
                  <div>
                    <strong className="text-foreground">Explore and enrich:</strong>
                    <span className="text-muted-foreground"> Dive deeper into any question with frameworks, checklists, and follow-up questions</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="mb-12">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Who Is This For?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/50 p-5 text-center">
                <h3 className="mb-2 font-semibold text-foreground">Decision Makers</h3>
                <p className="text-sm text-muted-foreground">
                  Leaders who need to explore complex situations from multiple angles before making critical decisions
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-5 text-center">
                <h3 className="mb-2 font-semibold text-foreground">Project Teams</h3>
                <p className="text-sm text-muted-foreground">
                  Teams who want structured frameworks to analyze requirements, risks, and opportunities together
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-5 text-center">
                <h3 className="mb-2 font-semibold text-foreground">Consultants & Coaches</h3>
                <p className="text-sm text-muted-foreground">
                  Professionals who help others think through complex situations and need powerful questioning tools
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Ask Better Questions?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start exploring your next challenge with AI-powered perspective-based questioning
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Create Your Question Book
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Question Book - AI-Powered Decision Support</p>
      </footer>
    </div>
  )
}
