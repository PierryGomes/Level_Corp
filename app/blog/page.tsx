"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, User, Tag, ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/landing/footer"

const categories = ["Todos", "Cultura Organizacional", "Gamificacao", "Endomarketing", "Lideranca", "Inovacao"]

const posts = [
  {
    id: 1,
    title: "Como a gamificacao aumentou o engajamento em 40% na Empresa X",
    excerpt: "Um estudo de caso real mostrando como missoes, XP e ranking transformaram a rotina de 200 colaboradores em apenas 3 meses.",
    category: "Gamificacao",
    author: "Camila Santos",
    date: "12 Fev 2026",
    readTime: "6 min",
    featured: true,
  },
  {
    id: 2,
    title: "5 estrategias de endomarketing digital para 2026",
    excerpt: "Descubra como empresas lideres estao usando plataformas digitais para engajar colaboradores de forma inovadora.",
    category: "Endomarketing",
    author: "Lucas Ferreira",
    date: "08 Fev 2026",
    readTime: "5 min",
    featured: false,
  },
  {
    id: 3,
    title: "O papel da lideranca na cultura de engajamento",
    excerpt: "Gestores sao peca-chave na adocao de ferramentas de gamificacao. Veja como liderar pelo exemplo.",
    category: "Lideranca",
    author: "Roberto Almeida",
    date: "03 Fev 2026",
    readTime: "7 min",
    featured: false,
  },
  {
    id: 4,
    title: "IA aplicada ao RH: o futuro ja comecou",
    excerpt: "Inteligencia artificial esta revolucionando a gestao de pessoas. Entenda as tendencias e como se preparar.",
    category: "Inovacao",
    author: "Mariana Costa",
    date: "28 Jan 2026",
    readTime: "8 min",
    featured: false,
  },
  {
    id: 5,
    title: "Construindo uma cultura organizacional forte em equipes remotas",
    excerpt: "O trabalho remoto desafia a cultura da empresa. Veja como a gamificacao pode ser a ponte para manter equipes conectadas.",
    category: "Cultura Organizacional",
    author: "Camila Santos",
    date: "22 Jan 2026",
    readTime: "6 min",
    featured: false,
  },
  {
    id: 6,
    title: "Metricas de engajamento: o que medir e por que",
    excerpt: "NPS interno, taxa de participacao, frequencia de missoes -- entenda quais indicadores realmente importam.",
    category: "Gamificacao",
    author: "Mariana Costa",
    date: "15 Jan 2026",
    readTime: "5 min",
    featured: false,
  },
]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [search, setSearch] = useState("")

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.find((p) => p.featured)
  const rest = filtered.filter((p) => !p.featured)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pb-8 pt-16 lg:pt-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Insights sobre engajamento corporativo
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Conteudos sobre cultura organizacional, gamificacao, lideranca e inovacao para empresas que desejam evoluir.
              </p>
            </div>

            {/* Search + filters */}
            <div className="mx-auto mt-10 max-w-3xl">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar artigos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured post */}
        {featured && (
          <section className="py-8">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="group rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-all hover:border-primary/30 lg:p-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">Destaque</span>
                  <span className="text-xs text-muted-foreground">{featured.category}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground md:text-2xl">{featured.title}</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{featured.author}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Posts grid */}
        <section className="pb-20 pt-4">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {rest.length === 0 && !featured ? (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">Nenhum artigo encontrado para essa busca.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <article key={post.id} className="group flex flex-col rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{post.category}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold leading-snug text-foreground">{post.title}</h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
