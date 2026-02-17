"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { authenticateUser } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600))

    const user = authenticateUser(email, password)

    if (!user) {
      setError("Email ou senha invalidos. Tente novamente.")
      setLoading(false)
      return
    }

    // Store user info for the dashboard stub
    localStorage.setItem("levelcorp_user", JSON.stringify(user))
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </Link>

          <div className="mb-8">
            <Image
              src="/images/logo.png"
              alt="LevelCorp"
              width={160}
              height={40}
              className="mb-6 h-9 w-auto"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre na sua conta para acessar a plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 rounded-xl border border-border/50 bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contas de demonstracao
            </p>
            <div className="space-y-2 text-sm">
              {[
                { role: "Colaborador", email: "colaborador@levelcorp.com" },
                { role: "Gestor", email: "gestor@levelcorp.com" },
                { role: "CEO", email: "ceo@levelcorp.com" },
              ].map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword("123456")
                    setError("")
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="font-medium text-foreground">{account.role}</span>
                  <span className="text-xs text-muted-foreground">{account.email}</span>
                </button>
              ))}
              <p className="mt-1 text-xs text-muted-foreground">
                Senha para todas: <span className="font-mono text-foreground">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Visual panel (hidden on mobile) */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-card lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-balance text-2xl font-bold text-foreground">
            Eleve o engajamento da sua equipe
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Acesse missoes, conquistas, rankings e muito mais. Sua jornada de
            gamificacao corporativa comeca aqui.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">+40%</p>
              <p className="text-xs text-muted-foreground">Engajamento</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">3x</p>
              <p className="text-xs text-muted-foreground">Retencao</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">85%</p>
              <p className="text-xs text-muted-foreground">Satisfacao</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
