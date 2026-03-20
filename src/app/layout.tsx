import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { Providers } from "@/app/providers"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Clever Poppy - Ad Generator",
  description: "Generate professional ad copy and visuals with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 shrink-0 items-center px-6">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground transition-colors" />
            </header>
            <main className="flex-1 px-6 pb-8 lg:px-10">{children}</main>
          </SidebarInset>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
