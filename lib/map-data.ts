// ── Map constants ──────────────────────────────────────────
export const TILE = 32
export const COLS = 40
export const ROWS = 30
export const MAP_W = COLS * TILE
export const MAP_H = ROWS * TILE

// ── Types ──────────────────────────────────────────────────
export type DeptPerformance = "green" | "yellow" | "red"

export interface Room {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  color: string
  darkColor: string
  type: "department" | "special" | "common"
  performance?: DeptPerformance
}

export interface NPC {
  id: string
  name: string
  initials: string
  role: string
  department: string
  tileX: number
  tileY: number
  level: number
  xp: number
  isManager: boolean
  isCeo: boolean
  avatarColor: string
  status: "online" | "busy" | "away"
}

// ── Rooms ──────────────────────────────────────────────────
export const rooms: Room[] = [
  // Row 1 – top
  { id: "recepcao", label: "Recepcao", x: 0, y: 0, w: 20, h: 5, color: "#e8e4df", darkColor: "#2a2825", type: "common" },
  { id: "convivencia", label: "Area de Convivencia", x: 20, y: 0, w: 20, h: 5, color: "#e0ebe7", darkColor: "#1f2e28", type: "common" },
  // Row 2
  { id: "tecnologia", label: "Tecnologia", x: 0, y: 5, w: 20, h: 6, color: "#dce8f5", darkColor: "#1b2638", type: "department", performance: "green" },
  { id: "marketing", label: "Marketing", x: 20, y: 5, w: 20, h: 6, color: "#f5e6dc", darkColor: "#382a1b", type: "department", performance: "green" },
  // Row 3
  { id: "vendas", label: "Vendas", x: 0, y: 11, w: 20, h: 6, color: "#e2f5dc", darkColor: "#1f3819", type: "department", performance: "yellow" },
  { id: "rh", label: "Recursos Humanos", x: 20, y: 11, w: 20, h: 6, color: "#f5dcf2", darkColor: "#351b38", type: "department", performance: "green" },
  // Row 4
  { id: "financeiro", label: "Financeiro", x: 0, y: 17, w: 20, h: 5, color: "#dcf0f5", darkColor: "#1b3238", type: "department", performance: "yellow" },
  { id: "treinamento", label: "Sala de Treinamento", x: 20, y: 17, w: 20, h: 5, color: "#f0f0e0", darkColor: "#2e2e1f", type: "special" },
  // Row 5
  { id: "fama", label: "Hall da Fama", x: 0, y: 22, w: 20, h: 4, color: "#f5f0dc", darkColor: "#38331b", type: "special" },
  { id: "ceo_office", label: "Escritorio CEO", x: 20, y: 22, w: 20, h: 4, color: "#f5eadc", darkColor: "#3a301b", type: "special" },
  // Row 6 – bottom
  { id: "auditorio", label: "Auditorio", x: 0, y: 26, w: 40, h: 4, color: "#e4e0ec", darkColor: "#262030", type: "common" },
]

// ── Walls (tiles that block movement) ──────────────────────
// We store horizontal and vertical wall segments as line pairs.
// Movement blocker: the border rows/cols of each room except doors.
export function isWall(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true

  // Room borders
  const borderRows = [0, 5, 11, 17, 22, 26, ROWS - 1]
  const borderCols = [0, 20, COLS - 1]

  const onHBorder = borderRows.includes(ty)
  const onVBorder = borderCols.includes(tx)

  if (onHBorder || onVBorder) {
    // Doors at midpoints of each room edge
    // Horizontal doors (center of each room width = col 10, 30)
    if (onHBorder && !onVBorder) {
      const doorCols = [9, 10, 11, 29, 30, 31]
      if (doorCols.includes(tx)) return false
    }
    // Vertical doors (center of each room height segment)
    if (onVBorder && !onHBorder) {
      // door at center of each row section
      const doorRows = [2, 3, 7, 8, 13, 14, 19, 20, 23, 24, 27, 28]
      if (doorRows.includes(ty)) return false
    }
    // Corner tiles are always walls
    if (onHBorder && onVBorder) return true
    return onHBorder || onVBorder
  }
  return false
}

