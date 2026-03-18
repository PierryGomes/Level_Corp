"use client"

import Image from "next/image"
import Link from "next/link"
import { Building2, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

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
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          2026 LevelCorp. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
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

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Experimente a LevelCorp</h2>
            <p className="mt-2 text-muted-foreground">
              Use nossas contas de demonstracao para explorar todas as funcionalidades da plataforma
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-foreground">Contas de demonstracao disponiveis:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">CEO</p>
                    <p className="text-sm text-muted-foreground">ceo@levelcorp.com</p>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">Gestor</p>
                    <p className="text-sm text-muted-foreground">gestor@levelcorp.com</p>
                  </div>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-500">Manager</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">Colaborador</p>
                    <p className="text-sm text-muted-foreground">colaborador@levelcorp.com</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">User</span>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Senha para todas as contas: <span className="font-mono font-medium text-foreground">123456</span>
              </p>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/login">
                Acessar plataforma
              </Link>
            </Button>
          </div>

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
