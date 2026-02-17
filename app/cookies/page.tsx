"use client"

import { useState } from "react"
import { Cookie, BarChart3, Settings, Shield, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const cookieTypes = [
  {
    id: "essential",
    icon: Shield,
    title: "Cookies Essenciais",
    description: "Necessarios para o funcionamento basico da plataforma. Incluem autenticacao, seguranca e preferencias de sessao. Nao podem ser desativados.",
    required: true,
    defaultEnabled: true,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Cookies de Analitica",
    description: "Nos ajudam a entender como os usuarios interagem com a plataforma, permitindo melhorias continuas na experiencia. Dados sao anonimizados.",
    required: false,
    defaultEnabled: true,
  },
  {
    id: "functional",
    icon: Settings,
    title: "Cookies Funcionais",
    description: "Permitem funcionalidades avancadas como personalizacao de interface, preferencia de tema (claro/escuro) e idioma.",
    required: false,
    defaultEnabled: true,
  },
  {
    id: "performance",
    icon: BarChart3,
    title: "Cookies de Desempenho",
    description: "Coletam informacoes sobre o desempenho da plataforma para otimizar tempos de carregamento e estabilidade.",
    required: false,
    defaultEnabled: false,
  },
]

export default function CookiesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(cookieTypes.map((c) => [c.id, c.defaultEnabled]))
  )
  const [saved, setSaved] = useState(false)

  function toggle(id: string) {
    const ct = cookieTypes.find((c) => c.id === id)
    if (ct?.required) return
    setPrefs((p) => ({ ...p, [id]: !p[id] }))
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">Politica de Cookies</h1>
              <p className="mt-4 text-muted-foreground">Ultima atualizacao: 01 de fevereiro de 2026</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  A LevelCorp utiliza cookies para melhorar sua experiencia, analisar o uso da plataforma e personalizar funcionalidades.
                  Voce pode gerenciar suas preferencias a qualquer momento abaixo.
                </p>
              </div>

              {/* Cookie toggles */}
              <div className="space-y-4">
                {cookieTypes.map((ct) => (
                  <div key={ct.id} className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ct.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{ct.title}</h3>
                          {ct.required && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Obrigatorio</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ct.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(ct.id)}
                      className={`mt-1 shrink-0 transition-colors ${ct.required ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      disabled={ct.required}
                      aria-label={`${prefs[ct.id] ? "Desativar" : "Ativar"} ${ct.title}`}
                    >
                      {prefs[ct.id] ? (
                        <ToggleRight className="h-8 w-8 text-primary" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button
                  onClick={() => {
                    setPrefs(Object.fromEntries(cookieTypes.map((c) => [c.id, true])))
                    setSaved(false)
                  }}
                  variant="outline"
                >
                  Aceitar Todos
                </Button>
                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Preferencias salvas!</span>
                  )}
                  <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Salvar Preferencias
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
