"use client"

import Link from "next/link"
import { ArrowRight, Play, Trophy, Target, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 lg:pb-32 lg:pt-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-12">
          {/* Left: Copy */}
          <div className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Plataforma de Engajamento Gamificado
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Transforme o engajamento da sua equipe em{" "}
              <span className="text-primary">resultados reais</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              A LevelCorp combina gamificacao, missoes e um ambiente virtual
              interativo para aumentar a produtividade, a retencao e a
              satisfacao dos seus colaboradores.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Comecar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                <Play className="mr-2 h-4 w-4" />
                Ver Demonstracao
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Setup em 5 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Sem cartao de credito
              </span>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative w-full max-w-lg lg:max-w-xl">
            <div className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-2xl">
              {/* Mini dashboard preview */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ana Silva</p>
                  <p className="text-xs text-muted-foreground">Level 7 - Desenvolvimento</p>
                </div>
                <div className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  2.340 XP
                </div>
              </div>

              {/* XP Bar */}
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Progresso para Level 8</span>
                  <span>78%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[78%] rounded-full bg-primary transition-all" />
                </div>
              </div>

              {/* Mission cards */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Completar onboarding</p>
                    <p className="text-xs text-muted-foreground">+150 XP | +30 Moedas</p>
                  </div>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                    Concluida
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Participar de 3 reunioes</p>
                    <p className="text-xs text-muted-foreground">+200 XP | +50 Moedas</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    2/3
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Streak de 5 dias</p>
                    <p className="text-xs text-muted-foreground">+500 XP | +100 Moedas</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    3/5
                  </span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-3 -top-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 shadow-lg">
              <p className="text-xs font-medium text-muted-foreground">Ranking</p>
              <p className="text-lg font-bold text-primary">#4</p>
            </div>

            {/* Floating coins */}
            <div className="absolute -bottom-3 -left-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 shadow-lg">
              <p className="text-xs font-medium text-muted-foreground">Moedas</p>
              <p className="text-lg font-bold text-foreground">450</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
