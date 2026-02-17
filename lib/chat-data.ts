import { npcs, type NPC } from "./map-data"

// ── Types ──────────────────────────────────────────────────
export interface Reaction {
  emoji: string
  label: string
  xp: number
  count: number
  reacted: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderInitials: string
  senderColor: string
  senderRole: "colaborador" | "gestor" | "ceo"
  content: string
  timestamp: Date
  reactions: Reaction[]
  isPinned: boolean
  isAnnouncement: boolean
}

export interface ChatChannel {
  id: string
  name: string
  type: "department" | "direct" | "announcement"
  departmentId?: string
  icon: string
  memberCount: number
  unread: number
}

// ── Reaction presets ───────────────────────────────────────
export function createReactions(): Reaction[] {
  return [
    { emoji: "\uD83D\uDC4D", label: "Curtir", xp: 5, count: 0, reacted: false },
    { emoji: "\uD83D\uDC4F", label: "Elogio", xp: 10, count: 0, reacted: false },
    { emoji: "\uD83C\uDF1F", label: "Excelente", xp: 15, count: 0, reacted: false },
    { emoji: "\u2B50", label: "Destaque", xp: 20, count: 0, reacted: false },
  ]
}

// ── Channels ───────────────────────────────────────────────
export const channels: ChatChannel[] = [
  { id: "ch-tec", name: "Tecnologia", type: "department", departmentId: "tecnologia", icon: "\uD83D\uDCBB", memberCount: 7, unread: 3 },
  { id: "ch-mkt", name: "Marketing", type: "department", departmentId: "marketing", icon: "\uD83C\uDFA8", memberCount: 4, unread: 1 },
  { id: "ch-ven", name: "Vendas", type: "department", departmentId: "vendas", icon: "\uD83D\uDCC8", memberCount: 6, unread: 0 },
  { id: "ch-rh", name: "RH", type: "department", departmentId: "rh", icon: "\uD83E\uDDE1", memberCount: 4, unread: 2 },
  { id: "ch-fin", name: "Financeiro", type: "department", departmentId: "financeiro", icon: "\uD83D\uDCB0", memberCount: 4, unread: 0 },
  { id: "ch-announce", name: "Comunicados", type: "announcement", icon: "\uD83D\uDCE2", memberCount: 30, unread: 1 },
]

// ── Helper: build a message from an NPC ────────────────────
function msg(
  npcId: string,
  content: string,
  minutesAgo: number,
  opts?: { pinned?: boolean; announcement?: boolean; extraReactions?: number[] }
): ChatMessage {
  const npc = npcs.find((n) => n.id === npcId)
  const name = npc?.name ?? "Sistema"
  const initials = npc?.initials ?? "SY"
  const color = npc?.avatarColor ?? "#6b7280"
  const role = npc?.isCeo ? "ceo" as const : npc?.isManager ? "gestor" as const : "colaborador" as const

  const reactions = createReactions()
  if (opts?.extraReactions) {
    opts.extraReactions.forEach((val, i) => {
      if (i < reactions.length) reactions[i].count = val
    })
  }

  return {
    id: `msg-${npcId}-${minutesAgo}`,
    senderId: npcId,
    senderName: name,
    senderInitials: initials,
    senderColor: color,
    senderRole: role,
    content,
    timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
    reactions,
    isPinned: opts?.pinned ?? false,
    isAnnouncement: opts?.announcement ?? false,
  }
}

