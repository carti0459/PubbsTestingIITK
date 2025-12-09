'use client'

import { OperatorProvider } from "@/contexts/OperatorContext"

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OperatorProvider>
      {children}
    </OperatorProvider>
  )
}