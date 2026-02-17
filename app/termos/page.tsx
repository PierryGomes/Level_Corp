import { Scale, UserCheck, AlertTriangle, Shield, FileText, Ban } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const sections = [
  {
    icon: UserCheck,
    title: "Aceitacao dos Termos",
    content: "Ao acessar e utilizar a plataforma LevelCorp, voce concorda com estes Termos de Uso em sua totalidade. Caso nao concorde com alguma disposicao, solicitamos que nao utilize a plataforma. O uso continuado apos alteracoes nos termos constitui aceitacao das modificacoes.",
  },
  {
    icon: Shield,
    title: "Uso Responsavel",
    content: "O usuario se compromete a: utilizar a plataforma de forma etica e responsavel, nao compartilhar credenciais de acesso com terceiros, respeitar os demais usuarios no ambiente virtual, nao utilizar a plataforma para fins ilegais ou nao autorizados, e nao tentar acessar dados de outros usuarios sem autorizacao.",
  },
  {
    icon: Scale,
    title: "Propriedade Intelectual",
    content: "Todo o conteudo da plataforma LevelCorp, incluindo software, design, textos, graficos, logos e marcas, e propriedade exclusiva da LevelCorp ou de seus licenciadores. E proibida a reproducao, distribuicao ou modificacao sem autorizacao previa e por escrito.",
  },
  {
    icon: FileText,
    title: "Contas e Credenciais",
    content: "Cada usuario e responsavel por manter a confidencialidade de suas credenciais de acesso. Qualquer atividade realizada com sua conta sera de sua responsabilidade. Em caso de uso nao autorizado, notifique imediatamente a equipe de suporte.",
  },
  {
    icon: AlertTriangle,
    title: "Conduta no Ambiente Virtual",
    content: "No ambiente virtual da LevelCorp, os usuarios devem manter conduta profissional e respeitosa. E proibido: assedio de qualquer natureza, discriminacao, compartilhamento de conteudo inapropriado, spam ou qualquer comportamento que prejudique a experiencia dos demais usuarios.",
  },
  {
    icon: Ban,
    title: "Suspensao e Cancelamento",
    content: "A LevelCorp reserva-se o direito de suspender ou cancelar contas que violem estes Termos de Uso. Em caso de suspensao, o usuario sera notificado e tera a oportunidade de contestar a decisao. O descumprimento grave pode resultar em cancelamento imediato sem aviso previo.",
  },
]

export default function TermosPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">Termos de Uso</h1>
              <p className="mt-4 text-muted-foreground">Ultima atualizacao: 01 de fevereiro de 2026</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Estes Termos de Uso regem a utilizacao da plataforma LevelCorp. Ao utilizar nossos servicos, voce concorda com as condicoes descritas abaixo.
              </p>

              <div className="space-y-8">
                {sections.map((section, i) => (
                  <div key={section.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="mb-2 text-lg font-semibold text-foreground">{i + 1}. {section.title}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
