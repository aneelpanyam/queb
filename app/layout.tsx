import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'DigiCraft - AI-Powered Digital Product Creation',
  description:
    'Create AI-powered digital products like question books, checklists, email courses, and more. Your digital product crafting platform.',
}

export const viewport: Viewport = {
  themeColor: '#1E61A1',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
        <Toaster 
          theme="light" 
          position="bottom-right" 
          closeButton 
          toastOptions={{
            classNames: {
              toast: 'bg-card border-border text-foreground shadow-lg',
              description: 'text-foreground/80',
              success: 'bg-card border-green-500/20 text-foreground',
              error: 'bg-card border-red-500/20 text-foreground',
              warning: 'bg-card border-amber-500/20 text-foreground',
              info: 'bg-card border-primary/20 text-foreground',
            },
          }}
        />
      </body>
    </html>
  )
}
