'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Auth logic will be wired up later
  }

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ color: '#e8b86d' }}
          >
            IKIGAI
          </span>
          <span
            className="text-3xl font-light tracking-tight"
            style={{ color: '#1a1a2e' }}
          >
            Planner
          </span>
        </div>
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu sistema de planificación de vida</CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Google OAuth */}
        <a href="/api/auth/google" className="block">
          <Button variant="outline" className="w-full gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Iniciar sesión con Google
          </Button>
        </a>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-400">o</span>
          </div>
        </div>

        {/* Email / password */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1a1a2e] mb-1">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1a1a2e] mb-1">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: '#1a1a2e' }}
          >
            Crear cuenta
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
