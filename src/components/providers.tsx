"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Session } from "next-auth"
import { Toaster } from "@/components/ui/sonner"

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </SessionProvider>
  )
}