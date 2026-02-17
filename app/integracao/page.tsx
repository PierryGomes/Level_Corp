import Link from "next/link"
import { ArrowRight, Plug, RefreshCw, Shield, Zap, Database, Cloud, Mail, Calendar, Users, BarChart3, FileText, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const integrations = [
  { name: "Google Workspace", category: "Produtividade", description: "Gmail, Calendar, Drive e Meet sincronizados automaticamente.", icon: Mail },
  { name: "Microsoft 365", category: "Produtividade", description: "Outlook, Teams, SharePoint e OneDrive integrados nativamente.", icon: Calendar },
  { name: "Sistemas de RH", category: "RH", description: "Gupy, Kenoby, Senior, Totvs e outros sistemas de gestao de pessoas.", icon: Users },
  { name: "ERP", category: "Gestao", description: "SAP, Oracle, Totvs Protheus e outros ERPs corporativos.", icon: Database },
  { name: "CRM", category: "Vendas", description: "Salesforce, HubSpot, Pipedrive e RD Station para alinhar vendas.", icon: BarChart3 },
  { name: "APIs Personalizadas", category: "Desenvolvimento", description: "REST e Webhooks para conectar qualquer sistema interno.", icon: Plug },
]

const benefits = [
  { icon: RefreshCw, title: "Sincronizacao Automatica", description: "Dados fluem entre sistemas sem intervencao manual, mantendo tudo atualizado em tempo real." },
  { icon: Shield, title: "Seguranca de Ponta", description: "Todas as integracoes usam OAuth 2.0, criptografia TLS e tokens rotativos para proteger seus dados." },
  { icon: Zap, title: "Setup em Minutos", description: "Conecte seus sistemas em poucos cliques com nossos wizards de configuracao guiada." },
  { icon: Lock, title: "Conformidade LGPD", description: "Dados trafegam em conformidade com a legislacao brasileira de protecao de dados." },
]

export default function IntegracaoPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Integracao
              </p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Conecte a LevelCorp aos sistemas que voce ja usa
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Nossa plataforma se adapta a sua infraestrutura existente, garantindo fluidez operacional e continuidade dos processos.
              </p>
            </div>
          </div>
        </section>

        {/* Integrations grid */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((item) => (
                <div key={item.name} className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border/50 bg-card/50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">Por que integrar com a LevelCorp?</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <b.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Docs CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center lg:p-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Precisa de uma integracao customizada?</h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Nossa API RESTful e completa, bem documentada e pronta para conectar a LevelCorp a qualquer sistema que voce precise.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contato">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Falar com o Time Tecnico
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
