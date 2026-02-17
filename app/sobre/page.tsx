import Image from "next/image"
import { Target, Heart, Lightbulb, Users, TrendingUp, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const values = [
  { icon: Lightbulb, title: "Inovacao", description: "Buscamos constantemente novas formas de transformar o ambiente corporativo com tecnologia de ponta." },
  { icon: Heart, title: "Pessoas em Primeiro Lugar", description: "Acreditamos que engajamento gera performance. Cada funcionalidade e pensada para o ser humano." },
  { icon: TrendingUp, title: "Resultados Mensuraveis", description: "Dados e metricas claras para que cada decisao seja embasada e cada progresso seja visivel." },
  { icon: Users, title: "Colaboracao", description: "Construimos pontes entre equipes, departamentos e hierarquias para um ambiente mais conectado." },
]

const team = [
  { name: "Roberto Almeida", role: "CEO & Fundador", bio: "15 anos de experiencia em gestao corporativa e transformacao digital." },
  { name: "Camila Santos", role: "CTO", bio: "Especialista em plataformas gamificadas e arquitetura de software escalavel." },
  { name: "Lucas Ferreira", role: "Head de Produto", bio: "Designer de experiencias com foco em engajamento e retencao de usuarios." },
  { name: "Mariana Costa", role: "Head de Dados", bio: "Cientista de dados com expertise em analytics comportamental e IA aplicada." },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Sobre Nos
              </p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Transformando o ambiente corporativo com gamificacao estrategica
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                A LevelCorp nasceu da visao de que o trabalho pode ser mais envolvente, produtivo e humano.
                Unimos tecnologia, dados e experiencia do usuario para criar uma nova forma de trabalhar.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="border-t border-border/50 bg-card/50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nossa Missao</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Democratizar a gamificacao corporativa, tornando-a acessivel para empresas de todos os tamanhos.
                  Acreditamos que quando colaboradores se sentem valorizados e engajados, os resultados aparecem naturalmente.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-3xl font-bold text-primary">+500</p>
                    <p className="text-sm text-muted-foreground">Empresas ativas</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">50k+</p>
                    <p className="text-sm text-muted-foreground">Colaboradores engajados</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">+40%</p>
                    <p className="text-sm text-muted-foreground">Aumento medio em engajamento</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">4.8/5</p>
                    <p className="text-sm text-muted-foreground">Avaliacao media</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-border/50 bg-card p-1">
                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                  <div className="text-center">
                    <Award className="mx-auto mb-3 h-12 w-12 text-primary/30" />
                    <p className="text-sm text-muted-foreground">Video institucional da LevelCorp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">Nossos Valores</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border/50 bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-border/50 bg-card/50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">Nossa Equipe de Lideranca</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="rounded-xl border border-border/50 bg-background p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xl font-bold text-primary">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
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
