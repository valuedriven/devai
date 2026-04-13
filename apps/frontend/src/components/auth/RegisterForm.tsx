'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInternalAuth } from '@/hooks/AuthContext'
import './RegisterForm.css'

export function RegisterForm() {
  const router = useRouter()
  const { register } = useInternalAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
      })
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      console.error('Registration failed:', err)
      const message = err instanceof Error ? err.message : 'Falha ao realizar cadastro. Tente novamente mais tarde.';
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crie sua conta</h1>
          <p>Preencha os dados abaixo para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="register-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nome</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Seu nome"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Sobrenome</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Seu sobrenome"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

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
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="register-footer">
          <p>Já tem uma conta? <Link href="/login">Entre aqui</Link></p>
        </div>
      </div>
    </div>
  )
}