// ── Furniture positions (just for rendering) ───────────────
export interface Furniture {
  tileX: number
  tileY: number
  type: "desk" | "chair" | "plant" | "trophy" | "whiteboard" | "sofa" | "podium" | "screen"
}

function generateDesks(room: Room, count: number): Furniture[] {
  const items: Furniture[] = []
  const startX = room.x + 2
  const startY = room.y + 2
  const cols = Math.min(count, 4)
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    items.push({ tileX: startX + col * 4, tileY: startY + row * 2, type: "desk" })
    items.push({ tileX: startX + col * 4, tileY: startY + row * 2 + 1, type: "chair" })
  }
  return items
}

export const furniture: Furniture[] = [
  // Recepcao
  { tileX: 5, tileY: 2, type: "desk" },
  { tileX: 14, tileY: 2, type: "plant" },
  { tileX: 17, tileY: 2, type: "plant" },
  // Convivencia
  { tileX: 24, tileY: 2, type: "sofa" },
  { tileX: 28, tileY: 2, type: "sofa" },
  { tileX: 34, tileY: 2, type: "plant" },
  // Tecnologia
  ...generateDesks(rooms[2], 6),
  // Marketing
  ...generateDesks(rooms[3], 4),
  // Vendas
  ...generateDesks(rooms[4], 5),
  // RH
  ...generateDesks(rooms[5], 3),
  // Financeiro
  ...generateDesks(rooms[6], 3),
  // Treinamento
  { tileX: 24, tileY: 19, type: "whiteboard" },
  { tileX: 26, tileY: 20, type: "chair" },
  { tileX: 28, tileY: 20, type: "chair" },
  { tileX: 30, tileY: 20, type: "chair" },
  // Hall da Fama
  { tileX: 3, tileY: 23, type: "trophy" },
  { tileX: 7, tileY: 23, type: "trophy" },
  { tileX: 11, tileY: 23, type: "trophy" },
  { tileX: 15, tileY: 23, type: "trophy" },
  // CEO Office
  { tileX: 28, tileY: 23, type: "desk" },
  { tileX: 28, tileY: 24, type: "chair" },
  { tileX: 34, tileY: 23, type: "plant" },
  // Auditorio
  { tileX: 10, tileY: 27, type: "podium" },
  { tileX: 18, tileY: 28, type: "screen" },
  { tileX: 14, tileY: 28, type: "chair" },
  { tileX: 16, tileY: 28, type: "chair" },
  { tileX: 18, tileY: 29, type: "chair" },
  { tileX: 20, tileY: 29, type: "chair" },
  { tileX: 22, tileY: 28, type: "chair" },
  { tileX: 24, tileY: 28, type: "chair" },
]

