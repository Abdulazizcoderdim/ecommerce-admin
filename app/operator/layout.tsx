"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { OperatorSidebar } from "@/components/operator-sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
    // Redirect admin users to admin dashboard
    if (!loading && isAuthenticated && user?.role === "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role === "admin") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <OperatorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