// ── Mock conversations per department ──────────────────────
export const departmentMessages: Record<string, ChatMessage[]> = {
  "ch-tec": [
    msg("tec_mgr", "Equipe, lembrem de atualizar o status das tasks no board ate o fim do dia.", 120, { pinned: true, extraReactions: [4, 2, 0, 0] }),
    msg("tec1", "Terminei o refactor do componente de dashboard! Quem puder fazer review, agradeco.", 95, { extraReactions: [3, 5, 2, 1] }),
    msg("tec2", "Opa, vou revisar agora. Da uma olhada no PR #142 que tambem esta pendente.", 90),
    msg("tec3", "Pipeline de CI/CD atualizada. Agora o deploy esta 40% mais rapido.", 75, { extraReactions: [6, 3, 4, 2] }),
    msg("tec4", "Rodei os testes de regressao, tudo verde! Podemos seguir com o merge.", 60, { extraReactions: [2, 1, 0, 0] }),
    msg("tec5", "Compartilhando o novo design system atualizado. Confiram o Figma.", 45, { extraReactions: [5, 4, 3, 1] }),
    msg("tec_mgr", "Excelente trabalho, pessoal! Sprint indo muito bem. Keep it up!", 30, { extraReactions: [7, 5, 3, 2] }),
    msg("tec6", "Alguem pode me ajudar com a query de relatorios? Ta meio lenta.", 15),
    msg("tec2", "Manda o explain analyze que eu dou uma olhada!", 12),
    msg("tec1", "Eu tambem posso ajudar, Camila. Vou te chamar no privado.", 10),
  ],
  "ch-mkt": [
    msg("mkt_mgr", "Meta do mes: 50k impressoes na campanha nova. Vamos com tudo!", 200, { pinned: true, extraReactions: [3, 2, 1, 0] }),
    msg("mkt1", "Posts da semana agendados! Instagram e LinkedIn prontos.", 150, { extraReactions: [4, 2, 0, 0] }),
    msg("mkt2", "Artigo novo do blog publicado: 'Gamificacao no ambiente corporativo'.", 120, { extraReactions: [5, 3, 2, 1] }),
    msg("mkt3", "Banners da campanha ficaram incriveis! Vou mandar preview aqui.", 80, { extraReactions: [6, 4, 3, 2] }),
    msg("mkt_mgr", "Resultados parciais: ja batemos 32k impressoes. Otimo ritmo!", 40, { extraReactions: [4, 3, 2, 1] }),
    msg("mkt1", "A taxa de engajamento subiu 15% essa semana. O conteudo de video esta performando muito bem.", 20),
  ],
  "ch-ven": [
    msg("ven_mgr", "Foco total em fechar as propostas pendentes ate sexta! Meta batavel.", 180, { pinned: true, extraReactions: [5, 2, 0, 0] }),
    msg("ven1", "Fechei contrato com a TechStar! 120k ARR.", 140, { extraReactions: [8, 6, 5, 3] }),
    msg("ven2", "Parabens Diego! Que negociacao incrivel.", 138),
    msg("ven3", "Demo agendada com a GlobalTech para amanha as 14h.", 100),
    msg("ven4", "Trouxe 15 novos leads qualificados essa semana!", 70, { extraReactions: [4, 3, 2, 0] }),
    msg("ven_mgr", "Equipe, estamos 85% da meta mensal. Vamos fechar forte!", 35, { extraReactions: [6, 4, 2, 1] }),
    msg("ven5", "Follow-up com o cliente Nexus feito. Muito satisfeitos com o onboarding.", 15, { extraReactions: [3, 2, 0, 0] }),
  ],
  "ch-rh": [
    msg("rh_mgr", "Lembrete: pesquisa de clima abre amanha. Incentivem seus times!", 240, { pinned: true, extraReactions: [3, 1, 0, 0] }),
    msg("rh1", "Relatorio de beneficios atualizado. Novos planos disponiveis em marco.", 180, { extraReactions: [4, 2, 1, 0] }),
    msg("rh2", "Entrevistas da semana finalizadas. 3 candidatos excelentes para dev.", 120, { extraReactions: [3, 2, 0, 0] }),
    msg("rh3", "Treinamento de onboarding atualizado com a nova cultura gamificada!", 60, { extraReactions: [5, 4, 3, 2] }),
    msg("rh_mgr", "NPS interno subiu 5 pontos esse mes. Otimo sinal de melhoria no clima!", 25, { extraReactions: [7, 5, 3, 1] }),
  ],
  "ch-fin": [
    msg("fin_mgr", "Fechamento mensal: todas as conciliacoes ate quarta.", 300, { pinned: true, extraReactions: [2, 1, 0, 0] }),
    msg("fin1", "Relatorio de custos por departamento pronto. Envio ate o fim do dia.", 200, { extraReactions: [3, 2, 0, 0] }),
    msg("fin2", "Budget de Q2 aprovado pela diretoria. Podemos prosseguir com os projetos.", 120, { extraReactions: [5, 3, 2, 1] }),
    msg("fin3", "Notas fiscais de janeiro todas processadas e arquivadas.", 60, { extraReactions: [2, 1, 0, 0] }),
    msg("fin_mgr", "Custo por colaborador caiu 8% com o programa de gamificacao. Excelente ROI!", 20, { extraReactions: [6, 4, 3, 2] }),
  ],
}

// ── Announcements ──────────────────────────────────────────
export const announcements: ChatMessage[] = [
  msg("ceo1", "Querida equipe, estou muito orgulhoso do progresso que alcancamos neste trimestre. O engajamento subiu 23% e nosso NPS interno atingiu o recorde historico. Cada um de voces faz a diferenca! Continuem assim.", 480, { announcement: true, extraReactions: [18, 12, 8, 5] }),
  msg("ceo1", "A partir do proximo mes, estamos lancando o programa 'Embaixadores LevelCorp'. Os top 3 de cada departamento ganharao beneficios exclusivos e um bonus especial. Detalhes em breve!", 240, { announcement: true, extraReactions: [22, 15, 10, 7] }),
  msg("tec_mgr", "Time de Tecnologia: conquistamos a certificacao ISO 27001! Parabens a todos que contribuiram para este marco.", 180, { announcement: true, extraReactions: [10, 8, 5, 3] }),
  msg("mkt_mgr", "Campanha 'Cultura de Crescimento' atingiu 100k visualizacoes! Nosso melhor resultado ate agora.", 100, { announcement: true, extraReactions: [14, 9, 6, 4] }),
  msg("ven_mgr", "Meta de vendas de janeiro BATIDA com 15% acima do target! Equipe Vendas arrasou!", 50, { announcement: true, extraReactions: [16, 11, 7, 5] }),
]

