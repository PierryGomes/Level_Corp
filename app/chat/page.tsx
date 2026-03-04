"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, Send, Hash, Search, X, Phone, Video, PhoneOff, PhoneIncoming,
  PhoneMissed, PhoneOutgoing, Mic, MicOff, VideoOff, Monitor, MoreVertical,
  MessageSquare, Users, CheckSquare, Calendar, Folder, Pin, ChevronDown,
  ChevronRight, Plus, Clock, Grid3X3, List, FileText, ImageIcon, Sheet,
  Presentation, Archive, FolderOpen, Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { type MockUser } from "@/lib/mock-data"
import { channels, departmentMessages, type ChatChannel } from "@/lib/chat-data"
import { npcs } from "@/lib/map-data"
import {
  dmConversations, groupChats, channelThreads, tasks, calendarEvents,
  callRecords, sharedFiles, speedDial, statusLabels, priorityConfig,
  labelConfig, fileTypeIcons,
  type DMConversation, type GroupChat, type ChannelThread, type KanbanTask,
  type CalendarEvent, type CallRecord, type SharedFile, type TaskStatus,
} from "@/lib/comms-data"

// ── Helpers ────────────────────────────────────────────────
function timeAgo(d: Date) {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function StatusDot({ status }: { status: string }) {
  const c = status === "online" ? "bg-emerald-500" : status === "busy" ? "bg-red-500" : "bg-amber-500"
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${c} ring-2 ring-background`} />
}

function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm"
  return (
    <div className={`flex ${s} shrink-0 items-center justify-center rounded-full font-bold text-white`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  )
}

// ── Section type ──────────────────────────────────────────
type Section = "chat" | "channels" | "tasks" | "calendar" | "calls" | "files"

// ── Simulated Call Modal ──────────────────────────────────
function CallModal({ peer, onClose }: { peer: { name: string; initials: string; color: string }; onClose: () => void }) {
  const [state, setState] = useState<"ringing" | "connected">("ringing")
  const [timer, setTimer] = useState(0)
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setState("connected"), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (state !== "connected") return
    const i = setInterval(() => setTimer((p) => p + 1), 1000)
    return () => clearInterval(i)
  }, [state])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-card p-10 text-center shadow-2xl">
        <div className="relative">
          <Avatar initials={peer.initials} color={peer.color} size="lg" />
          {state === "ringing" && (
            <span className="absolute -inset-2 animate-ping rounded-full border-2 border-primary opacity-30" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{peer.name}</p>
          <p className="text-sm text-muted-foreground">
            {state === "ringing" ? "Chamando..." : formatDuration(timer)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${muted ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${!videoOn ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
            <Monitor className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 1. CHAT SECTION (DMs + Groups)
// ══════════════════════════════════════════════════════════
function ChatSection({ user, onCall }: { user: MockUser; onCall: (p: { name: string; initials: string; color: string }) => void }) {
  const [selectedDm, setSelectedDm] = useState<DMConversation | null>(null)
  const [selectedGrp, setSelectedGrp] = useState<GroupChat | null>(null)
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")
  const [dmMsgs, setDmMsgs] = useState(dmConversations)
  const [grpMsgs, setGrpMsgs] = useState(groupChats)
  const [showGroups, setShowGroups] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [selectedDm, selectedGrp, dmMsgs, grpMsgs])

  const filteredDms = dmMsgs.filter((c) => c.peerName.toLowerCase().includes(search.toLowerCase()))
  const filteredGrps = grpMsgs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const activeConvo = selectedDm || selectedGrp
  const activeMsgs = selectedDm?.messages ?? selectedGrp?.messages ?? []
  const activeName = selectedDm?.peerName ?? selectedGrp?.name ?? ""

  function sendMessage() {
    if (!input.trim()) return
    const newMsg = { id: `u-${Date.now()}`, text: input, senderId: "me", timestamp: new Date(), read: true, reactions: [] }
    if (selectedDm) {
      setDmMsgs((prev) => prev.map((c) => c.id === selectedDm.id ? { ...c, messages: [...c.messages, newMsg] } : c))
      setSelectedDm((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null)
    } else if (selectedGrp) {
      setGrpMsgs((prev) => prev.map((c) => c.id === selectedGrp.id ? { ...c, messages: [...c.messages, newMsg] } : c))
      setSelectedGrp((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null)
    }
    setInput("")
  }

  return (
    <div className="flex h-full">
      {/* Contact List */}
      <div className="flex w-72 flex-col border-r border-border/50 bg-card/50">
        <div className="border-b border-border/50 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="pl-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* DMs */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensagens Diretas</p>
          </div>
          {filteredDms.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedDm(c); setSelectedGrp(null) }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${selectedDm?.id === c.id ? "bg-primary/10" : ""}`}
            >
              <div className="relative">
                <Avatar initials={c.peerInitials} color={c.peerColor} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={c.peerStatus} /></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">{c.peerName}</p>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.messages[c.messages.length - 1]?.timestamp ?? new Date())}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.messages[c.messages.length - 1]?.text ?? ""}</p>
              </div>
              {c.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.unread}</span>
              )}
            </button>
          ))}
          {/* Groups */}
          <button onClick={() => setShowGroups(!showGroups)} className="flex w-full items-center gap-1 px-3 pt-4 pb-1">
            {showGroups ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grupos</p>
          </button>
          {showGroups && filteredGrps.map((g) => (
            <button
              key={g.id}
              onClick={() => { setSelectedGrp(g); setSelectedDm(null) }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${selectedGrp?.id === g.id ? "bg-primary/10" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: g.color }}>
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{g.name}</p>
                <p className="truncate text-xs text-muted-foreground">{g.members.length} membros</p>
              </div>
              {g.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{g.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {!activeConvo ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma mensagem direta ou grupo ao lado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div className="flex items-center gap-3">
                {selectedDm ? (
                  <>
                    <Avatar initials={selectedDm.peerInitials} color={selectedDm.peerColor} size="sm" />
                    <div>
                      <p className="font-semibold text-foreground">{selectedDm.peerName}</p>
                      <p className="text-xs text-muted-foreground">{selectedDm.peerRole} - {selectedDm.peerDept}</p>
                    </div>
                  </>
                ) : selectedGrp ? (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: selectedGrp.color }}>
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedGrp.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedGrp.members.length} membros</p>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (selectedDm) onCall({ name: selectedDm.peerName, initials: selectedDm.peerInitials, color: selectedDm.peerColor })
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (selectedDm) onCall({ name: selectedDm.peerName, initials: selectedDm.peerInitials, color: selectedDm.peerColor })
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {activeMsgs.map((m) => {
                  const isMe = m.senderId === "me"
                  const sender = !isMe ? npcs.find((n) => n.id === m.senderId) : null
                  return (
                    <div key={m.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      {isMe ? (
                        <Avatar initials={user.avatar} color="#3B82F6" size="sm" />
                      ) : sender ? (
                        <Avatar initials={sender.initials} color={sender.avatarColor} size="sm" />
                      ) : (
                        <Avatar initials="?" color="#6B7280" size="sm" />
                      )}
                      <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                        <div className="mb-0.5 flex items-center gap-2">
                          {isMe ? (
                            <>
                              <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                              <span className="text-xs font-medium text-foreground">Voce</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-medium text-foreground">{sender?.name ?? "Desconhecido"}</span>
                              <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                            </>
                          )}
                        </div>
                        <div className={`inline-block rounded-xl px-3.5 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Compose */}
            <div className="border-t border-border/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Mensagem para ${activeName}...`}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 2. CHANNELS SECTION
// ══════════════════════════════════════════════════════════
function ChannelsSection({ user }: { user: MockUser }) {
  const deptChannels = channels.filter((c) => c.type === "department")
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null)
  const [selectedThread, setSelectedThread] = useState<ChannelThread | null>(null)
  const [input, setInput] = useState("")
  const [threadInput, setThreadInput] = useState("")
  const [msgs, setMsgs] = useState(departmentMessages)
  const [threads, setThreads] = useState(channelThreads)
  const scrollRef = useRef<HTMLDivElement>(null)
  const threadScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [selectedChannel, msgs])

  useEffect(() => {
    threadScrollRef.current?.scrollTo({ top: threadScrollRef.current.scrollHeight, behavior: "smooth" })
  }, [selectedThread, threads])

  const chThreads = threads.filter((t) => t.channelId === selectedChannel?.id)
  const chMsgs = selectedChannel ? (msgs[selectedChannel.id] ?? []) : []

  function sendChannelMsg() {
    if (!input.trim() || !selectedChannel) return
    const newMsg = {
      id: `u-${Date.now()}`, senderId: "me", senderName: user.name, senderInitials: user.avatar,
      senderColor: "#3B82F6", senderRole: user.role as "colaborador" | "gestor" | "ceo",
      content: input, timestamp: new Date(), reactions: [], isPinned: false, isAnnouncement: false,
    }
    setMsgs((prev) => ({ ...prev, [selectedChannel.id]: [...(prev[selectedChannel.id] ?? []), newMsg] }))
    setInput("")
  }

  function sendThreadReply() {
    if (!threadInput.trim() || !selectedThread) return
    const reply = {
      id: `r-${Date.now()}`, senderId: "me", senderName: user.name, senderInitials: user.avatar,
      senderColor: "#3B82F6", text: threadInput, timestamp: new Date(),
    }
    setThreads((prev) => prev.map((t) => t.id === selectedThread.id ? { ...t, replies: [...t.replies, reply] } : t))
    setSelectedThread((prev) => prev ? { ...prev, replies: [...prev.replies, reply] } : null)
    setThreadInput("")
  }

  return (
    <div className="flex h-full">
      {/* Channel list */}
      <div className="flex w-60 flex-col border-r border-border/50 bg-card/50">
        <div className="border-b border-border/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Canais</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {deptChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => { setSelectedChannel(ch); setSelectedThread(null) }}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-muted/50 ${selectedChannel?.id === ch.id ? "bg-primary/10" : ""}`}
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{ch.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main channel area */}
      <div className="flex flex-1 flex-col">
        {!selectedChannel ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Hash className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Selecione um canal</p>
              <p className="text-sm">Escolha um canal de departamento ao lado</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <p className="font-semibold text-foreground">{selectedChannel.name}</p>
                <span className="text-xs text-muted-foreground">{selectedChannel.memberCount} membros</span>
              </div>
              {chThreads.filter((t) => t.pinned).length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Pin className="h-3 w-3" />
                  <span>{chThreads.filter((t) => t.pinned).length} fixados</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Messages */}
              <div className="flex flex-1 flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Threads preview */}
                  {chThreads.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Threads</p>
                      {chThreads.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedThread(t)}
                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${selectedThread?.id === t.id ? "border-primary/50 bg-primary/5" : "border-border/50"} ${t.pinned ? "border-primary/30" : ""}`}
                        >
                          <Avatar initials={t.rootMessage.senderInitials} color={t.rootMessage.senderColor} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{t.rootMessage.senderName}</span>
                              {t.pinned && <Pin className="h-3 w-3 text-primary" />}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{t.rootMessage.text}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground">{t.replies.length} respostas</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Channel messages */}
                  <div className="space-y-3">
                    {chMsgs.map((m) => (
                      <div key={m.id} className="flex gap-3">
                        <Avatar initials={m.senderInitials} color={m.senderColor} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{m.senderName}</span>
                            {m.senderRole === "ceo" && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">CEO</span>}
                            {m.senderRole === "gestor" && <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-500">Gestor</span>}
                            <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                            {m.isPinned && <Pin className="h-3 w-3 text-primary" />}
                          </div>
                          <p className="mt-0.5 text-sm text-foreground">{m.content}</p>
                          {m.reactions.some((r) => r.count > 0) && (
                            <div className="mt-1 flex gap-1">
                              {m.reactions.filter((r) => r.count > 0).map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-xs">
                                  {r.emoji} {r.count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Compose */}
                <div className="border-t border-border/50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChannelMsg()}
                      placeholder={`Mensagem em #${selectedChannel.name}...`}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={sendChannelMsg} disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Thread sidebar */}
              {selectedThread && (
                <div className="flex w-80 flex-col border-l border-border/50">
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Thread</p>
                    <button onClick={() => setSelectedThread(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div ref={threadScrollRef} className="flex-1 overflow-y-auto px-4 py-3">
                    {/* Root */}
                    <div className="mb-4 rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={selectedThread.rootMessage.senderInitials} color={selectedThread.rootMessage.senderColor} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{selectedThread.rootMessage.senderName}</p>
                          <p className="text-[10px] text-muted-foreground">{formatTime(selectedThread.rootMessage.timestamp)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{selectedThread.rootMessage.text}</p>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">{selectedThread.replies.length} respostas</p>
                    <div className="space-y-3">
                      {selectedThread.replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <Avatar initials={r.senderInitials} color={r.senderColor} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-foreground">{r.senderName}</span>
                              <span className="text-[10px] text-muted-foreground">{formatTime(r.timestamp)}</span>
                            </div>
                            <p className="mt-0.5 text-sm text-foreground">{r.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={threadInput} onChange={(e) => setThreadInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendThreadReply()}
                        placeholder="Responder na thread..."
                        className="flex-1 text-sm"
                      />
                      <Button size="icon" variant="ghost" onClick={sendThreadReply} disabled={!threadInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 3. TASKS SECTION (Kanban)
// ══════════════════════════════════════════════════════════
function TasksSection() {
  const [taskList, setTaskList] = useState(tasks)
  const [filter, setFilter] = useState<string>("all")
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [movingTask, setMovingTask] = useState<string | null>(null)

  const columns: TaskStatus[] = ["todo", "doing", "done"]
  const filtered = filter === "all" ? taskList : taskList.filter((t) => t.assigneeId === filter)

  const uniqueAssignees = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    taskList.forEach((t) => { if (!map.has(t.assigneeId)) map.set(t.assigneeId, { id: t.assigneeId, name: t.assigneeName }) })
    return Array.from(map.values())
  }, [taskList])

  function moveTask(taskId: string, newStatus: TaskStatus) {
    setTaskList((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t))
    setMovingTask(null)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-foreground">Quadro de Tarefas</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs text-foreground"
          >
            <option value="all">Todos</option>
            {uniqueAssignees.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="mr-1 h-3 w-3" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-5 py-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Titulo da nova tarefa..." className="flex-1 text-sm" />
          <Button size="sm" onClick={() => {
            if (!newTitle.trim()) return
            const n = npcs[0]
            setTaskList((prev) => [...prev, {
              id: `t-${Date.now()}`, title: newTitle, description: "", status: "todo" as TaskStatus, priority: "media" as const,
              assigneeId: n.id, assigneeName: n.name, assigneeInitials: n.initials, assigneeColor: n.avatarColor,
              dueDate: new Date(Date.now() + 7 * 86400000), labels: ["feature" as const], createdAt: new Date(), channelId: "ch-tec",
            }])
            setNewTitle("")
            setShowAdd(false)
          }}>Criar</Button>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto p-5">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col)
          return (
            <div key={col} className="flex w-80 shrink-0 flex-col rounded-xl border border-border/50 bg-card/50">
              <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col === "todo" ? "bg-muted-foreground" : col === "doing" ? "bg-blue-500" : "bg-emerald-500"}`} />
                  <p className="text-sm font-semibold text-foreground">{statusLabels[col]}</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{colTasks.length}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {colTasks.map((t) => (
                  <div key={t.id} className="group rounded-lg border border-border/50 bg-background p-3 transition-colors hover:border-border">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {t.labels.map((l) => (
                        <span key={l} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: labelConfig[l].color }}>
                          {labelConfig[l].label}
                        </span>
                      ))}
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: priorityConfig[t.priority].color + "20", color: priorityConfig[t.priority].color }}>
                        {priorityConfig[t.priority].label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar initials={t.assigneeInitials} color={t.assigneeColor} size="sm" />
                        <span className="text-xs text-muted-foreground">{t.assigneeName.split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(t.dueDate)}
                      </div>
                    </div>
                    {/* Move controls */}
                    {movingTask === t.id ? (
                      <div className="mt-2 flex gap-1">
                        {columns.filter((c) => c !== col).map((c) => (
                          <button key={c} onClick={() => moveTask(t.id, c)} className="flex-1 rounded bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">
                            {statusLabels[c]}
                          </button>
                        ))}
                        <button onClick={() => setMovingTask(null)} className="rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMovingTask(t.id)}
                        className="mt-2 hidden w-full rounded bg-muted/50 py-1 text-[10px] text-muted-foreground hover:bg-muted group-hover:block"
                      >
                        Mover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 4. CALENDAR SECTION
// ══════════════════════════════════════════════════════════
function CalendarSection() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Build 7-day range from today
  const days = useMemo(() => {
    const result: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      d.setHours(0, 0, 0, 0)
      result.push(d)
    }
    return result
  }, [])

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8-19

  function getEventsForDay(day: Date) {
    return calendarEvents.filter((e) => {
      const ed = new Date(e.date)
      return ed.getFullYear() === day.getFullYear() && ed.getMonth() === day.getMonth() && ed.getDate() === day.getDate()
    })
  }

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-foreground">Calendario - Proximos 7 dias</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="sticky top-0 z-10 grid bg-card/90 backdrop-blur-sm" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
              <div className="border-b border-r border-border/30 p-2" />
              {days.map((d, i) => {
                const isToday = i === 0
                return (
                  <div key={i} className={`border-b border-r border-border/30 p-2 text-center ${isToday ? "bg-primary/5" : ""}`}>
                    <p className="text-xs text-muted-foreground">{dayLabels[d.getDay()]}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{d.getDate()}</p>
                  </div>
                )
              })}
            </div>
            {/* Hour rows */}
            {hours.map((h) => (
              <div key={h} className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
                <div className="flex items-start justify-end border-r border-border/30 pr-2 pt-1">
                  <span className="text-[10px] text-muted-foreground">{h}:00</span>
                </div>
                {days.map((d, di) => {
                  const dayEvents = getEventsForDay(d).filter((e) => e.date.getHours() === h)
                  return (
                    <div key={di} className="relative min-h-[50px] border-b border-r border-border/20 p-0.5">
                      {dayEvents.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="mb-0.5 w-full rounded px-1.5 py-1 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-80"
                          style={{ backgroundColor: e.color }}
                        >
                          <p className="truncate">{e.title}</p>
                          <p className="opacity-75">{formatTime(e.date)} - {e.durationMinutes}min</p>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Event detail */}
        {selectedEvent && (
          <div className="w-80 border-l border-border/50 bg-card/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-foreground">Detalhes</p>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 h-1 w-8 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                <p className="text-lg font-bold text-foreground">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(selectedEvent.date)} as {formatTime(selectedEvent.date)} ({selectedEvent.durationMinutes}min)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
                {selectedEvent.isRecurring && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Circle className="h-4 w-4" />
                    <span>Evento recorrente</span>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participantes ({selectedEvent.attendees.length})</p>
                <div className="space-y-2">
                  {selectedEvent.attendees.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <Avatar initials={a.initials} color={a.color} size="sm" />
                      <span className="text-sm text-foreground">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 5. CALLS SECTION
// ══════════════════════════════════════════════════════════
function CallsSection({ onCall }: { onCall: (p: { name: string; initials: string; color: string }) => void }) {
  const [tab, setTab] = useState<"history" | "contacts">("history")

  const dirIcon = (d: string) => {
    if (d === "incoming") return <PhoneIncoming className="h-3.5 w-3.5 text-emerald-500" />
    if (d === "outgoing") return <PhoneOutgoing className="h-3.5 w-3.5 text-blue-500" />
    return <PhoneMissed className="h-3.5 w-3.5 text-red-500" />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-foreground">Chamadas</p>
        </div>
        <div className="flex rounded-lg border border-border/50 p-0.5">
          <button onClick={() => setTab("history")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${tab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Historico
          </button>
          <button onClick={() => setTab("contacts")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${tab === "contacts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Contatos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "history" ? (
          <div className="divide-y divide-border/30">
            {callRecords.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30">
                <Avatar initials={c.peerInitials} color={c.peerColor} size="sm" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${c.direction === "missed" ? "text-red-500" : "text-foreground"}`}>{c.peerName}</p>
                  <div className="flex items-center gap-1.5">
                    {dirIcon(c.direction)}
                    <span className="text-xs text-muted-foreground">
                      {c.type === "video" ? "Video" : "Audio"} - {timeAgo(c.timestamp)}
                    </span>
                    {c.durationSeconds > 0 && <span className="text-xs text-muted-foreground">({formatDuration(c.durationSeconds)})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onCall({ name: c.peerName, initials: c.peerInitials, color: c.peerColor })}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onCall({ name: c.peerName, initials: c.peerInitials, color: c.peerColor })}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {speedDial.map((c) => (
              <button
                key={c.id}
                onClick={() => onCall({ name: c.name, initials: c.initials, color: c.color })}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/50 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="relative">
                  <Avatar initials={c.initials} color={c.color} />
                  <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={c.status} /></span>
                </div>
                <p className="text-center text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-center text-[10px] text-muted-foreground">{c.role}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// 6. FILES SECTION
// ══════════════════════════════════════════════════════════
function FilesSection() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [channelFilter, setChannelFilter] = useState("all")
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null)

  const filtered = sharedFiles.filter((f) => {
    const matchName = f.name.toLowerCase().includes(search.toLowerCase())
    const matchChannel = channelFilter === "all" || f.channelId === channelFilter
    return matchName && matchChannel
  })

  const channelOptions = useMemo(() => {
    const set = new Map<string, string>()
    sharedFiles.forEach((f) => set.set(f.channelId, f.channelName))
    return Array.from(set.entries())
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <Folder className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-foreground">Arquivos</p>
          <span className="text-xs text-muted-foreground">{filtered.length} arquivos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="h-8 w-40 pl-8 text-xs" />
          </div>
          <select
            value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
            className="h-8 rounded-lg border border-border/50 bg-background px-2 text-xs text-foreground"
          >
            <option value="all">Todos os canais</option>
            {channelOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border/50 p-0.5">
            <button onClick={() => setView("grid")} className={`rounded-md p-1.5 ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView("list")} className={`rounded-md p-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5">
          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((f) => {
                const ft = fileTypeIcons[f.type]
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFile(f)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors hover:border-primary/30 hover:bg-primary/5 ${selectedFile?.id === f.id ? "border-primary bg-primary/5" : "border-border/50"}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: ft.color }}>
                      {ft.label}
                    </div>
                    <p className="w-full truncate text-xs font-medium text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.size}</p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((f) => {
                const ft = fileTypeIcons[f.type]
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFile(f)}
                    className={`flex w-full items-center gap-4 py-2.5 text-left transition-colors hover:bg-muted/30 ${selectedFile?.id === f.id ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: ft.color }}>
                      {ft.label}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.channelName} - {f.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar initials={f.sharedByInitials} color={f.sharedByColor} size="sm" />
                      <span className="text-xs text-muted-foreground">{timeAgo(f.timestamp)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* File detail */}
        {selectedFile && (
          <div className="w-72 border-l border-border/50 bg-card/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Detalhes</p>
              <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white" style={{ backgroundColor: fileTypeIcons[selectedFile.type].color }}>
                  {fileTypeIcons[selectedFile.type].label}
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{selectedFile.size}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Canal</span>
                  <span className="text-foreground">{selectedFile.channelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enviado por</span>
                  <span className="text-foreground">{selectedFile.sharedByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-foreground">{formatDate(selectedFile.timestamp)}</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" /> Visualizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════
const sectionConfig: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "Chat", icon: <MessageSquare className="h-5 w-5" /> },
  { id: "channels", label: "Canais", icon: <Hash className="h-5 w-5" /> },
  { id: "tasks", label: "Tarefas", icon: <CheckSquare className="h-5 w-5" /> },
  { id: "calendar", label: "Calendario", icon: <Calendar className="h-5 w-5" /> },
  { id: "calls", label: "Chamadas", icon: <Phone className="h-5 w-5" /> },
  { id: "files", label: "Arquivos", icon: <Folder className="h-5 w-5" /> },
]

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)
  const [section, setSection] = useState<Section>("chat")
  const [callTarget, setCallTarget] = useState<{ name: string; initials: string; color: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) { router.push("/login"); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return null

  const totalUnread = dmConversations.reduce((s, c) => s + c.unread, 0) + groupChats.reduce((s, g) => s + g.unread, 0)
  const channelUnread = channels.reduce((s, c) => s + c.unread, 0)

  function getBadge(s: Section): number {
    if (s === "chat") return totalUnread
    if (s === "channels") return channelUnread
    if (s === "calls") return callRecords.filter((c) => c.direction === "missed").length
    return 0
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left icon rail */}
      <div className="flex w-16 flex-col items-center border-r border-border/50 bg-card py-4">
        <Link href="/dashboard" className="mb-6">
          <Image src="/images/logo-levelcorp.jpeg" alt="LevelCorp" width={32} height={32} className="rounded-lg" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {sectionConfig.map((s) => {
            const badge = getBadge(s.id)
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                title={s.label}
              >
                {s.icon}
                {badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{badge}</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {section === "chat" && <ChatSection user={user} onCall={setCallTarget} />}
        {section === "channels" && <ChannelsSection user={user} />}
        {section === "tasks" && <TasksSection />}
        {section === "calendar" && <CalendarSection />}
        {section === "calls" && <CallsSection onCall={setCallTarget} />}
        {section === "files" && <FilesSection />}
      </div>

      {/* Call modal */}
      {callTarget && <CallModal peer={callTarget} onClose={() => setCallTarget(null)} />}
    </div>
  )
}
