import { Shield, Lock, Eye, FileText, Server, UserCheck } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const sections = [
  {
    icon: Lock,
    title: "Coleta de Dados",
    content: "Coletamos apenas os dados estritamente necessarios para o funcionamento da plataforma: nome, email corporativo, cargo, departamento e dados de interacao dentro do ambiente virtual. Nenhum dado pessoal sensivel e coletado sem consentimento explicito.",
  },
  {
    icon: Server,
    title: "Armazenamento e Seguranca",
    content: "Todos os dados sao protegidos por criptografia AES-256 em repouso e TLS 1.3 em transito. Nossos servidores estao localizados em data centers certificados ISO 27001, com backups redundantes e monitoramento 24/7.",
  },
  {
    icon: Eye,
    title: "Uso dos Dados",
    content: "Os dados coletados sao utilizados exclusivamente para: operacao da plataforma, geracao de metricas de engajamento, personalizacao da experiencia do usuario e melhoria continua dos nossos servicos. Jamais vendemos ou compartilhamos dados com terceiros sem autorizacao.",
  },
  {
    icon: UserCheck,
    title: "Direitos do Titular",
    content: "Em conformidade com a LGPD, voce tem direito a: acessar seus dados pessoais, solicitar correcao de dados incorretos, solicitar exclusao dos seus dados, revogar consentimento a qualquer momento e solicitar portabilidade dos dados.",
  },
  {
    icon: FileText,
    title: "Retencao de Dados",
    content: "Dados pessoais sao retidos enquanto a conta estiver ativa. Apos solicitacao de exclusao ou encerramento da conta, os dados sao removidos em ate 30 dias, exceto quando a retencao for exigida por lei.",
  },
  {
    icon: Shield,
    title: "Conformidade LGPD",
    content: "A LevelCorp esta em total conformidade com a Lei Geral de Protecao de Dados (Lei 13.709/2018). Nosso DPO (Encarregado de Dados) pode ser contactado atraves do email dpo@levelcorp.com para qualquer questao relacionada a privacidade.",
  },
]

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">Politica de Privacidade</h1>
              <p className="mt-4 text-muted-foreground">Ultima atualizacao: 01 de fevereiro de 2026</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                A LevelCorp respeita a privacidade dos seus usuarios e esta comprometida com a protecao dos dados pessoais.
                Esta politica descreve como coletamos, usamos, armazenamos e protegemos suas informacoes.
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
