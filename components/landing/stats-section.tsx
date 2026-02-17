import { TrendingUp, Users, Heart, ShieldCheck } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "+40%",
    label: "Aumento no Engajamento",
  },
  {
    icon: Users,
    value: "3x",
    label: "Maior Retencao",
  },
  {
    icon: Heart,
    value: "+85%",
    label: "Satisfacao dos Colaboradores",
  },
  {
    icon: ShieldCheck,
    value: "50%",
    label: "Menos Turnover",
  },
]

export function StatsSection() {
  return (
    <section className="border-y border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
