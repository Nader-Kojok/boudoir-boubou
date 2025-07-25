"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Session } from "next-auth"
import { Toaster } from "@/components/ui/sonner"

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

// SessionLogger disabled to avoid client-side fetch issues
// function SessionLogger({ children }: { children: ReactNode }) {
//   return <>{children}</>
// }

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider 
      session={session} 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
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