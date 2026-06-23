'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { request, setOnUnauthorized as setServiceOnUnauthorized } from '@/services/api'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles?: string[]
  imageUrl?: string
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const COOKIE_NAME = 'devai_auth_token'

const setAuthCookie = (token: string | null) => {
  if (typeof document !== 'undefined') {
    if (token) {
      const maxAge = 24 * 60 * 60;
      document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(COOKIE_NAME, token);
    } else {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      localStorage.removeItem(COOKIE_NAME);
    }
  }
}

function clearAuth() {
  setAuthCookie(null)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleUnauthorized = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
    setIsLoading(false)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`
      }
    }
  }, [])

  useEffect(() => {
    setServiceOnUnauthorized(handleUnauthorized)
    return () => {
      setServiceOnUnauthorized(null)
    }
  }, [handleUnauthorized])

  const refreshSession = useCallback(async () => {
    const readToken = () => {
      if (typeof document === 'undefined') return null
      let token = null
      const match = document.cookie.match(/(?:^|;\s*)devai_auth_token=([^;]*)/)
      if (match) {
        token = decodeURIComponent(match[1])
      }
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('devai_auth_token')
      }
      return token
    }

    const savedToken = readToken()
    
    if (!savedToken) {
      setToken(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      setToken(savedToken)
      const profile = await request<UserProfile>('GET', '/auth/me', undefined, { token: savedToken })
      setUser(profile)
    } catch {
      clearAuth()
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await request<{ token: string; user: unknown }>('POST', '/auth/login', { email, password })

      setToken(response.token)
      setAuthCookie(response.token)
      
      await refreshSession()
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const register = async (data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setIsLoading(true)
    try {
      const response = await request<{ token: string; user: unknown }>('POST', '/auth/register', data)

      setToken(response.token)
      setAuthCookie(response.token)
      
      await refreshSession()
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const currentToken = token
      if (currentToken) {
        await request('POST', '/auth/logout', undefined, { token: currentToken })
      }
    } catch {
      // Continue with local cleanup even if server logout fails
    } finally {
      clearAuth()
      setToken(null)
      setUser(null)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useInternalAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useInternalAuth must be used within an AuthProvider')
  }
  return context
}
