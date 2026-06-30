'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useInternalAuth } from '@/hooks/AuthContext'
import './LoginForm.css'

export function LoginForm() {
  'use no memo'
  const { login } = useInternalAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Refs ensure the async handler always uses the latest values regardless of
  // when the React Compiler memoized the closure.
  const emailRef = useRef(email)
  const passwordRef = useRef(password)
  emailRef.current = email
  passwordRef.current = password

  const handleLogin = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await login(emailRef.current, passwordRef.current)
      // Read destination from the actual URL at submit time
      const destination = new URLSearchParams(window.location.search).get('redirect') || '/'
      window.location.href = destination
    } catch (err: unknown) {
      console.error('Login failed:', err)
      const message = err instanceof Error ? err.message : 'Falha ao realizar login. Verifique suas credenciais.';
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para acessar sua conta</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
          data-state={mounted ? 'ready' : 'loading'}
        >
          {error && <div className="login-error" data-testid="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Senha</label>
              <Link href="#" className="forgot-password">Esqueceu a senha?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="button"
            className="login-button"
            disabled={isSubmitting}
            onClick={handleLogin}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem uma conta? <Link href="/register">Registre-se</Link></p>
        </div>
      </div>
    </div>
  )
}
