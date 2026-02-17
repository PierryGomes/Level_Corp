import { npcs, type NPC } from "./map-data"

// ── Shared helpers ─────────────────────────────────────────
function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

function npc(id: string) {
  return npcs.find((n) => n.id === id)!
}

// ── 1. Direct Messages ────────────────────────────────────
export interface DirectMessage {
  id: string
  text: string
  senderId: string
  timestamp: Date
  read: boolean
  reactions: { emoji: string; by: string[] }[]
}

export interface DMConversation {
  id: string
  peerId: string
  peerName: string
  peerInitials: string
  peerColor: string
  peerRole: string
  peerDept: string
  peerStatus: "online" | "busy" | "away"
  messages: DirectMessage[]
  unread: number
  pinned: boolean
}

function dm(senderId: string, text: string, minutesAgo: number, read = true): DirectMessage {
  return { id: randomId(), text, senderId, timestamp: ago(minutesAgo), read, reactions: [] }
}

function dmConvo(peerId: string, messages: DirectMessage[], unread = 0, pinned = false): DMConversation {
  const p = npc(peerId)
  return {
    id: `dm-${peerId}`,
    peerId,
    peerName: p.name,
    peerInitials: p.initials,
    peerColor: p.avatarColor,
    peerRole: p.role,
    peerDept: p.department,
    peerStatus: p.status,
    messages,
    unread,
    pinned,
  }
}

export const dmConversations: DMConversation[] = [
  dmConvo("ceo1", [
    dm("ceo1", "Bom dia, Ana! Vi seus numeros no dashboard, impressionante.", 120),
    dm("me", "Obrigada, Roberto! Estou me dedicando bastante.", 115),
    dm("ceo1", "Continue assim. Estou considerando voce para o programa Embaixadores.", 110),
    dm("me", "Uau, seria incrivel! Muito obrigada pela oportunidade.", 105),
    dm("ceo1", "Merecido. Vamos conversar mais na reuniao de quinta.", 100),
  ], 0, true),
  dmConvo("tec_mgr", [
    dm("tec_mgr", "Ana, preciso do status do refactor do dashboard.", 60),
    dm("me", "Ja finalizei! PR aberto, esperando review.", 55),
    dm("tec_mgr", "Otimo, vou pedir pro Pedro revisar ainda hoje.", 50),
    dm("me", "Perfeito, obrigada Carlos!", 48),
    dm("tec_mgr", "Ah, e parabens pelo level up! Nivel 7 ja.", 45),
    dm("me", "Valeu! A gamificacao realmente motiva a gente.", 43),
  ], 0, true),
  dmConvo("tec2", [
    dm("tec2", "Oi Ana! Vi que voce pediu help com a query.", 30),
    dm("me", "Sim! Ta fazendo N+1 no relatorio de departamentos.", 28),
    dm("tec2", "Manda o explain analyze que eu olho.", 25),
    dm("me", "Mandei no PR #143, da uma olhada quando puder.", 22),
    dm("tec2", "Vou ver agora! Parece que e so eager loading.", 20, false),
  ], 1),
  dmConvo("tec5", [
    dm("tec5", "Ana, atualizei o design system no Figma.", 90),
    dm("me", "Vi! As cores novas ficaram otimas.", 85),
    dm("tec5", "Preciso de feedback nos componentes de chart.", 80),
    dm("me", "Vou revisar amanha cedo e te mando.", 75),
  ]),
  dmConvo("mkt1", [
    dm("mkt1", "Oi Ana! Precisamos de ajuda com a landing page.", 180),
    dm("me", "Claro! O que voces precisam?", 175),
    dm("mkt1", "Alguns ajustes de responsividade no mobile.", 170),
    dm("me", "Posso olhar na quarta. Te aviso!", 165),
    dm("mkt1", "Perfeito, valeu!", 160),
  ]),
  dmConvo("ven1", [
    dm("ven1", "Fala Ana! Preciso de um relatorio custom pro cliente TechStar.", 45),
    dm("me", "Qual periodo e metricas?", 42),
    dm("ven1", "Ultimo trimestre, foco em engajamento e produtividade.", 40),
    dm("me", "Consigo entregar ate sexta.", 38),
    dm("ven1", "Show, valeu demais!", 35, false),
  ], 1),
  dmConvo("rh_mgr", [
    dm("rh_mgr", "Ana, voce ja respondeu a pesquisa de clima?", 200),
    dm("me", "Ainda nao, vou responder hoje!", 195),
    dm("rh_mgr", "Otimo! Sua opiniao e muito importante pra gente.", 190),
  ]),
  dmConvo("fin2", [
    dm("fin2", "Oi Ana, aquele reembolso da conferencia ja foi aprovado.", 300),
    dm("me", "Que bom! Obrigada, Gustavo.", 295),
    dm("fin2", "Cai na conta em ate 5 dias uteis.", 290),
  ]),
]

