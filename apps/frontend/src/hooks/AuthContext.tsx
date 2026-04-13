'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchApi } from '@/lib/api'

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

const TOKEN_KEY = 'devai_auth_token'

const setAuthCookie = (token: string | null) => {
  if (typeof document !== 'undefined') {
    if (token) {
      // Set cookie for 1 day
      const maxAge = 24 * 60 * 60;
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      // Clear cookie
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    
    if (!savedToken) {
      setToken(null)
      setUser(null)
      setIsLoading(false)
      setAuthCookie(null)
      return
    }

    try {
      setToken(savedToken)
      setAuthCookie(savedToken)
      const profile = await fetchApi<UserProfile>('/auth/me', {}, savedToken)
      setUser(profile)
    } catch (error) {
      console.error('Failed to refresh auth session:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
      }
      setAuthCookie(null)
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
      const response = await fetchApi<{ token: string; user: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, response.token)
      }
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
      const response = await fetchApi<{ token: string; user: unknown }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, response.token)
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
      }
      setAuthCookie(null)
      setToken(null)
      setUser(null)
    } finally {
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
