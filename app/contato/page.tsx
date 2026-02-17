"use client"

import { useState } from "react"
import { Mail, Phone, Clock, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const contactInfo = [
  { icon: Mail, title: "Email", value: "levelcorp.contato@gmail.com", description: "Respondemos em ate 24h uteis." },
  { icon: Phone, title: "Telefone / WhatsApp", value: "+55 (11) 95921-3193", description: "Seg a Sex, 9h as 18h." },
  { icon: Clock, title: "Horario", value: "Seg - Sex, 9h - 18h", description: "Fuso horario de Brasilia (GMT-3)." },
]

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [subject, setSubject] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-8 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Contato</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Fale com a nossa equipe
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Estamos prontos para ajudar sua empresa a dar o proximo nivel. Agende uma demonstracao ou tire suas duvidas.
              </p>
            </div>
          </div>
        </section>

        {/* Contact info cards */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {contactInfo.map((info) => (
                <div key={info.title} className="rounded-xl border border-border/50 bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{info.title}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{info.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-12">
          <div className="mx-auto max-w-2xl px-4 lg:px-8">
            {submitted ? (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Mensagem Enviada!</h2>
                <p className="mt-3 text-muted-foreground">Obrigado pelo contato. Nossa equipe retornara em ate 24 horas uteis.</p>
                <Button onClick={() => setSubmitted(false)} className="mt-6" variant="outline">
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
                <h2 className="mb-6 text-xl font-bold text-foreground">Envie sua mensagem</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" required placeholder="Seu nome" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required placeholder="voce@empresa.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Nome da empresa" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {["Demonstracao", "Precos", "Suporte Tecnico", "Parceria", "Outro"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSubject(s)}
                          className={`rounded-full px-3 py-1 text-sm transition-colors ${
                            subject === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" required rows={4} placeholder="Como podemos ajudar?" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