// ── 2. Group Chats ────────────────────────────────────────
export interface GroupChat {
  id: string
  name: string
  color: string
  members: string[]
  messages: DirectMessage[]
  unread: number
}

export const groupChats: GroupChat[] = [
  {
    id: "grp-sprint",
    name: "Sprint Planning",
    color: "#3B82F6",
    members: ["tec_mgr", "tec1", "tec2", "tec3", "tec4", "tec5", "tec6"],
    messages: [
      dm("tec_mgr", "Pessoal, sprint review amanha as 10h.", 90),
      dm("tec1", "Vou preparar a demo do dashboard.", 85),
      dm("tec3", "Pipeline nova esta pronta, posso mostrar os ganhos.", 80),
      dm("tec4", "Testes de regressao todos passaram.", 75),
      dm("tec_mgr", "Perfeito! Sera a melhor review do trimestre.", 70),
    ],
    unread: 0,
  },
  {
    id: "grp-campanha",
    name: "Campanha Q1",
    color: "#F59E0B",
    members: ["mkt_mgr", "mkt1", "mkt2", "mkt3", "tec5"],
    messages: [
      dm("mkt_mgr", "Resultados parciais: 32k impressoes!", 150),
      dm("mkt1", "Engagement rate subiu 15% essa semana.", 140),
      dm("mkt3", "Novos banners prontos, enviei no drive.", 130),
      dm("tec5", "Ajustei o layout mobile da landing.", 120),
      dm("mkt_mgr", "Equipe incrivel! Vamos bater 50k.", 110, false),
    ],
    unread: 1,
  },
  {
    id: "grp-onboard",
    name: "Onboarding 2026",
    color: "#EC4899",
    members: ["rh_mgr", "rh1", "rh3", "tec_mgr", "mkt_mgr"],
    messages: [
      dm("rh_mgr", "Novo processo de onboarding pronto!", 200),
      dm("rh3", "Treinamento gamificado integrado.", 190),
      dm("rh1", "Beneficios atualizados no portal.", 180),
      dm("tec_mgr", "Acesso aos sistemas em D+1 agora.", 170),
      dm("mkt_mgr", "Kit de boas-vindas redesenhado.", 160),
    ],
    unread: 0,
  },
  {
    id: "grp-diretoria",
    name: "Reuniao Diretoria",
    color: "#EAB308",
    members: ["ceo1", "tec_mgr", "mkt_mgr", "ven_mgr", "rh_mgr", "fin_mgr"],
    messages: [
      dm("ceo1", "Pauta da reuniao: resultados Q4 e metas Q1.", 300),
      dm("fin_mgr", "Relatorio financeiro anexado.", 290),
      dm("ven_mgr", "Vendas superou a meta em 15%.", 280),
      dm("rh_mgr", "NPS interno em alta, +5 pontos.", 270),
      dm("ceo1", "Excelentes resultados. Parabens a todos!", 260),
    ],
    unread: 0,
  },
]

// ── 3. Channel Threads ────────────────────────────────────
export interface ThreadReply {
  id: string
  senderId: string
  senderName: string
  senderInitials: string
  senderColor: string
  text: string
  timestamp: Date
}

export interface ChannelThread {
  id: string
  channelId: string
  rootMessage: {
    senderId: string
    senderName: string
    senderInitials: string
    senderColor: string
    text: string
    timestamp: Date
  }
  replies: ThreadReply[]
  pinned: boolean
}

function threadReply(npcId: string, text: string, minutesAgo: number): ThreadReply {
  const n = npc(npcId)
  return { id: randomId(), senderId: npcId, senderName: n.name, senderInitials: n.initials, senderColor: n.avatarColor, text, timestamp: ago(minutesAgo) }
}

