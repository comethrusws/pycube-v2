import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

// Optimize font loading with display swap and preload
const geistSans = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload the main font
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: "Pycube",
  description: "Intelligent Location System for Asset Management",
  // Add performance hints
  other: {
    'viewport': 'width=device-width, initial-scale=1, viewport-fit=cover',
  }
}

// Optimized toast configuration to prevent re-renders
const toastOptions = {
  duration: 4000,
  style: {
    background: '#fff',
    color: '#333',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
} as const

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="smooth-scroll">
      <head>
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${geistSans.className} bg-background text-foreground antialiased contain-layout`}>
        <div id="root" className="gpu-accelerated">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={toastOptions}
          containerClassName="animate-optimized"
        />
      </body>
    </html>
  )
}
