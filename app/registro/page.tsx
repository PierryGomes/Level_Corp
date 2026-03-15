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
import { Building2, Mail, User, Calendar, Briefcase, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const departments = [
  "Engenharia",
  "Produto",
  "Design",
  "Marketing",
  "Vendas",
  "Recursos Humanos",
  "Financeiro",
  "Operações",
  "Suporte",
  "Jurídico",
  "Administrativo",
  "Outro",
]

export default function RegistroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    department: "",
    birthDate: "",
    acceptedTerms: false,
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido")
      return false
    }
    if (!formData.company.trim()) {
      setError("Empresa é obrigatória")
      return false
    }
    if (!formData.department) {
      setError("Departamento é obrigatório")
      return false
    }
    if (!formData.birthDate) {
      setError("Data de nascimento é obrigatória")
      return false
    }
    if (!formData.acceptedTerms) {
      setError("Você deve aceitar os termos de uso")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        setIsLoading(false)
        return
      }

      // Success
      setSuccess(true)

      // Store user data temporarily for avatar creation
      localStorage.setItem("levelcorp_pending_user", JSON.stringify(data.user))

      // Redirect to avatar creation after 1.5s
      setTimeout(() => {
        router.push("/avatar")
      }, 1500)
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Conta criada com sucesso!</h1>
          <p className="mb-6 text-muted-foreground">
            Redirecionando para criação do seu avatar...
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-levelcorp.jpeg"
            alt="LevelCorp"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl"
          />
          <span className="text-2xl font-bold text-foreground">LevelCorp</span>
        </div>

        <div className="max-w-md">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground">
            Seu escritório virtual gamificado
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecte-se com sua equipe em um ambiente virtual interativo. 
            Participe de reuniões, colabore em projetos e ganhe recompensas 
            por suas conquistas.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Escritório Virtual</p>
                <p className="text-sm text-muted-foreground">Explore ambientes interativos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Avatar Personalizado</p>
                <p className="text-sm text-muted-foreground">Crie sua identidade virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gamificação</p>
                <p className="text-sm text-muted-foreground">Ganhe XP e suba de nível</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2026 LevelCorp. Todos os direitos reservados.
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
              className="h-10 w-10 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">LevelCorp</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Criar conta</h2>
            <p className="mt-2 text-muted-foreground">
              Preencha os dados abaixo para entrar no escritório virtual
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="João Silva"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  placeholder="Nome da empresa"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-foreground">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Selecione seu departamento" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Birth date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-foreground">Data de nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Checkbox
                id="terms"
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) => handleChange("acceptedTerms", checked as boolean)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <div className="text-sm">
                <Label htmlFor="terms" className="cursor-pointer text-foreground">
                  Aceito os termos de uso
                </Label>
                <p className="mt-1 text-muted-foreground">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <Link href="/termos" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
