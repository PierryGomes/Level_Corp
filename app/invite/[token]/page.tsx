"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  XCircle,
} from "lucide-react"

interface InvitationData {
  id: string
  email: string
  role: string
  companies: {
    id: string
    name: string
    slug: string
  }
  departments: {
    id: string
    name: string
  } | null
}

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [expired, setExpired] = useState(false)
  const [used, setUsed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  })

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invite/${token}`)
        const data = await res.json()

        if (res.status === 410) {
          if (data.expired) setExpired(true)
          if (data.used) setUsed(true)
          return
        }

        if (!res.ok) {
          setError(data.error || "Convite não encontrado")
          return
        }

        setInvitation(data.invitation)
      } catch (err) {
        setError("Erro ao carregar convite")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchInvitation()
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Nome completo é obrigatório")
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return false
    }
    if (!formData.birthDate) {
      setError("Data de nascimento é obrigatória")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          password: formData.password,
          birthDate: formData.birthDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao aceitar convite")
      }

      // Save user to localStorage
      localStorage.setItem("levelcorp_user", JSON.stringify({
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        companyId: data.user.companyId,
        companyName: data.user.companyName,
        companySlug: data.user.companySlug,
      }))

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aceitar convite")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "gestor": return "Gestor"
      default: return "Colaborador"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Expired state
  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20">
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Convite expirado</h1>
          <p className="mb-6 text-muted-foreground">
            Este convite expirou. Solicite um novo convite ao administrador da empresa.
          </p>
          <Link href="/login">
            <Button>Ir para login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Already used state
  if (used) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Convite já utilizado</h1>
          <p className="mb-6 text-muted-foreground">
            Este convite já foi aceito. Se você já tem uma conta, faça login.
          </p>
          <Link href="/login">
            <Button>Ir para login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Convite inválido</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Link href="/login">
            <Button>Ir para login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Bem-vindo à LevelCorp!</h1>
          <p className="mb-6 text-muted-foreground">
            Sua conta foi criada com sucesso. Você será redirecionado para o dashboard.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecionando...
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image
            src="/images/logo-levelcorp.jpeg"
            alt="LevelCorp"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <span className="text-2xl font-bold text-foreground">LevelCorp</span>
        </div>

        {/* Invitation info card */}
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Você foi convidado para</p>
              <p className="font-semibold text-foreground">{invitation?.companies.name}</p>
              <p className="text-xs text-muted-foreground">
                como {getRoleLabel(invitation?.role || "")}
                {invitation?.departments && ` em ${invitation.departments.name}`}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Complete seu cadastro</h1>
          <p className="mt-1 text-muted-foreground">
            Preencha seus dados para aceitar o convite
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={invitation?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="João Silva"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Aceitar convite e criar conta"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
