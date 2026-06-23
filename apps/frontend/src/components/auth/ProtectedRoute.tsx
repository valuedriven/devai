'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useInternalAuth } from '@/hooks/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useInternalAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const redirectUrl = `${fallbackUrl}?redirect=${encodeURIComponent(window.location.pathname)}`
      router.replace(redirectUrl)
    }

    if (allowedRoles && user) {
      const userRoles = user.roles || []
      const hasRole = allowedRoles.some(requiredRole =>
        userRoles.some(userRole => userRole.toLowerCase() === requiredRole.toLowerCase())
      )
      if (!hasRole) {
        router.replace('/403')
      }
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl, allowedRoles, user])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user) {
    const userRoles = user.roles || []
    const hasRole = allowedRoles.some(requiredRole =>
      userRoles.some(userRole => userRole.toLowerCase() === requiredRole.toLowerCase())
    )
    if (!hasRole) {
      router.replace('/403')
      return null
    }
  }

  return <>{children}</>
}