export const channelThreads: ChannelThread[] = [
  {
    id: "th-1", channelId: "ch-tec", pinned: true,
    rootMessage: { senderId: "tec_mgr", senderName: "Carlos Mendes", senderInitials: "CM", senderColor: "#8B5CF6", text: "Nova arquitetura do backend: estou propondo migrar para microservicos. Opinioes?", timestamp: ago(480) },
    replies: [
      threadReply("tec2", "Faz sentido para os modulos maiores. Podemos comecar pelo auth.", 470),
      threadReply("tec3", "Do lado de infra, ja tenho o Kubernetes configurado.", 460),
      threadReply("tec1", "Frontend se adapta facil se a API mantiver os contratos.", 450),
      threadReply("tec4", "Preciso atualizar os testes de integracao.", 440),
      threadReply("tec_mgr", "Vamos fazer um spike de 1 semana. Carlos, lidera.", 430),
    ],
  },
  {
    id: "th-2", channelId: "ch-tec", pinned: false,
    rootMessage: { senderId: "tec6", senderName: "Camila Souza", senderInitials: "CS", senderColor: "#3B82F6", text: "Query do relatorio de departamentos esta lenta. Alguem pode ajudar?", timestamp: ago(60) },
    replies: [
      threadReply("tec2", "Manda o explain analyze que eu olho!", 55),
      threadReply("tec1", "Parece N+1. Tenta eager loading.", 50),
      threadReply("tec6", "Funcionou! Era o eager loading mesmo. Obrigada!", 40),
    ],
  },
  {
    id: "th-3", channelId: "ch-mkt", pinned: true,
    rootMessage: { senderId: "mkt_mgr", senderName: "Fernanda Lima", senderInitials: "FL", senderColor: "#8B5CF6", text: "Resultados da campanha Q1: 32k de 50k impressoes. Vamos acelerar!", timestamp: ago(300) },
    replies: [
      threadReply("mkt1", "Posts de video estao performando melhor. Vou priorizar.", 290),
      threadReply("mkt3", "Novos banners com A/B test prontos.", 280),
      threadReply("mkt2", "Artigo sobre gamificacao corporativa publicado no blog.", 270),
    ],
  },
  {
    id: "th-4", channelId: "ch-ven", pinned: true,
    rootMessage: { senderId: "ven_mgr", senderName: "Ricardo Souza", senderInitials: "RS", senderColor: "#8B5CF6", text: "Meta mensal: 85% atingido! Faltam 3 deals para bater.", timestamp: ago(200) },
    replies: [
      threadReply("ven1", "TechStar fechado! 120k ARR.", 180),
      threadReply("ven4", "15 leads novos essa semana.", 170),
      threadReply("ven3", "Demo com GlobalTech amanha as 14h.", 160),
    ],
  },
]

// ── 4. Tasks (Kanban) ─────────────────────────────────────
export type TaskPriority = "alta" | "media" | "baixa"
export type TaskStatus = "todo" | "doing" | "done"
export type TaskLabel = "feature" | "bug" | "improvement" | "documentation" | "urgent"

export interface KanbanTask {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  assigneeName: string
  assigneeInitials: string
  assigneeColor: string
  dueDate: Date
  labels: TaskLabel[]
  createdAt: Date
  channelId: string
}

const statusLabels: Record<TaskStatus, string> = { todo: "A Fazer", doing: "Em Progresso", done: "Concluido" }
export { statusLabels }

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  alta: { label: "Alta", color: "#EF4444" },
  media: { label: "Media", color: "#F59E0B" },
  baixa: { label: "Baixa", color: "#22C55E" },
}
export { priorityConfig }

const labelConfig: Record<TaskLabel, { label: string; color: string }> = {
  feature: { label: "Feature", color: "#3B82F6" },
  bug: { label: "Bug", color: "#EF4444" },
  improvement: { label: "Melhoria", color: "#8B5CF6" },
  documentation: { label: "Docs", color: "#6B7280" },
  urgent: { label: "Urgente", color: "#DC2626" },
}
export { labelConfig }

