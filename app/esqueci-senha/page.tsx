"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [resetUrl, setResetUrl] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar email")
      }

      setIsSubmitted(true)
      setEmailSent(data.emailSent || false)
      
      // Show reset URL if email wasn't sent
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl"
            />
            <span className="text-2xl font-bold text-foreground">LevelCorp</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground leading-tight">
            Recupere seu acesso
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Nao se preocupe! Enviaremos um link para redefinir sua senha 
            e voce podera voltar ao escritorio virtual em poucos minutos.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          2024 LevelCorp. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">LevelCorp</span>
          </div>

          {!isSubmitted ? (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-foreground">Esqueceu sua senha?</h2>
                <p className="mt-2 text-muted-foreground">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperacao"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {emailSent ? "Email enviado!" : "Link gerado!"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {emailSent ? (
                    <>
                      Se o email <strong className="text-foreground">{email}</strong> estiver 
                      cadastrado, voce recebera um link para redefinir sua senha.
                    </>
                  ) : (
                    <>
                      Use o link abaixo para redefinir a senha da conta{" "}
                      <strong className="text-foreground">{email}</strong>
                    </>
                  )}
                </p>
              </div>

              {emailSent && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  <p>Nao recebeu o email? Verifique sua pasta de spam ou aguarde alguns minutos.</p>
                </div>
              )}

              {resetUrl && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm space-y-3">
                  <p className="font-medium text-foreground">Clique no botao abaixo para redefinir sua senha:</p>
                  <a 
                    href={resetUrl} 
                    className="block w-full"
                  >
                    <Button className="w-full">
                      Redefinir minha senha
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground text-center">
                    Este link expira em 1 hora
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail("")
                    setResetUrl("")
                    setEmailSent(false)
                  }}
                >
                  Tentar outro email
                </Button>

                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
