import {
  Map,
  Target,
  Trophy,
  Coins,
  BarChart3,
  UserCircle,
} from "lucide-react"

const features = [
  {
    icon: Map,
    title: "Mapa Virtual Interativo",
    description:
      "Ambiente 2D estilo Gather onde colaboradores interagem por proximidade, participam de eventos e exploram escritorios virtuais.",
  },
  {
    icon: Target,
    title: "Missoes e Desafios",
    description:
      "Sistema de missoes diarias, semanais e mensais que recompensam boas praticas, colaboracao e entregas dentro do prazo.",
  },
  {
    icon: Trophy,
    title: "Ranking e Gamificacao",
    description:
      "Tabelas de classificacao individuais e por equipe, com niveis de experiencia, badges e conquistas desbloqueaveis.",
  },
  {
    icon: Coins,
    title: "Moeda Interna Corporativa",
    description:
      "Economia virtual onde colaboradores ganham e trocam moedas por recompensas reais como folgas, cursos e vouchers.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Estrategico com IA",
    description:
      "Paineis inteligentes para gestores e CEOs com indicadores de engajamento, produtividade e previsoes baseadas em dados.",
  },
  {
    icon: UserCircle,
    title: "Avatares com IA",
    description:
      "Personalizacao completa de avatares gerados por inteligencia artificial, refletindo a identidade unica de cada colaborador.",
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Recursos
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tudo que voce precisa para engajar sua equipe
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Uma plataforma completa que une gamificacao, tecnologia e
            inteligencia artificial para transformar a cultura da sua empresa.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
