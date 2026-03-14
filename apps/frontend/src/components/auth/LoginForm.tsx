'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInternalAuth } from '@/hooks/AuthContext'
import './LoginForm.css'

export function LoginForm() {
  const router = useRouter()
  const { login } = useInternalAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      console.error('Login failed:', err)
      const message = err instanceof Error ? err.message : 'Falha ao realizar login. Verifique suas credenciais.';
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

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
              <a href="#" className="forgot-password">Esqueceu a senha?</a>
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

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem uma conta? <a href="#">Cadastre-se</a></p>
        </div>
      </div>
    </div>
  )
}
