"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Session } from "next-auth"

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  )
}