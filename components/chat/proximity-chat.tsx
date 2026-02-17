"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Phone, Video, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type NPC } from "@/lib/map-data"
import { getProximityMessages, createReactions, type ChatMessage, type Reaction } from "@/lib/chat-data"

interface Props {
  npc: NPC
  onClose: () => void
}

export function ProximityChat({ npc, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getProximityMessages(npc))
  const [input, setInput] = useState("")
  const [xpToast, setXpToast] = useState<{ text: string; id: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const toastCounter = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: "player",
      senderName: "Voce",
      senderInitials: "VC",
      senderColor: "#EAB308",
      senderRole: "colaborador",
      content: input.trim(),
      timestamp: new Date(),
      reactions: createReactions(),
      isPinned: false,
      isAnnouncement: false,
    }
    setMessages((prev) => [...prev, newMsg])
    setInput("")

    // Simulated NPC reply after a short delay
    setTimeout(() => {
      const replies = [
        `Entendi! Vou dar uma olhada nisso.`,
        `Boa observacao! Concordo com voce.`,
        `Obrigado por compartilhar! Vamos alinhar depois.`,
        `Show! Estou trabalhando nisso agora.`,
        `Perfeito, ja anoto aqui nos meus to-dos.`,
      ]
      const reply: ChatMessage = {
        id: `npc-reply-${Date.now()}`,
        senderId: npc.id,
        senderName: npc.name,
        senderInitials: npc.initials,
        senderColor: npc.avatarColor,
        senderRole: npc.isCeo ? "ceo" : npc.isManager ? "gestor" : "colaborador",
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
        reactions: createReactions(),
        isPinned: false,
        isAnnouncement: false,
      }
      setMessages((prev) => [...prev, reply])
    }, 1200 + Math.random() * 800)
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
      toastCounter.current += 1
      setXpToast({ text: `+${reaction.xp} XP - ${reaction.label}!`, id: toastCounter.current })
      setTimeout(() => setXpToast(null), 2000)
    }
  }

  const statusColors: Record<string, string> = { online: "#22c55e", busy: "#ef4444", away: "#eab308" }

  return (
    <div className="absolute bottom-0 right-4 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      {/* XP Toast */}
      {xpToast && (
        <div key={xpToast.id} className="absolute left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-lg animate-in fade-in zoom-in duration-200">
          {xpToast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card p-4">
        <div className="relative">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: npc.avatarColor }}
          >
            {npc.initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card"
            style={{ backgroundColor: statusColors[npc.status] }}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{npc.name}</p>
          <p className="text-xs text-muted-foreground">{npc.role} - {npc.department}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Chamada de voz (em breve)">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Video chamada (em breve)">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* NPC info bar */}
      <div className="flex items-center gap-4 border-b border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">Lv.{npc.level}</span>
        <span>{npc.xp.toLocaleString()} XP</span>
        <span className="capitalize">{npc.status}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "320px", minHeight: "200px" }}>
        {messages.map((m) => {
          const isPlayer = m.senderId === "player"
          return (
            <div key={m.id} className={`flex gap-2.5 ${isPlayer ? "flex-row-reverse" : ""}`}>
              {!isPlayer && (
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: m.senderColor }}
                >
                  {m.senderInitials}
                </div>
              )}
              <div className={`max-w-[75%] ${isPlayer ? "items-end" : ""}`}>
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm ${
                    isPlayer
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                <div className={`mt-1 flex items-center gap-1 ${isPlayer ? "justify-end" : ""}`}>
                  <span className="text-[10px] text-muted-foreground">
                    {m.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {/* Reactions */}
                {!isPlayer && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.reactions.map((r, i) => (
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
                        {r.count > 0 && <span>{r.count}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Mensagem para ${npc.name.split(" ")[0]}...`}
            className="flex-1 rounded-full bg-muted/50 text-sm"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
