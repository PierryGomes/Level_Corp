import { Building2, Settings, Rocket } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Cadastre sua empresa",
    description:
      "Crie sua conta, adicione departamentos e convide seus colaboradores para a plataforma em poucos minutos.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Personalize o ambiente",
    description:
      "Configure missoes, recompensas, moeda interna e personalize o mapa virtual do seu escritorio.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Engaje sua equipe",
    description:
      "Acompanhe metricas em tempo real, celebre conquistas e veja o engajamento da sua equipe crescer.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="border-t border-border/50 bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Como Funciona
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Comece em 3 passos simples
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A LevelCorp foi projetada para ser implementada rapidamente, sem
            complicacoes tecnicas.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] bg-border md:block" />
              )}

              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-background">
                <step.icon className="h-8 w-8 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
