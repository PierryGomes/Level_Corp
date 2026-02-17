import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Zap, Building2, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const plans = [
  {
    name: "Start",
    price: "R$ 9,90",
    per: "/colaborador/mes",
    description: "Para pequenas equipes que buscam engajamento inicial.",
    icon: Zap,
    highlight: false,
    features: [
      "Ate 25 colaboradores",
      "Mapa virtual basico",
      "Sistema de XP e niveis",
      "5 missoes simultaneas",
      "Dashboard do colaborador",
      "Suporte por email",
    ],
  },
  {
    name: "Pro",
    price: "R$ 24,90",
    per: "/colaborador/mes",
    description: "Para empresas em crescimento que desejam metricas avancadas.",
    icon: Building2,
    highlight: true,
    features: [
      "Ate 200 colaboradores",
      "Mapa virtual completo",
      "Missoes ilimitadas",
      "Loja de recompensas",
      "Dashboard gestor + CEO",
      "Hub de comunicacao",
      "Relatorios avancados",
      "Integracoes basicas",
      "Suporte prioritario",
    ],
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    per: "",
    description: "Para grandes organizacoes com necessidades personalizadas.",
    icon: Crown,
    highlight: false,
    features: [
      "Colaboradores ilimitados",
      "Personalizacao completa",
      "API dedicada",
      "SSO e SAML",
      "SLA garantido",
      "Integracao ERP/CRM/RH",
      "IA avancada com analytics",
      "Gerente de conta dedicado",
      "Treinamento presencial",
      "Ambiente on-premise opcional",
    ],
  },
]

export default function PrecosPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Precos
              </p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Planos adaptaveis ao tamanho da sua empresa
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Comece gratuitamente e escale conforme sua equipe cresce.
                Sem surpresas, sem taxas ocultas.
              </p>
            </div>
          </div>
        </section>

        {/* Plans grid */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                    plan.highlight
                      ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/5"
                      : "border-border/50 bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                      plan.highlight ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <plan.icon className={`h-6 w-6 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                    {plan.per && (
                      <span className="text-sm text-muted-foreground">{plan.per}</span>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <Button
                      className={`w-full ${
                        plan.highlight
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                      size="lg"
                    >
                      {plan.price === "Sob consulta" ? "Falar com Vendas" : "Comecar Agora"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/50 bg-card/50 py-20">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            <h2 className="mb-10 text-center text-2xl font-bold text-foreground">Perguntas Frequentes</h2>
            <div className="space-y-6">
              {[
                { q: "Posso trocar de plano a qualquer momento?", a: "Sim! Voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. A cobranca sera ajustada proporcionalmente." },
                { q: "Existe um periodo de teste gratuito?", a: "Sim, oferecemos 14 dias gratuitos em todos os planos, sem necessidade de cartao de credito." },
                { q: "Como funciona a cobranca?", a: "A cobranca e mensal, por colaborador ativo na plataforma. Colaboradores inativos nao sao cobrados." },
                { q: "Preciso de suporte tecnico para implementar?", a: "A LevelCorp foi projetada para setup em 5 minutos. Nossos planos Pro e Enterprise incluem suporte dedicado para onboarding." },
              ].map((faq) => (
                <div key={faq.q} className="rounded-xl border border-border/50 bg-background p-5">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
