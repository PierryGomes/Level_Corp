"use client"

import Image from "next/image"
import Link from "next/link"
import { Building2, Users, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

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
            Seu escritorio virtual gamificado
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecte-se com sua equipe em um ambiente virtual interativo. 
            Participe de reunioes, colabore em projetos e ganhe recompensas 
            por suas conquistas.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Escritorio Virtual</p>
                <p className="text-sm text-muted-foreground">Explore ambientes interativos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Colaboracao em Tempo Real</p>
                <p className="text-sm text-muted-foreground">Trabalhe junto com sua equipe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Sistema de Convites</p>
                <p className="text-sm text-muted-foreground">Convide sua equipe facilmente</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          2026 LevelCorp. Todos os direitos reservados.
        </p>
      </div>

      {/* Right side - Options */}
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

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Comece agora</h2>
            <p className="mt-2 text-muted-foreground">
              Escolha como deseja entrar na plataforma
            </p>
          </div>

          <div className="space-y-4">
            {/* Create workspace option */}
            <Link href="/criar-workspace" className="block">
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Criar workspace da empresa</h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Crie um novo ambiente para sua empresa e convide colaboradores
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        CEO / Admin
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Novo ambiente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Join with invite option */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/50">
                  <Mail className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Entrar com convite</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recebeu um convite? Clique no link enviado por email para entrar na empresa
                  </p>
                  <div className="mt-3">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Colaborador / Gestor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Demo access */}
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
              <h3 className="mb-2 font-semibold text-foreground">Acesso de demonstracao</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Quer conhecer a plataforma? Use nossas contas de teste para explorar todas as funcionalidades.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  Acessar com conta de teste
                </Link>
              </Button>
            </div>
          </div>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ja tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