// ── NPCs ───────────────────────────────────────────────────
export const npcs: NPC[] = [
  // ─── CEO ───
  { id: "ceo1", name: "Roberto Almeida", initials: "RA", role: "CEO", department: "Diretoria", tileX: 30, tileY: 23, level: 20, xp: 15000, isManager: false, isCeo: true, avatarColor: "#EAB308", status: "online" },

  // ─── Tecnologia ───
  { id: "tec_mgr", name: "Carlos Mendes", initials: "CM", role: "Gestor de Tecnologia", department: "Tecnologia", tileX: 4, tileY: 6, level: 12, xp: 5600, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "tec1", name: "Ana Silva", initials: "AS", role: "Dev Frontend", department: "Tecnologia", tileX: 6, tileY: 7, level: 7, xp: 2340, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec2", name: "Pedro Santos", initials: "PS", role: "Dev Backend", department: "Tecnologia", tileX: 10, tileY: 7, level: 6, xp: 2100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec3", name: "Lucas Ferreira", initials: "LF", role: "DevOps", department: "Tecnologia", tileX: 14, tileY: 7, level: 5, xp: 1750, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "tec4", name: "Julia Oliveira", initials: "JO", role: "QA Engineer", department: "Tecnologia", tileX: 6, tileY: 9, level: 5, xp: 1620, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec5", name: "Marcos Ribeiro", initials: "MR", role: "UX Designer", department: "Tecnologia", tileX: 10, tileY: 9, level: 4, xp: 1200, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },
  { id: "tec6", name: "Camila Souza", initials: "CS", role: "Data Analyst", department: "Tecnologia", tileX: 14, tileY: 9, level: 4, xp: 1100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ─── Marketing ───
  { id: "mkt_mgr", name: "Fernanda Lima", initials: "FL", role: "Gestora de Marketing", department: "Marketing", tileX: 24, tileY: 6, level: 10, xp: 4800, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "mkt1", name: "Carla Dias", initials: "CD", role: "Social Media", department: "Marketing", tileX: 26, tileY: 7, level: 6, xp: 2050, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "mkt2", name: "Thiago Moura", initials: "TM", role: "Content Writer", department: "Marketing", tileX: 30, tileY: 7, level: 5, xp: 1800, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "mkt3", name: "Beatriz Ramos", initials: "BR", role: "Designer Grafico", department: "Marketing", tileX: 34, tileY: 7, level: 5, xp: 1650, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ─── Vendas ───
  { id: "ven_mgr", name: "Ricardo Souza", initials: "RS", role: "Gestor de Vendas", department: "Vendas", tileX: 4, tileY: 12, level: 11, xp: 5200, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "ven1", name: "Diego Martins", initials: "DM", role: "Vendedor Senior", department: "Vendas", tileX: 6, tileY: 13, level: 8, xp: 3400, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "ven2", name: "Isabela Rocha", initials: "IR", role: "Vendedora", department: "Vendas", tileX: 10, tileY: 13, level: 6, xp: 2200, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "ven3", name: "Gabriel Lopes", initials: "GL", role: "Vendedor", department: "Vendas", tileX: 14, tileY: 13, level: 5, xp: 1900, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },
  { id: "ven4", name: "Larissa Neves", initials: "LN", role: "SDR", department: "Vendas", tileX: 6, tileY: 15, level: 4, xp: 1400, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "ven5", name: "Rafael Cunha", initials: "RC", role: "Pos-Venda", department: "Vendas", tileX: 10, tileY: 15, level: 4, xp: 1300, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ─── RH ───
  { id: "rh_mgr", name: "Patricia Nunes", initials: "PN", role: "Gestora de RH", department: "RH", tileX: 24, tileY: 12, level: 9, xp: 4200, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "rh1", name: "Amanda Vieira", initials: "AV", role: "Analista RH", department: "RH", tileX: 26, tileY: 13, level: 6, xp: 2100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "rh2", name: "Felipe Cardoso", initials: "FC", role: "Recrutador", department: "RH", tileX: 30, tileY: 13, level: 5, xp: 1700, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "rh3", name: "Renata Barros", initials: "RB", role: "T&D", department: "RH", tileX: 34, tileY: 13, level: 4, xp: 1350, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ─── Financeiro ───
  { id: "fin_mgr", name: "Bruno Costa", initials: "BC", role: "Gestor Financeiro", department: "Financeiro", tileX: 4, tileY: 18, level: 10, xp: 4600, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "fin1", name: "Daniela Pinto", initials: "DP", role: "Controller", department: "Financeiro", tileX: 6, tileY: 19, level: 7, xp: 2800, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "fin2", name: "Gustavo Alves", initials: "GA", role: "Analista Financeiro", department: "Financeiro", tileX: 10, tileY: 19, level: 5, xp: 1550, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "fin3", name: "Vanessa Lima", initials: "VL", role: "Tesoureira", department: "Financeiro", tileX: 14, tileY: 19, level: 4, xp: 1250, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },
]

// ── Helpers ────────────────────────────────────────────────
export function getRoomAt(tx: number, ty: number): Room | undefined {
  return rooms.find(
    (r) => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h
  )
}

export function getNpcNear(px: number, py: number, radius = 2): NPC | null {
  for (const npc of npcs) {
    const dx = npc.tileX - px
    const dy = npc.tileY - py
    if (Math.abs(dx) <= radius && Math.abs(dy) <= radius) return npc
  }
  return null
}
