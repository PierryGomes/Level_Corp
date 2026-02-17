export type StoreCategory = "all" | "experiencias" | "educacao" | "lifestyle" | "exclusivos"

export interface RewardItem {
  id: string
  name: string
  description: string
  price: number
  category: StoreCategory
  icon: string
  stock: number | null
  levelRequired: number
  popular: boolean
  tag?: string
}

export interface PurchaseRecord {
  id: string
  itemId: string
  itemName: string
  price: number
  date: string
  status: "resgatado" | "pendente" | "utilizado"
}

export const categoryLabels: Record<StoreCategory, string> = {
  all: "Todos",
  experiencias: "Experiencias",
  educacao: "Educacao",
  lifestyle: "Lifestyle",
  exclusivos: "Exclusivos",
}

export const categoryIcons: Record<StoreCategory, string> = {
  all: "grid",
  experiencias: "sparkles",
  educacao: "book",
  lifestyle: "shirt",
  exclusivos: "crown",
}

export const storeItems: RewardItem[] = [
  // Experiencias
  {
    id: "exp-1",
    name: "Dia de Folga",
    description: "Um dia livre extra para descansar e recarregar as energias. Valido por 30 dias.",
    price: 800,
    category: "experiencias",
    icon: "palm-tree",
    stock: null,
    levelRequired: 5,
    popular: true,
    tag: "Mais Resgatado",
  },
  {
    id: "exp-2",
    name: "Home Office Semanal",
    description: "Uma semana inteira trabalhando de casa. Agende com seu gestor.",
    price: 500,
    category: "experiencias",
    icon: "house",
    stock: null,
    levelRequired: 3,
    popular: true,
  },
  {
    id: "exp-3",
    name: "Saida Antecipada",
    description: "Saia 3 horas mais cedo em um dia da semana. Valido por 15 dias.",
    price: 300,
    category: "experiencias",
    icon: "clock",
    stock: null,
    levelRequired: 2,
    popular: false,
  },
  {
    id: "exp-4",
    name: "Vaga VIP Estacionamento",
    description: "Vaga premium no estacionamento por 1 mes completo.",
    price: 400,
    category: "experiencias",
    icon: "car",
    stock: 5,
    levelRequired: 4,
    popular: false,
  },
  // Educacao
  {
    id: "edu-1",
    name: "Curso Online Premium",
    description: "Acesso a qualquer curso na plataforma parceira (Udemy, Coursera, Alura).",
    price: 600,
    category: "educacao",
    icon: "graduation-cap",
    stock: null,
    levelRequired: 3,
    popular: true,
  },
  {
    id: "edu-2",
    name: "Livro a Escolha",
    description: "Escolha qualquer livro (fisico ou digital) ate R$150. Entrega no escritorio.",
    price: 200,
    category: "educacao",
    icon: "book-open",
    stock: null,
    levelRequired: 1,
    popular: false,
  },
  {
    id: "edu-3",
    name: "Workshop Externo",
    description: "Inscricao em workshop ou evento presencial ate R$500 de valor.",
    price: 1000,
    category: "educacao",
    icon: "presentation",
    stock: 8,
    levelRequired: 6,
    popular: false,
  },
  {
    id: "edu-4",
    name: "Certificacao Profissional",
    description: "Subsidio para certificacao oficial na sua area (AWS, Google, PMP, etc).",
    price: 1500,
    category: "educacao",
    icon: "award",
    stock: 3,
    levelRequired: 10,
    popular: false,
    tag: "Premium",
  },
  // Lifestyle
  {
    id: "lif-1",
    name: "Voucher Almoco",
    description: "Vale-refeicao de R$80 em restaurantes parceiros perto do escritorio.",
    price: 150,
    category: "lifestyle",
    icon: "utensils",
    stock: null,
    levelRequired: 1,
    popular: true,
  },
  {
    id: "lif-2",
    name: "Camiseta LevelCorp",
    description: "Camiseta exclusiva com o logo da LevelCorp. Disponivel em todos os tamanhos.",
    price: 250,
    category: "lifestyle",
    icon: "shirt",
    stock: 20,
    levelRequired: 2,
    popular: false,
  },
  {
    id: "lif-3",
    name: "Kit Wellness",
    description: "Kit com garrafa termica, fone bluetooth e necessaire. Embalagem premium.",
    price: 500,
    category: "lifestyle",
    icon: "heart-pulse",
    stock: 10,
    levelRequired: 5,
    popular: false,
  },
  {
    id: "lif-4",
    name: "Voucher Spotify/Netflix",
    description: "3 meses de assinatura Spotify Premium ou Netflix Standard.",
    price: 350,
    category: "lifestyle",
    icon: "music",
    stock: null,
    levelRequired: 3,
    popular: true,
  },
  // Exclusivos
  {
    id: "exc-1",
    name: "Almoco com o CEO",
    description: "Almoco exclusivo com Roberto Almeida para trocar ideias e fazer networking.",
    price: 2000,
    category: "exclusivos",
    icon: "crown",
    stock: 2,
    levelRequired: 15,
    popular: false,
    tag: "Raro",
  },
  {
    id: "exc-2",
    name: "Mentoria Executiva",
    description: "3 sessoes de mentoria com um diretor da empresa. Escolha o departamento.",
    price: 1500,
    category: "exclusivos",
    icon: "brain",
    stock: 4,
    levelRequired: 10,
    popular: false,
    tag: "Premium",
  },
  {
    id: "exc-3",
    name: "Viagem de Experiencia",
    description: "Viagem de 2 dias para conferencia ou evento com tudo pago pela empresa.",
    price: 3000,
    category: "exclusivos",
    icon: "plane",
    stock: 1,
    levelRequired: 18,
    popular: false,
    tag: "Lendario",
  },
  {
    id: "exc-4",
    name: "Personalize sua Mesa",
    description: "Budget de R$300 para personalizar seu espaco de trabalho como quiser.",
    price: 450,
    category: "exclusivos",
    icon: "palette",
    stock: 6,
    levelRequired: 8,
    popular: false,
  },
]