// ── Proximity chat: mock conversations with specific NPCs ──
export function getProximityMessages(npc: NPC): ChatMessage[] {
  const conversations: Record<string, ChatMessage[]> = {
    "ceo1": [
      msg("ceo1", "Bom dia! Como estao as coisas no seu departamento?", 30),
      msg("ceo1", "Estou acompanhando os indicadores e o progresso esta excelente.", 28),
      msg("ceo1", "Se precisar de algo, minha porta esta sempre aberta.", 25),
    ],
    "tec_mgr": [
      msg("tec_mgr", "E ai, como esta o andamento das tarefas?", 45),
      msg("tec_mgr", "Preciso do update para a reuniao de status.", 40),
      msg("tec_mgr", "Qualquer bloqueio, me avisa que resolvo rapido.", 35),
    ],
    "tec1": [
      msg("tec1", "Oi! Voce viu o PR que eu abri? Preciso de uma review.", 20),
      msg("tec1", "Estou trabalhando no novo componente de charts tambem.", 15),
    ],
    "tec2": [
      msg("tec2", "Fala! To debugando aquela API que estava lenta.", 25),
      msg("tec2", "Ja descobri o problema, era o N+1 na query. Vou commitar a fix.", 20),
    ],
    "mkt_mgr": [
      msg("mkt_mgr", "Oi! Voce tem 5 minutos? Quero discutir a campanha nova.", 35),
      msg("mkt_mgr", "Os numeros estao muito bons, mas podemos otimizar o copy.", 30),
    ],
    "ven_mgr": [
      msg("ven_mgr", "Bom dia! Estamos perto de bater a meta. Foco total!", 50),
      msg("ven_mgr", "Se alguem precisar de suporte nas negociacoes, contem comigo.", 45),
    ],
    "ven1": [
      msg("ven1", "Cara, acabei de fechar um deal enorme! To muito feliz.", 15),
      msg("ven1", "O cliente adorou a apresentacao. Valeu pela ajuda no deck!", 10),
    ],
    "rh_mgr": [
      msg("rh_mgr", "Oi! Lembrete que a pesquisa de clima esta aberta ate sexta.", 40),
      msg("rh_mgr", "Se tiver algum feedback sobre o ambiente de trabalho, pode falar comigo.", 35),
    ],
    "fin_mgr": [
      msg("fin_mgr", "Oi! Preciso dos recibos de despesas do mes passado.", 60),
      msg("fin_mgr", "Qualquer duvida sobre reembolso, e so me procurar.", 55),
    ],
  }

  return conversations[npc.id] ?? [
    {
      id: `prox-${npc.id}-1`,
      senderId: npc.id,
      senderName: npc.name,
      senderInitials: npc.initials,
      senderColor: npc.avatarColor,
      senderRole: npc.isCeo ? "ceo" : npc.isManager ? "gestor" : "colaborador",
      content: `Oi! Sou ${npc.name.split(" ")[0]}, ${npc.role} do departamento de ${npc.department}. Como posso ajudar?`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      reactions: createReactions(),
      isPinned: false,
      isAnnouncement: false,
    },
  ]
}

// ── AI Assistant responses ─────────────────────────────────
export const aiResponses: Record<string, string> = {
  "resumir": "Resumo da conversa:\n- A equipe esta focada em entregas de sprint\n- Pipeline de CI/CD foi otimizada (40% mais rapido)\n- Todos os testes passaram\n- Design system atualizado no Figma\n- Um membro precisa de ajuda com query de relatorios\n\nSentimento geral: Positivo, equipe colaborativa e produtiva.",
  "tarefas": "Tarefas extraidas da conversa:\n1. Atualizar status das tasks no board (toda equipe)\n2. Review do PR #142 (Pedro)\n3. Otimizar query de relatorios (Camila + Pedro)\n4. Conferir design system no Figma (toda equipe)\n\nSugestao: Criar cards no board para cada item acima.",
  "tom": "Analise de tom da conversa:\n- Tom geral: Colaborativo e motivado\n- Nivel de formalidade: Informal-profissional\n- Pontos positivos: Membros se ajudam proativamente\n- Sugestao: Manter esse tom de reciprocidade. Considerar reconhecimento publico para os destaques.",
  "engajamento": "Analise de engajamento do canal:\n- Mensagens hoje: 10\n- Participacao: 85% dos membros interagiram\n- Reacoes totais: 47\n- Membro mais ativo: Ana Silva\n- Membro menos ativo: Marcos Ribeiro (ausente)\n- XP gerado por reacoes: +285 XP distribuidos\n\nRecomendacao: Engajar Marcos com uma missao colaborativa.",
}
