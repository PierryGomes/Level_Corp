"use client"

import { useState } from "react"
import { MapPin, Clock, Briefcase, Heart, Zap, Users, Code, Megaphone, BarChart3, Headphones, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const perks = [
  { icon: Heart, title: "Saude e Bem-estar", description: "Plano de saude, odontologico e acesso a plataformas de terapia online." },
  { icon: Zap, title: "Horario Flexivel", description: "Trabalhe de onde quiser, no horario que fizer mais sentido para voce." },
  { icon: Users, title: "Cultura Incrivel", description: "Equipe diversa, inclusiva e movida por inovacao e proposito." },
]

const jobs = [
  { id: 1, title: "Engenheiro(a) Frontend Senior", dept: "Tecnologia", location: "Remoto", type: "Tempo Integral", icon: Code },
  { id: 2, title: "Product Designer", dept: "Produto", location: "Remoto", type: "Tempo Integral", icon: Zap },
  { id: 3, title: "Analista de Marketing de Conteudo", dept: "Marketing", location: "Hibrido - SP", type: "Tempo Integral", icon: Megaphone },
  { id: 4, title: "Cientista de Dados", dept: "Dados", location: "Remoto", type: "Tempo Integral", icon: BarChart3 },
  { id: 5, title: "Especialista em Customer Success", dept: "Suporte", location: "Remoto", type: "Tempo Integral", icon: Headphones },
]

export default function CarreirasPage() {
  const [applying, setApplying] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setApplying(null)
      setSubmitted(false)
    }, 3000)
  }

  const selectedJob = jobs.find((j) => j.id === applying)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-16 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Carreiras</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Construa o futuro do trabalho conosco
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Se voce acredita em inovacao, tecnologia com proposito e transformacao organizacional, queremos conhecer voce.
              </p>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="border-t border-border/50 bg-card/50 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {perks.map((perk) => (
                <div key={perk.title} className="flex items-start gap-4 rounded-xl border border-border/50 bg-background p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <perk.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{perk.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Positions */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">Vagas Abertas</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <job.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.dept}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setApplying(job.id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    Candidatar-se
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application modal */}
        {applying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <button onClick={() => { setApplying(null); setSubmitted(false) }} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>

              {submitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                    <Heart className="h-7 w-7 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Candidatura Enviada!</h3>
                  <p className="mt-2 text-muted-foreground">Obrigado pelo interesse. Entraremos em contato em breve.</p>
                </div>
              ) : (
                <>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{selectedJob?.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{selectedJob?.dept} - {selectedJob?.location}</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input id="name" required placeholder="Seu nome" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required placeholder="voce@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input id="linkedin" placeholder="linkedin.com/in/seu-perfil" />
                    </div>
                    <div>
                      <Label htmlFor="message">Por que voce quer trabalhar na LevelCorp?</Label>
                      <Textarea id="message" rows={3} placeholder="Conte um pouco sobre voce..." />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Enviar Candidatura
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
