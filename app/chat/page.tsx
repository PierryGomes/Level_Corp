"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, Send, Pin, Bot, Hash, Megaphone, ChevronDown, ChevronRight,
  Sparkles, MessageSquare, Users, Search, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { type MockUser, roleLabels } from "@/lib/mock-data"
import {
  channels, departmentMessages, announcements, createReactions,
  aiResponses, type ChatMessage, type ChatChannel,
} from "@/lib/chat-data"

// ── Department Chat View ───────────────────────────────────
function DepartmentChat({
  channel,
  userRole,
}: {
  channel: ChatChannel
  userRole: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => departmentMessages[channel.id] ?? []
  )
  const [input, setInput] = useState("")
  const [showPinned, setShowPinned] = useState(false)
  const [xpToast, setXpToast] = useState<{ text: string; id: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const toastId = useRef(0)

  useEffect(() => {
    setMessages(departmentMessages[channel.id] ?? [])
  }, [channel.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const pinnedMessages = messages.filter((m) => m.isPinned)

  function handleSend() {
    if (!input.trim()) return
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: "player",
      senderName: "Voce",
      senderInitials: "VC",
      senderColor: "#EAB308",
      senderRole: userRole as "colaborador" | "gestor" | "ceo",
      content: input.trim(),
      timestamp: new Date(),
      reactions: createReactions(),
      isPinned: false,
      isAnnouncement: false,
    }
    setMessages((prev) => [...prev, newMsg])
    setInput("")
  }

  function handleReact(msgId: string, reactionIdx: number) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m
        const newReactions = m.reactions.map((r, i) => {
          if (i !== reactionIdx) return r
          if (r.reacted) return { ...r, count: r.count - 1, reacted: false }
          return { ...r, count: r.count + 1, reacted: true }
        })
        return { ...m, reactions: newReactions }
      })
    )
    const reaction = messages.find((m) => m.id === msgId)?.reactions[reactionIdx]
    if (reaction && !reaction.reacted) {
      toastId.current += 1
      setXpToast({ text: `+${reaction.xp} XP - ${reaction.label}!`, id: toastId.current })
      setTimeout(() => setXpToast(null), 2000)
    }
  }

  function handlePin(msgId: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isPinned: !m.isPinned } : m))
    )
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const roleIndicator = (role: string) => {
    if (role === "ceo") return "border-l-4 border-l-yellow-500"
    if (role === "gestor") return "border-l-4 border-l-purple-500"
    return ""
  }

  return (
    <div className="flex h-full flex-col">
      {/* XP Toast */}
      {xpToast && (
        <div key={xpToast.id} className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-lg animate-in fade-in zoom-in duration-200">
          {xpToast.text}
        </div>
      )}

      {/* Channel Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {channel.icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{channel.name}</h2>
            <p className="text-xs text-muted-foreground">{channel.memberCount} membros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pinnedMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPinned(!showPinned)}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Pin className="h-3.5 w-3.5" />
              {pinnedMessages.length} fixadas
            </Button>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {channel.memberCount}
          </div>
        </div>
      </div>

      {/* Pinned collapse */}
      {showPinned && pinnedMessages.length > 0 && (
        <div className="border-b border-border bg-primary/5 px-5 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Pin className="h-3 w-3" /> Mensagens Fixadas
          </p>
          <div className="space-y-2">
            {pinnedMessages.map((m) => (
              <div key={m.id} className="rounded-lg bg-card p-2.5 text-xs">
                <span className="font-semibold text-foreground">{m.senderName}: </span>
                <span className="text-muted-foreground">{m.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
        {messages.map((m, idx) => {
          const showAvatar = idx === 0 || messages[idx - 1].senderId !== m.senderId
          const isPlayer = m.senderId === "player"

          return (
            <div
              key={m.id}
              className={`group relative rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/30 ${roleIndicator(m.senderRole)} ${showAvatar ? "mt-3" : ""}`}
            >
              <div className="flex gap-3">
                {showAvatar ? (
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: isPlayer ? "#EAB308" : m.senderColor }}
                  >
                    {isPlayer ? "VC" : m.senderInitials}
                  </div>
                ) : (
                  <div className="w-8 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  {showAvatar && (
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {isPlayer ? "Voce" : m.senderName}
                      </span>
                      {m.senderRole === "ceo" && (
                        <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">CEO</span>
                      )}
                      {m.senderRole === "gestor" && (
                        <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">Gestor</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-foreground">{m.content}</p>

                  {/* Reactions */}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {m.reactions.map((r, i) => (
                      (r.count > 0 || false) ? (
                        <button
                          key={i}
                          onClick={() => handleReact(m.id, i)}
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-all hover:scale-105 ${
                            r.reacted
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30"
                          }`}
                          title={`${r.label} (+${r.xp} XP)`}
                        >
                          <span>{r.emoji}</span>
                          <span>{r.count}</span>
                        </button>
                      ) : null
                    ))}

                    {/* Quick react buttons on hover */}
                    <div className="ml-1 hidden items-center gap-0.5 group-hover:flex">
                      {m.reactions.map((r, i) => (
                        r.count === 0 ? (
                          <button
                            key={i}
                            onClick={() => handleReact(m.id, i)}
                            className="rounded-full px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title={`${r.label} (+${r.xp} XP)`}
                          >
                            {r.emoji}
                          </button>
                        ) : null
                      ))}
                      {(userRole === "gestor" || userRole === "ceo") && (
                        <button
                          onClick={() => handlePin(m.id)}
                          className={`rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${m.isPinned ? "text-primary" : ""}`}
                          title={m.isPinned ? "Desafixar" : "Fixar"}
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border px-5 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Mensagem em #${channel.name}...`}
            className="flex-1 text-sm"
          />
          <Button type="submit" size="icon" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── Announcements View ─────────────────────────────────────
function AnnouncementsView({
  userRole,
}: {
  userRole: string
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>(() => [...announcements])
  const [input, setInput] = useState("")
  const [xpToast, setXpToast] = useState<{ text: string; id: number } | null>(null)
  const toastId = useRef(0)

  function handleSend() {
    if (!input.trim()) return
    if (userRole !== "ceo" && userRole !== "gestor") return
    const newMsg: ChatMessage = {
      id: `announce-${Date.now()}`,
      senderId: "player",
      senderName: "Voce",
      senderInitials: "VC",
      senderColor: userRole === "ceo" ? "#EAB308" : "#8B5CF6",
      senderRole: userRole as "ceo" | "gestor",
      content: input.trim(),
      timestamp: new Date(),
      reactions: createReactions(),
      isPinned: false,
      isAnnouncement: true,
    }
    setMsgs((prev) => [newMsg, ...prev])
    setInput("")
  }

  function handleReact(msgId: string, reactionIdx: number) {
    setMsgs((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m
        const newReactions = m.reactions.map((r, i) => {
          if (i !== reactionIdx) return r
          if (r.reacted) return { ...r, count: r.count - 1, reacted: false }
          return { ...r, count: r.count + 1, reacted: true }
        })
        return { ...m, reactions: newReactions }
      })
    )
    const reaction = msgs.find((m) => m.id === msgId)?.reactions[reactionIdx]
    if (reaction && !reaction.reacted) {
      toastId.current += 1
      setXpToast({ text: `+${reaction.xp} XP - ${reaction.label}!`, id: toastId.current })
      setTimeout(() => setXpToast(null), 2000)
    }
  }

  const borderColor = (role: string) => {
    if (role === "ceo") return "border-l-4 border-l-yellow-500"
    if (role === "gestor") return "border-l-4 border-l-purple-500"
    return ""
  }

  return (
    <div className="flex h-full flex-col">
      {xpToast && (
        <div key={xpToast.id} className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-lg animate-in fade-in zoom-in duration-200">
          {xpToast.text}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Comunicados</h2>
            <p className="text-xs text-muted-foreground">Mensagens oficiais da lideranca</p>
          </div>
        </div>
      </div>

      {/* Compose for CEO/Gestor */}
      {(userRole === "ceo" || userRole === "gestor") && (
        <div className="border-b border-border px-5 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={userRole === "ceo" ? "Novo comunicado global..." : "Mensagem para sua equipe..."}
              className="flex-1 text-sm"
            />
            <Button type="submit" size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Megaphone className="h-3.5 w-3.5" />
              Enviar
            </Button>
          </form>
        </div>
      )}

      {/* Announcements list */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.map((m) => {
          const totalReactions = m.reactions.reduce((sum, r) => sum + r.count, 0)

          return (
            <div
              key={m.id}
              className={`rounded-xl border border-border bg-card p-5 ${borderColor(m.senderRole)}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: m.senderColor }}
                >
                  {m.senderInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{m.senderName}</span>
                    {m.senderRole === "ceo" && (
                      <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">CEO</span>
                    )}
                    {m.senderRole === "gestor" && (
                      <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">Gestor</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {m.timestamp.toLocaleDateString("pt-BR")} as {m.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {totalReactions > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalReactions} reacoes
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-foreground">{m.content}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.reactions.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleReact(m.id, i)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all hover:scale-105 ${
                      r.reacted
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30"
                    }`}
                    title={`${r.label} (+${r.xp} XP)`}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── AI Assistant Panel ─────────────────────────────────────
function AiAssistant() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{ question: string; answer: string }[]>([])
  const [loading, setLoading] = useState(false)

  const commands = [
    { key: "resumir", label: "Resumir Conversa", desc: "Gera um resumo das mensagens recentes" },
    { key: "tarefas", label: "Extrair Tarefas", desc: "Identifica tarefas mencionadas no chat" },
    { key: "tom", label: "Analisar Tom", desc: "Analisa o tom e sentimento da conversa" },
    { key: "engajamento", label: "Analise de Engajamento", desc: "Metricas de participacao do canal" },
  ]

  function handleCommand(key: string) {
    setLoading(true)
    setTimeout(() => {
      const answer = aiResponses[key] ?? "Comando nao reconhecido."
      const label = commands.find((c) => c.key === key)?.label ?? key
      setResults((prev) => [{ question: label, answer }, ...prev])
      setLoading(false)
    }, 800 + Math.random() * 600)
  }

  function handleFreeQuery() {
    if (!query.trim()) return
    setLoading(true)
    setTimeout(() => {
      setResults((prev) => [{
        question: query,
        answer: "Com base na analise das conversas recentes:\n\n- O engajamento geral esta positivo\n- Existem 3 tarefas pendentes identificadas\n- O tom predominante e colaborativo\n- Sugestao: reconhecer publicamente as contribuicoes de destaque\n\nPosso detalhar algum desses pontos?",
      }, ...prev])
      setLoading(false)
      setQuery("")
    }, 1000 + Math.random() * 500)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Assistente IA</h2>
          <p className="text-xs text-muted-foreground">Analise, resumo e insights das conversas</p>
        </div>
      </div>

      {/* Quick commands */}
      <div className="border-b border-border px-5 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Comandos rapidos</p>
        <div className="flex flex-wrap gap-2">
          {commands.map((cmd) => (
            <button
              key={cmd.key}
              onClick={() => handleCommand(cmd.key)}
              disabled={loading}
              className="rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
            >
              <p className="text-xs font-medium text-foreground">{cmd.label}</p>
              <p className="text-[10px] text-muted-foreground">{cmd.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Free query */}
      <div className="border-b border-border px-5 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleFreeQuery() }}
          className="flex items-center gap-2"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte algo sobre as conversas..."
            className="flex-1 text-sm"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            <Sparkles className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Analisando conversas...</span>
          </div>
        )}
        {results.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{r.question}</span>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-sans">
              {r.answer}
            </pre>
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Assistente IA LevelCorp</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Use os comandos rapidos ou faca uma pergunta para obter insights sobre as conversas do seu time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Chat Page ─────────────────────────────────────────
type ActiveView = { type: "channel"; channel: ChatChannel } | { type: "announcements" } | { type: "ai" }

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>({ type: "channel", channel: channels[0] })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [channelsExpanded, setChannelsExpanded] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) { router.push("/login"); return }
    try { setUser(JSON.parse(stored)) } catch { router.push("/login") }
  }, [router])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const deptChannels = channels.filter((c) => c.type === "department")

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-border" />
          <Image src="/images/logo.png" alt="LevelCorp" width={120} height={30} className="h-6 w-auto" />
          <span className="ml-2 text-sm font-medium text-muted-foreground">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground md:hidden"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {roleLabels[user.role]}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} w-64 shrink-0 flex-col border-r border-border bg-card md:flex`}>
          {/* Search */}
          <div className="px-3 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." className="h-8 pl-8 text-xs" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {/* Channels section */}
            <button
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              className="mb-1 flex w-full items-center gap-1 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {channelsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Canais
            </button>
            {channelsExpanded && (
              <div className="mb-3 space-y-0.5">
                {deptChannels.map((ch) => {
                  const isActive = activeView.type === "channel" && activeView.channel.id === ch.id
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveView({ type: "channel", channel: ch }); setSidebarOpen(false) }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Hash className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      <span className="flex-1 truncate">{ch.name}</span>
                      {ch.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {ch.unread}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Announcements */}
            <p className="mb-1 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Geral
            </p>
            <div className="mb-3 space-y-0.5">
              <button
                onClick={() => { setActiveView({ type: "announcements" }); setSidebarOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  activeView.type === "announcements"
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Megaphone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="flex-1">Comunicados</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              </button>
            </div>

            {/* AI Assistant */}
            <p className="mb-1 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ferramentas
            </p>
            <button
              onClick={() => { setActiveView({ type: "ai" }); setSidebarOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                activeView.type === "ai"
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bot className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="flex-1">Assistente IA</span>
              <Sparkles className="h-3 w-3 text-primary" />
            </button>

            {/* Role-specific actions */}
            {(user.role === "ceo" || user.role === "gestor") && (
              <div className="mt-4 px-2">
                <Button
                  size="sm"
                  className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setActiveView({ type: "announcements" })}
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  {user.role === "ceo" ? "Novo Comunicado" : "Mensagem para Equipe"}
                </Button>
              </div>
            )}
          </div>

          {/* User info at bottom */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{roleLabels[user.role]}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="relative flex-1 overflow-hidden">
          {activeView.type === "channel" && (
            <DepartmentChat channel={activeView.channel} userRole={user.role} />
          )}
          {activeView.type === "announcements" && (
            <AnnouncementsView userRole={user.role} />
          )}
          {activeView.type === "ai" && (
            <AiAssistant />
          )}
        </main>
      </div>
    </div>
  )
}
