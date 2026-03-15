"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Users,
  Shield,
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"

const benefits = [
  {
    icon: Building2,
    title: "Escritório Virtual",
    description: "Ambiente gamificado para sua equipe colaborar",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Dados isolados e seguros para sua empresa",
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Criptografia e controle de acesso avançado",
  },
  {
    icon: Zap,
    title: "Produtividade",
    description: "Gamificação que engaja e motiva colaboradores",
  },
]

const employeeOptions = [
  { value: "1-10", label: "1-10 colaboradores" },
  { value: "11-50", label: "11-50 colaboradores" },
  { value: "51-200", label: "51-200 colaboradores" },
  { value: "201-500", label: "201-500 colaboradores" },
  { value: "500+", label: "Mais de 500 colaboradores" },
]

export default function CriarWorkspacePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    employeeCount: "",
    birthDate: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, employeeCount: value }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Nome completo é obrigatório")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email é obrigatório")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email inválido")
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres")
      return false
    }
    if (!formData.companyName.trim()) {
      setError("Nome da empresa é obrigatório")
      return false
    }
    if (!formData.birthDate) {
      setError("Data de nascimento é obrigatória")
      return false
    }
    if (!acceptedTerms) {
      setError("Você deve aceitar os termos de uso")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar workspace")
      }

      // Save user to localStorage for session
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
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar workspace")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Workspace criado com sucesso!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Sua empresa foi registrada na LevelCorp. Você será redirecionado para o painel administrativo.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecionando...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-accent/10 p-12 lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-foreground">LevelCorp</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-foreground">
              Crie o workspace da sua empresa
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Transforme seu ambiente de trabalho em uma experiência gamificada e colaborativa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
              >
                <benefit.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Mais de 500 empresas já utilizam a LevelCorp
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">LevelCorp</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Criar workspace
            </h2>
            <p className="mt-2 text-muted-foreground">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Dados do administrador
              </h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="João Silva"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email corporativo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
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
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {/* Company info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Dados da empresa
              </h3>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Minha Empresa LTDA"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Número de colaboradores</Label>
                <Select
                  value={formData.employeeCount}
                  onValueChange={handleSelectChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                Aceito os{" "}
                <Link href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando workspace...
                </>
              ) : (
                "Criar workspace"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Fazer login
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Recebeu um convite?{" "}
            <Link href="/invite" className="font-medium text-primary hover:underline">
              Aceitar convite
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