function task(
  title: string, desc: string, status: TaskStatus, priority: TaskPriority,
  assigneeId: string, daysUntilDue: number, labels: TaskLabel[], channelId: string, daysAgoCreated = 5
): KanbanTask {
  const a = npc(assigneeId)
  return {
    id: randomId(), title, description: desc, status, priority,
    assigneeId, assigneeName: a.name, assigneeInitials: a.initials, assigneeColor: a.avatarColor,
    dueDate: new Date(Date.now() + daysUntilDue * 86400000),
    labels, createdAt: new Date(Date.now() - daysAgoCreated * 86400000), channelId,
  }
}

export const tasks: KanbanTask[] = [
  // Tecnologia
  task("Refactor dashboard components", "Separar componentes em arquivos menores e otimizar renders", "done", "alta", "tec1", -2, ["improvement"], "ch-tec", 10),
  task("Otimizar query relatorios", "Fix N+1 na query de relatorios por departamento", "doing", "alta", "tec6", 1, ["bug", "urgent"], "ch-tec", 3),
  task("Pipeline CI/CD v2", "Atualizar pipeline para deploy 40% mais rapido", "done", "media", "tec3", -1, ["improvement"], "ch-tec", 7),
  task("Review PR #142", "Code review do PR de autenticacao", "doing", "media", "tec2", 2, ["feature"], "ch-tec", 2),
  task("Testes de regressao", "Rodar suite completa e corrigir falhas", "done", "media", "tec4", -3, ["bug"], "ch-tec", 8),
  task("Atualizar design system", "Sincronizar Figma com codigo", "doing", "baixa", "tec5", 5, ["documentation"], "ch-tec", 4),
  task("API de gamificacao v2", "Endpoints para missoes e recompensas", "todo", "alta", "tec2", 7, ["feature"], "ch-tec", 1),
  task("Dark mode no email template", "Suporte a dark mode nos emails transacionais", "todo", "baixa", "tec1", 10, ["feature"], "ch-tec", 1),
  // Marketing
  task("Posts semana 8", "Agendar posts Instagram e LinkedIn", "done", "media", "mkt1", -1, ["feature"], "ch-mkt", 5),
  task("Banners campanha Q1", "Criar variantes A/B dos banners", "done", "alta", "mkt3", -2, ["feature"], "ch-mkt", 7),
  task("Blog: gamificacao corporativa", "Escrever e publicar artigo", "done", "media", "mkt2", -3, ["documentation"], "ch-mkt", 10),
  task("Video institucional", "Editar video para redes sociais", "doing", "alta", "mkt1", 3, ["feature"], "ch-mkt", 3),
  task("Redesign newsletter", "Novo layout para newsletter mensal", "todo", "baixa", "mkt3", 8, ["improvement"], "ch-mkt", 1),
  // Vendas
  task("Proposta TechStar", "Enviar contrato final assinado", "done", "alta", "ven1", -5, ["feature"], "ch-ven", 12),
  task("Demo GlobalTech", "Preparar apresentacao customizada", "doing", "alta", "ven3", 1, ["feature"], "ch-ven", 3),
  task("Follow-up leads semana 7", "Contatar 15 leads qualificados", "doing", "media", "ven4", 3, ["feature"], "ch-ven", 2),
  task("Relatorio pos-venda Nexus", "Satisfacao do cliente apos onboarding", "done", "media", "ven5", -1, ["documentation"], "ch-ven", 5),
  task("Script novo de cold call", "Atualizar script com cases recentes", "todo", "baixa", "ven2", 7, ["improvement"], "ch-ven", 1),
]

// ── 5. Calendar Events ────────────────────────────────────
export type EventType = "standup" | "meeting" | "review" | "training" | "social"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  type: EventType
  date: Date
  durationMinutes: number
  attendees: { id: string; name: string; initials: string; color: string }[]
  location: string
  isRecurring: boolean
  color: string
}

const eventColors: Record<EventType, string> = {
  standup: "#3B82F6",
  meeting: "#8B5CF6",
  review: "#F59E0B",
  training: "#22C55E",
  social: "#EC4899",
}