export function getMockPurchaseHistory(userId: string): PurchaseRecord[] {
  if (userId === "1") {
    return [
      { id: "p1", itemId: "lif-1", itemName: "Voucher Almoco", price: 150, date: "2026-02-10", status: "utilizado" },
      { id: "p2", itemId: "edu-2", itemName: "Livro a Escolha", price: 200, date: "2026-02-05", status: "resgatado" },
      { id: "p3", itemId: "exp-3", itemName: "Saida Antecipada", price: 300, date: "2026-01-28", status: "utilizado" },
    ]
  }
  if (userId === "2") {
    return [
      { id: "p4", itemId: "edu-1", itemName: "Curso Online Premium", price: 600, date: "2026-02-12", status: "resgatado" },
      { id: "p5", itemId: "exp-1", itemName: "Dia de Folga", price: 800, date: "2026-02-01", status: "utilizado" },
      { id: "p6", itemId: "lif-4", itemName: "Voucher Spotify/Netflix", price: 350, date: "2026-01-20", status: "utilizado" },
      { id: "p7", itemId: "lif-2", itemName: "Camiseta LevelCorp", price: 250, date: "2026-01-15", status: "utilizado" },
    ]
  }
  return []
}

export function getTeamPurchases(): { name: string; item: string; date: string; price: number }[] {
  return [
    { name: "Ana Silva", item: "Voucher Almoco", date: "2026-02-10", price: 150 },
    { name: "Pedro Santos", item: "Dia de Folga", date: "2026-02-08", price: 800 },
    { name: "Maria Costa", item: "Livro a Escolha", date: "2026-02-06", price: 200 },
    { name: "Lucas Ferreira", item: "Camiseta LevelCorp", date: "2026-02-04", price: 250 },
    { name: "Julia Oliveira", item: "Curso Online Premium", date: "2026-02-01", price: 600 },
  ]
}

export function getStoreDashboardStats() {
  return {
    totalSpent: 18450,
    totalTransactions: 87,
    avgPerUser: 236,
    topItems: [
      { name: "Voucher Almoco", count: 24 },
      { name: "Dia de Folga", count: 18 },
      { name: "Curso Online Premium", count: 14 },
      { name: "Livro a Escolha", count: 12 },
      { name: "Camiseta LevelCorp", count: 9 },
    ],
    monthlySpend: [
      { month: "Set", value: 1200 },
      { month: "Out", value: 2800 },
      { month: "Nov", value: 3100 },
      { month: "Dez", value: 2400 },
      { month: "Jan", value: 4200 },
      { month: "Fev", value: 4750 },
    ],
  }
}

export function getItemsByCategory(category: StoreCategory): RewardItem[] {
  if (category === "all") return storeItems
  return storeItems.filter((item) => item.category === category)
}

export function canPurchase(item: RewardItem, userCoins: number, userLevel: number): { ok: boolean; reason?: string } {
  if (userLevel < item.levelRequired) return { ok: false, reason: `Requer Level ${item.levelRequired}` }
  if (userCoins < item.price) return { ok: false, reason: "Saldo insuficiente" }
  if (item.stock !== null && item.stock <= 0) return { ok: false, reason: "Fora de estoque" }
  return { ok: true }
}
