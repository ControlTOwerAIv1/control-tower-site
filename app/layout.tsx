import type { Metadata } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'
import Navbar from '@/components/ui/Navbar'
import './globals.css'

const sora = Sora({ subsets: ['latin'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Control Tower — Your business, always in view.',
  description:
    'AI-powered operations intelligence. Control Tower watches every process in your business, surfaces what needs attention, and automates what it can.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.className} ${mono.variable} bg-navy text-white antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