function evt(
  title: string, desc: string, type: EventType, dayOffset: number, hour: number,
  minute: number, duration: number, attendeeIds: string[], location: string, recurring = false
): CalendarEvent {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return {
    id: randomId(), title, description: desc, type, date: d, durationMinutes: duration,
    attendees: attendeeIds.map((id) => {
      if (id === "me") return { id: "me", name: "Ana Silva", initials: "AS", color: "#3B82F6" }
      const n = npc(id)
      return { id, name: n.name, initials: n.initials, color: n.avatarColor }
    }),
    location, isRecurring: recurring, color: eventColors[type],
  }
}

export const calendarEvents: CalendarEvent[] = [
  // Today (offset 0)
  evt("Daily Standup", "Sync rapido do time de tecnologia", "standup", 0, 9, 0, 15, ["tec_mgr", "tec1", "tec2", "tec3", "tec4", "tec5", "tec6", "me"], "Canal Tecnologia", true),
  evt("1:1 com Carlos", "Reuniao individual com gestor", "meeting", 0, 11, 0, 30, ["tec_mgr", "me"], "Sala de Reuniao Virtual"),
  evt("Sprint Review", "Apresentacao dos resultados da sprint", "review", 0, 14, 0, 60, ["tec_mgr", "tec1", "tec2", "tec3", "tec4", "me"], "Auditorio Virtual"),
  // Tomorrow
  evt("Daily Standup", "Sync rapido do time", "standup", 1, 9, 0, 15, ["tec_mgr", "tec1", "tec2", "tec3", "me"], "Canal Tecnologia", true),
  evt("Demo GlobalTech", "Apresentacao para cliente", "meeting", 1, 14, 0, 60, ["ven_mgr", "ven3", "tec1", "me"], "Sala de Apresentacao"),
  evt("Workshop UX", "Treinamento de UX writing", "training", 1, 16, 0, 90, ["tec5", "mkt1", "mkt3", "me"], "Sala de Treinamento"),
  // Day+2
  evt("Daily Standup", "Sync rapido", "standup", 2, 9, 0, 15, ["tec_mgr", "tec1", "tec2", "me"], "Canal Tecnologia", true),
  evt("Reuniao Diretoria", "Resultados mensais", "meeting", 2, 10, 0, 90, ["ceo1", "tec_mgr", "mkt_mgr", "ven_mgr", "rh_mgr", "fin_mgr"], "Escritorio CEO"),
  evt("Retrospectiva Sprint", "O que melhorar na proxima sprint", "review", 2, 15, 0, 60, ["tec_mgr", "tec1", "tec2", "tec3", "tec4", "tec5", "tec6", "me"], "Auditorio Virtual"),
  // Day+3
  evt("Happy Hour Virtual", "Descontracao com o time!", "social", 3, 17, 0, 60, ["tec1", "tec2", "mkt1", "ven1", "rh1", "me"], "Area de Convivencia"),
  evt("Planning Sprint 8", "Planejamento da proxima sprint", "meeting", 3, 10, 0, 120, ["tec_mgr", "tec1", "tec2", "tec3", "tec4", "tec5", "tec6", "me"], "Auditorio Virtual"),
  // Day+4
  evt("Treinamento Gamificacao", "Como usar a plataforma LevelCorp", "training", 4, 14, 0, 60, ["rh_mgr", "rh3", "me"], "Sala de Treinamento"),
  evt("Daily Standup", "Sync rapido", "standup", 4, 9, 0, 15, ["tec_mgr", "tec1", "tec2", "me"], "Canal Tecnologia", true),
]

// ── 6. Call Records ───────────────────────────────────────
export type CallType = "audio" | "video"
export type CallDirection = "incoming" | "outgoing" | "missed"

export interface CallRecord {
  id: string
  peerId: string
  peerName: string
  peerInitials: string
  peerColor: string
  type: CallType
  direction: CallDirection
  timestamp: Date
  durationSeconds: number
}

function call(peerId: string, type: CallType, dir: CallDirection, minutesAgo: number, durationSec: number): CallRecord {
  const p = npc(peerId)
  return {
    id: randomId(), peerId, peerName: p.name, peerInitials: p.initials, peerColor: p.avatarColor,
    type, direction: dir, timestamp: ago(minutesAgo), durationSeconds: durationSec,
  }
}

