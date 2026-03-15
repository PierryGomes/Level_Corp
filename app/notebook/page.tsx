"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Plus, 
  Upload, 
  FileText, 
  Send, 
  Sparkles, 
  BookOpen, 
  Mic, 
  MoreHorizontal,
  ChevronLeft,
  Trash2,
  Download,
  Play,
  Pause,
  Volume2,
  ListOrdered,
  MessageSquare,
  HelpCircle,
  X,
  Loader2,
  Check,
  FileIcon,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Notebook {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  source_count?: number
}

interface Source {
  id: string
  notebook_id: string
  name: string
  type: string
  content: string | null
  word_count: number
  created_at: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: { sourceId: string; sourceName: string; excerpt: string }[]
}

interface Summary {
  id: string
  type: string
  content: string
  created_at: string
}

interface Podcast {
  id: string
  title: string
  script: string | null
  audio_url: string | null
  duration: number | null
  status: string
  created_at: string
}

export default function NotebookPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("sources")
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    try {
      setUser(JSON.parse(stored))
    } catch {
      router.push("/login")
    }
  }, [router])

  // Load notebooks
  useEffect(() => {
    if (!user) return
    fetchNotebooks()
  }, [user])

  // Load notebook data when selected
  useEffect(() => {
    if (!selectedNotebook) return
    fetchSources()
    fetchMessages()
    fetchSummaries()
    fetchPodcasts()
  }, [selectedNotebook])

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchNotebooks = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/notebook?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotebooks(data.notebooks || [])
      }
    } catch (error) {
      console.error("Error fetching notebooks:", error)
    }
  }

  const fetchSources = async () => {
    if (!selectedNotebook) return
    try {
      const res = await fetch(`/api/notebook?notebookId=${selectedNotebook.id}&type=sources`)
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources || [])
      }
    } catch (error) {
      console.error("Error fetching sources:", error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedNotebook) return
    try {
      const res = await fetch(`/api/notebook?notebookId=${selectedNotebook.id}&type=chats`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.chats || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchSummaries = async () => {
    if (!selectedNotebook) return
    try {
      const res = await fetch(`/api/notebook?notebookId=${selectedNotebook.id}&type=summaries`)
      if (res.ok) {
        const data = await res.json()
        setSummaries(data.summaries || [])
      }
    } catch (error) {
      console.error("Error fetching summaries:", error)
    }
  }

  const fetchPodcasts = async () => {
    if (!selectedNotebook) return
    try {
      const res = await fetch(`/api/notebook?notebookId=${selectedNotebook.id}&type=podcasts`)
      if (res.ok) {
        const data = await res.json()
        setPodcasts(data.podcasts || [])
      }
    } catch (error) {
      console.error("Error fetching podcasts:", error)
    }
  }

  const createNotebook = async () => {
    if (!user) return
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, title: "Novo Notebook" }),
      })
      if (res.ok) {
        const data = await res.json()
        setNotebooks(prev => [data.notebook, ...prev])
        setSelectedNotebook(data.notebook)
      }
    } catch (error) {
      console.error("Error creating notebook:", error)
    }
  }

  const deleteNotebook = async (id: string) => {
    try {
      const res = await fetch("/api/notebook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId: id }),
      })
      if (res.ok) {
        setNotebooks(prev => prev.filter(n => n.id !== id))
        if (selectedNotebook?.id === id) {
          setSelectedNotebook(null)
          setSources([])
          setMessages([])
          setSummaries([])
          setPodcasts([])
        }
      }
    } catch (error) {
      console.error("Error deleting notebook:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedNotebook) return

    setIsUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("notebookId", selectedNotebook.id)

      try {
        const res = await fetch("/api/notebook/upload", {
          method: "POST",
          body: formData,
        })
        if (res.ok) {
          await fetchSources()
        }
      } catch (error) {
        console.error("Error uploading file:", error)
      }
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const deleteSource = async (sourceId: string) => {
    try {
      const res = await fetch("/api/notebook/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      })
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== sourceId))
      }
    } catch (error) {
      console.error("Error deleting source:", error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedNotebook || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/notebook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId: selectedNotebook.id,
          message: input,
          sources: sources.map(s => ({ id: s.id, name: s.name, content: s.content })),
        }),
      })

      if (res.ok) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ""
        const assistantId = crypto.randomUUID()

        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

        while (reader) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim()
              if (data === "[DONE]") continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === "text-delta" && parsed.delta) {
                  assistantContent += parsed.delta
                  setMessages(prev => 
                    prev.map(m => 
                      m.id === assistantId 
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  )
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = async (type: string) => {
    if (!selectedNotebook || sources.length === 0) return

    setIsGeneratingSummary(true)
    try {
      const res = await fetch("/api/notebook/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId: selectedNotebook.id,
          type,
          sources: sources.map(s => ({ id: s.id, name: s.name, content: s.content })),
        }),
      })
      if (res.ok) {
        await fetchSummaries()
        setActiveTab("summaries")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const generatePodcast = async () => {
    if (!selectedNotebook || sources.length === 0) return

    setIsGeneratingPodcast(true)
    try {
      const res = await fetch("/api/notebook/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId: selectedNotebook.id,
          sources: sources.map(s => ({ id: s.id, name: s.name, content: s.content })),
        }),
      })
      if (res.ok) {
        await fetchPodcasts()
        setActiveTab("podcasts")
      }
    } catch (error) {
      console.error("Error generating podcast:", error)
    } finally {
      setIsGeneratingPodcast(false)
    }
  }

  const suggestedQuestions = [
    "Resuma os principais pontos deste documento",
    "Quais sao as conclusoes mais importantes?",
    "Crie uma lista de topicos abordados",
    "Explique os conceitos principais",
  ]

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Notebooks */}
      <div className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="font-semibold text-foreground">Notebook</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Notebook Button */}
        <div className="p-3">
          <Button onClick={createNotebook} className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Novo Notebook
          </Button>
        </div>

        {/* Notebooks List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {notebooks.map(notebook => (
              <div
                key={notebook.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                  selectedNotebook?.id === notebook.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSelectedNotebook(notebook)}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{notebook.title}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteNotebook(notebook.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Collapsed Sidebar Toggle */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-4 z-10"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Main Content - Chat */}
      <div className="flex flex-1 flex-col">
        {selectedNotebook ? (
          <>
            {/* Chat Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <h1 className="font-semibold text-foreground">{selectedNotebook.title}</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 rounded-full bg-primary/10 p-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-foreground">
                    Converse com seus documentos
                  </h2>
                  <p className="mb-6 max-w-md text-muted-foreground">
                    Faca upload de documentos e faca perguntas. A IA ira analisar o conteudo
                    e fornecer respostas baseadas nas suas fontes.
                  </p>
                  {sources.length > 0 && (
                    <div className="grid max-w-lg gap-2">
                      {suggestedQuestions.map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="justify-start text-left"
                          onClick={() => {
                            setInput(q)
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                          {q}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-2 border-t border-border/50 pt-2">
                            <p className="text-xs text-muted-foreground">Fontes:</p>
                            {message.citations.map((c, i) => (
                              <p key={i} className="text-xs text-primary">
                                [{i + 1}] {c.sourceName}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <span className="text-xs font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-2xl bg-muted px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t border-border p-4">
              <div className="mx-auto flex max-w-3xl gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Faca uma pergunta sobre seus documentos..."
                  disabled={isLoading || sources.length === 0}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || sources.length === 0}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {sources.length === 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Adicione fontes para comecar a conversar
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Selecione ou crie um notebook
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Notebooks permitem organizar seus documentos e ter conversas contextualizadas
              com a IA sobre o conteudo.
            </p>
            <Button onClick={createNotebook} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Notebook
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel - Sources & Studio */}
      {selectedNotebook && rightPanelOpen && (
        <div className="w-80 border-l border-border bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3">
              <TabsTrigger value="sources" className="text-xs">Fontes</TabsTrigger>
              <TabsTrigger value="summaries" className="text-xs">Resumos</TabsTrigger>
              <TabsTrigger value="podcasts" className="text-xs">Podcast</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                {/* Upload Button */}
                <div className="p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.doc,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? "Enviando..." : "Adicionar Fonte"}
                  </Button>
                </div>

                {/* Sources List */}
                <ScrollArea className="flex-1 px-4">
                  {sources.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma fonte adicionada
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pb-4">
                      {sources.map(source => (
                        <div
                          key={source.id}
                          className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FileIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {source.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {source.word_count.toLocaleString()} palavras
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={() => deleteSource(source.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="summaries" className="flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                {/* Generate Summary Buttons */}
                <div className="space-y-2 p-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => generateSummary("executive")}
                    disabled={isGeneratingSummary || sources.length === 0}
                  >
                    {isGeneratingSummary ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Resumo Executivo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => generateSummary("bullets")}
                    disabled={isGeneratingSummary || sources.length === 0}
                  >
                    <ListOrdered className="h-4 w-4" />
                    Lista de Topicos
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => generateSummary("faq")}
                    disabled={isGeneratingSummary || sources.length === 0}
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Button>
                </div>

                {/* Summaries List */}
                <ScrollArea className="flex-1 px-4">
                  {summaries.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Gere resumos dos seus documentos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {summaries.map(summary => (
                        <div
                          key={summary.id}
                          className="rounded-lg border border-border bg-background p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium uppercase text-primary">
                              {summary.type === "executive"
                                ? "Resumo Executivo"
                                : summary.type === "bullets"
                                ? "Topicos"
                                : "FAQ"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(summary.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="line-clamp-4 text-sm text-foreground whitespace-pre-wrap">
                            {summary.content}
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                                Ver completo
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {summary.type === "executive"
                                    ? "Resumo Executivo"
                                    : summary.type === "bullets"
                                    ? "Lista de Topicos"
                                    : "FAQ"}
                                </DialogTitle>
                              </DialogHeader>
                              <p className="whitespace-pre-wrap text-sm">{summary.content}</p>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="podcasts" className="flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                {/* Generate Podcast Button */}
                <div className="p-4">
                  <Button
                    className="w-full gap-2"
                    onClick={generatePodcast}
                    disabled={isGeneratingPodcast || sources.length === 0}
                  >
                    {isGeneratingPodcast ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isGeneratingPodcast ? "Gerando..." : "Gerar Podcast"}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    A IA cria um roteiro de podcast com dois apresentadores discutindo o conteudo
                  </p>
                </div>

                {/* Podcasts List */}
                <ScrollArea className="flex-1 px-4">
                  {podcasts.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <Mic className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum podcast gerado
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {podcasts.map(podcast => (
                        <div
                          key={podcast.id}
                          className="rounded-lg border border-border bg-background p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {podcast.title}
                            </span>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              podcast.status === "completed"
                                ? "bg-green-500/10 text-green-500"
                                : podcast.status === "processing"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {podcast.status === "completed"
                                ? "Pronto"
                                : podcast.status === "processing"
                                ? "Processando"
                                : "Pendente"}
                            </span>
                          </div>
                          {podcast.script && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                  <FileText className="h-4 w-4" />
                                  Ver Roteiro
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{podcast.title}</DialogTitle>
                                  <DialogDescription>
                                    Roteiro do podcast gerado pela IA
                                  </DialogDescription>
                                </DialogHeader>
                                <p className="whitespace-pre-wrap text-sm">{podcast.script}</p>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