export const callRecords: CallRecord[] = [
  call("tec_mgr", "video", "incoming", 60, 1800),
  call("tec2", "audio", "outgoing", 120, 600),
  call("mkt1", "video", "missed", 180, 0),
  call("ven1", "audio", "incoming", 300, 420),
  call("ceo1", "video", "incoming", 480, 2400),
  call("rh_mgr", "audio", "outgoing", 600, 300),
  call("tec5", "video", "outgoing", 720, 900),
  call("fin2", "audio", "missed", 1000, 0),
  call("tec3", "video", "incoming", 1200, 1500),
  call("mkt_mgr", "audio", "outgoing", 1440, 480),
]

// ── 7. Shared Files ───────────────────────────────────────
export type FileType = "pdf" | "doc" | "img" | "xls" | "ppt" | "zip" | "fig"

export interface SharedFile {
  id: string
  name: string
  type: FileType
  size: string
  channelId: string
  channelName: string
  sharedById: string
  sharedByName: string
  sharedByInitials: string
  sharedByColor: string
  timestamp: Date
}

const fileTypeIcons: Record<FileType, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#EF4444" },
  doc: { label: "DOC", color: "#3B82F6" },
  img: { label: "IMG", color: "#22C55E" },
  xls: { label: "XLS", color: "#16A34A" },
  ppt: { label: "PPT", color: "#F97316" },
  zip: { label: "ZIP", color: "#6B7280" },
  fig: { label: "FIG", color: "#A855F7" },
}
export { fileTypeIcons }

function file(name: string, type: FileType, size: string, chId: string, chName: string, byId: string, minutesAgo: number): SharedFile {
  const s = npc(byId)
  return {
    id: randomId(), name, type, size, channelId: chId, channelName: chName,
    sharedById: byId, sharedByName: s.name, sharedByInitials: s.initials, sharedByColor: s.avatarColor,
    timestamp: ago(minutesAgo),
  }
}

export const sharedFiles: SharedFile[] = [
  file("Relatorio-Q4-2025.pdf", "pdf", "2.4 MB", "ch-fin", "Financeiro", "fin_mgr", 300),
  file("Sprint-Review-Deck.ppt", "ppt", "5.1 MB", "ch-tec", "Tecnologia", "tec_mgr", 120),
  file("Design-System-v3.fig", "fig", "12 MB", "ch-tec", "Tecnologia", "tec5", 90),
  file("Campanha-Q1-Banners.zip", "zip", "45 MB", "ch-mkt", "Marketing", "mkt3", 200),
  file("Artigo-Gamificacao.doc", "doc", "1.2 MB", "ch-mkt", "Marketing", "mkt2", 180),
  file("Metricas-Vendas-Jan.xls", "xls", "800 KB", "ch-ven", "Vendas", "ven_mgr", 250),
  file("Contrato-TechStar.pdf", "pdf", "3.5 MB", "ch-ven", "Vendas", "ven1", 400),
  file("Pesquisa-Clima-2025.pdf", "pdf", "1.8 MB", "ch-rh", "RH", "rh_mgr", 500),
  file("Onboarding-Guide-v2.doc", "doc", "2.1 MB", "ch-rh", "RH", "rh3", 350),
  file("Budget-Q2-2026.xls", "xls", "600 KB", "ch-fin", "Financeiro", "fin2", 150),
  file("Dashboard-Screenshot.img", "img", "420 KB", "ch-tec", "Tecnologia", "tec1", 60),
  file("Pipeline-Diagram.img", "img", "1.1 MB", "ch-tec", "Tecnologia", "tec3", 180),
  file("Proposta-GlobalTech.pdf", "pdf", "4.2 MB", "ch-ven", "Vendas", "ven3", 100),
  file("Social-Media-Calendar.xls", "xls", "950 KB", "ch-mkt", "Marketing", "mkt1", 160),
  file("NPS-Report-Fev.pdf", "pdf", "1.5 MB", "ch-rh", "RH", "rh1", 80),
]

// ── Speed dial contacts for calls ─────────────────────────
export const speedDial = [
  "ceo1", "tec_mgr", "tec2", "mkt_mgr", "ven_mgr", "rh_mgr", "fin_mgr", "tec5",
].map((id) => {
  const n = npc(id)
  return { id, name: n.name, initials: n.initials, color: n.avatarColor, role: n.role, status: n.status }
})
