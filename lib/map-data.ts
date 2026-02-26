// ── Map constants ──────────────────────────────────────────
export const TILE = 32
export const COLS = 50
export const ROWS = 36
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
  type: "department" | "special" | "common" | "central"
  performance?: DeptPerformance
  icon?: string
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

// ── Rooms - LevelCorp Futuristic Office ──────────────────────────────────────────────────
export const rooms: Room[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════
  // TOP ROW - Lounge Social & Sala de Treinamento
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "lounge", label: "Lounge Social", x: 0, y: 0, w: 16, h: 8, color: "#fef9c3", darkColor: "#1c1a00", type: "common", icon: "coffee" },
  { id: "cafeteria", label: "Cafeteria", x: 16, y: 0, w: 10, h: 8, color: "#fef3c7", darkColor: "#1a1600", type: "common", icon: "utensils" },
  { id: "treinamento", label: "Sala de Treinamento", x: 26, y: 0, w: 14, h: 8, color: "#fde68a", darkColor: "#1f1a00", type: "special", icon: "graduation" },
  { id: "biblioteca", label: "Biblioteca Digital", x: 40, y: 0, w: 10, h: 8, color: "#fcd34d", darkColor: "#1c1500", type: "special", icon: "book" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SECOND ROW - Open Space Colaborativo (esquerda) + Praca Central + Valorizacao (direita)
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "open_space_1", label: "Open Space - Tech", x: 0, y: 8, w: 12, h: 10, color: "#fefce8", darkColor: "#171500", type: "department", performance: "green", icon: "code" },
  { id: "open_space_2", label: "Open Space - Marketing", x: 12, y: 8, w: 8, h: 10, color: "#fef9c3", darkColor: "#1a1700", type: "department", performance: "green", icon: "megaphone" },
  
  // PRACA CENTRAL - O coracao do escritorio
  { id: "praca_central", label: "Praca LevelCorp", x: 20, y: 8, w: 10, h: 12, color: "#fbbf24", darkColor: "#292000", type: "central", icon: "star" },
  
  { id: "valorizacao", label: "Hall de Valorizacao", x: 30, y: 8, w: 10, h: 10, color: "#fde047", darkColor: "#1e1900", type: "special", icon: "trophy" },
  { id: "conquistas", label: "Mural de Conquistas", x: 40, y: 8, w: 10, h: 10, color: "#facc15", darkColor: "#1d1700", type: "special", icon: "medal" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // THIRD ROW - Vendas/RH + Extensao Praca + Financeiro
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "vendas", label: "Vendas", x: 0, y: 18, w: 10, h: 8, color: "#fef3c7", darkColor: "#1a1500", type: "department", performance: "yellow", icon: "chart" },
  { id: "rh", label: "Recursos Humanos", x: 10, y: 18, w: 10, h: 8, color: "#fde68a", darkColor: "#1b1600", type: "department", performance: "green", icon: "users" },
  { id: "financeiro", label: "Financeiro", x: 30, y: 18, w: 10, h: 8, color: "#fcd34d", darkColor: "#1c1400", type: "department", performance: "green", icon: "coins" },
  { id: "juridico", label: "Juridico", x: 40, y: 18, w: 10, h: 8, color: "#fbbf24", darkColor: "#1d1300", type: "department", performance: "green", icon: "scale" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // BOTTOM ROW - Sala da Missao + Lideranca + CEO
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "missao", label: "Sala da Missao", x: 0, y: 26, w: 16, h: 10, color: "#f59e0b", darkColor: "#1f1700", type: "special", icon: "target" },
  { id: "sala_reuniao", label: "Sala de Reunioes", x: 16, y: 26, w: 10, h: 10, color: "#d97706", darkColor: "#1a1200", type: "common", icon: "presentation" },
  { id: "lideranca", label: "Sala da Lideranca", x: 26, y: 26, w: 14, h: 10, color: "#b45309", darkColor: "#1c1000", type: "special", icon: "crown" },
  { id: "ceo_office", label: "Escritorio CEO", x: 40, y: 26, w: 10, h: 10, color: "#92400e", darkColor: "#1a0e00", type: "special", icon: "diamond" },
]

// ── Walls (tiles that block movement) ──────────────────────
// Improved wall system with door connections between all adjacent rooms
export function isWall(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true

  // Horizontal borders (top/bottom of rooms)
  const borderRows = [0, 8, 18, 20, 26, ROWS - 1]
  // Vertical borders
  const borderCols = [0, 12, 16, 20, 26, 30, 40, COLS - 1]

  const onHBorder = borderRows.includes(ty)
  const onVBorder = borderCols.includes(tx)

  // Door positions - wide openings for better flow
  const horizontalDoors = [
    // Top row doors (y=8)
    { y: 8, x1: 5, x2: 7 },    // Lounge -> Open Space Tech
    { y: 8, x1: 18, x2: 20 },  // Cafeteria -> Open Space Marketing
    { y: 8, x1: 32, x2: 34 },  // Treinamento -> Valorizacao
    { y: 8, x1: 44, x2: 46 },  // Biblioteca -> Conquistas
    // Row 2 doors (y=18)
    { y: 18, x1: 4, x2: 6 },   // Open Space Tech -> Vendas
    { y: 18, x1: 14, x2: 16 }, // Open Space Marketing -> RH
    { y: 18, x1: 24, x2: 26 }, // Praca -> Center passage
    { y: 18, x1: 34, x2: 36 }, // Valorizacao -> Financeiro
    { y: 18, x1: 44, x2: 46 }, // Conquistas -> Juridico
    // Praca special row (y=20)
    { y: 20, x1: 24, x2: 26 }, // Praca connection
    // Row 3 doors (y=26)
    { y: 26, x1: 6, x2: 8 },   // Vendas -> Missao
    { y: 26, x1: 14, x2: 16 }, // RH -> Sala Reuniao
    { y: 26, x1: 24, x2: 26 }, // Center -> Sala Reuniao
    { y: 26, x1: 34, x2: 36 }, // Financeiro -> Lideranca
    { y: 26, x1: 44, x2: 46 }, // Juridico -> CEO
  ]

  const verticalDoors = [
    // Left side vertical doors
    { x: 12, y1: 12, y2: 14 }, // Open Space Tech <-> Marketing
    { x: 16, y1: 3, y2: 5 },   // Lounge <-> Cafeteria
    { x: 26, y1: 3, y2: 5 },   // Cafeteria <-> Treinamento
    { x: 40, y1: 3, y2: 5 },   // Treinamento <-> Biblioteca
    // Praca connections
    { x: 20, y1: 12, y2: 14 }, // Open Space -> Praca
    { x: 30, y1: 12, y2: 14 }, // Praca -> Valorizacao
    { x: 40, y1: 12, y2: 14 }, // Valorizacao -> Conquistas
    // Middle row
    { x: 20, y1: 21, y2: 23 }, // Praca -> lower area
    { x: 30, y1: 21, y2: 23 }, // lower connector
    { x: 40, y1: 21, y2: 23 }, // Financeiro <-> Juridico
    // Bottom row
    { x: 16, y1: 30, y2: 32 }, // Missao <-> Sala Reuniao
    { x: 26, y1: 30, y2: 32 }, // Sala Reuniao <-> Lideranca
    { x: 40, y1: 30, y2: 32 }, // Lideranca <-> CEO
  ]

  // Check if position is a door
  if (onHBorder) {
    for (const door of horizontalDoors) {
      if (ty === door.y && tx >= door.x1 && tx <= door.x2) return false
    }
  }
  if (onVBorder) {
    for (const door of verticalDoors) {
      if (tx === door.x && ty >= door.y1 && ty <= door.y2) return false
    }
  }

  // Corners are always walls
  if (onHBorder && onVBorder) return true
  
  // Border tiles that aren't doors are walls
  if (onHBorder || onVBorder) return true

  return false
}

// ── Furniture positions (just for rendering) ───────────────
export interface Furniture {
  tileX: number
  tileY: number
  type: "desk" | "chair" | "plant" | "trophy" | "whiteboard" | "sofa" | "podium" | "screen" | 
        "coffee_machine" | "table_round" | "bookshelf" | "medal_display" | "ranking_screen" |
        "logo_floor" | "gaming_chair" | "arcade" | "neon_sign" | "mission_board" | "dashboard_screen"
  glow?: string
}

export const furniture: Furniture[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════
  // LOUNGE SOCIAL - Sofas, mesas, plantas decorativas
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 3, tileY: 2, type: "sofa", glow: "#fbbf24" },
  { tileX: 6, tileY: 2, type: "sofa", glow: "#fbbf24" },
  { tileX: 3, tileY: 5, type: "sofa", glow: "#fbbf24" },
  { tileX: 6, tileY: 5, type: "sofa", glow: "#fbbf24" },
  { tileX: 10, tileY: 3, type: "table_round" },
  { tileX: 13, tileY: 3, type: "table_round" },
  { tileX: 10, tileY: 6, type: "arcade", glow: "#eab308" },
  { tileX: 13, tileY: 6, type: "arcade", glow: "#eab308" },
  { tileX: 1, tileY: 1, type: "plant" },
  { tileX: 14, tileY: 1, type: "plant" },
  { tileX: 1, tileY: 6, type: "neon_sign", glow: "#fbbf24" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // CAFETERIA
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 18, tileY: 2, type: "coffee_machine", glow: "#f59e0b" },
  { tileX: 21, tileY: 2, type: "coffee_machine", glow: "#f59e0b" },
  { tileX: 18, tileY: 4, type: "table_round" },
  { tileX: 21, tileY: 4, type: "table_round" },
  { tileX: 18, tileY: 6, type: "chair" },
  { tileX: 21, tileY: 6, type: "chair" },
  { tileX: 24, tileY: 3, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SALA DE TREINAMENTO - Telas de cursos, cadeiras, medalhas
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 29, tileY: 1, type: "screen", glow: "#fbbf24" },
  { tileX: 33, tileY: 1, type: "screen", glow: "#fbbf24" },
  { tileX: 37, tileY: 1, type: "whiteboard" },
  { tileX: 29, tileY: 4, type: "gaming_chair" },
  { tileX: 31, tileY: 4, type: "gaming_chair" },
  { tileX: 33, tileY: 4, type: "gaming_chair" },
  { tileX: 35, tileY: 4, type: "gaming_chair" },
  { tileX: 29, tileY: 6, type: "desk" },
  { tileX: 33, tileY: 6, type: "desk" },
  { tileX: 38, tileY: 3, type: "medal_display", glow: "#eab308" },
  { tileX: 38, tileY: 6, type: "medal_display", glow: "#eab308" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // BIBLIOTECA DIGITAL
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 42, tileY: 1, type: "bookshelf" },
  { tileX: 45, tileY: 1, type: "bookshelf" },
  { tileX: 48, tileY: 1, type: "bookshelf" },
  { tileX: 42, tileY: 4, type: "desk" },
  { tileX: 46, tileY: 4, type: "desk" },
  { tileX: 42, tileY: 5, type: "chair" },
  { tileX: 46, tileY: 5, type: "chair" },
  { tileX: 48, tileY: 6, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // OPEN SPACE - TECH (mesas colaborativas, quadros interativos)
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 2, tileY: 10, type: "desk" },
  { tileX: 5, tileY: 10, type: "desk" },
  { tileX: 8, tileY: 10, type: "desk" },
  { tileX: 2, tileY: 11, type: "chair" },
  { tileX: 5, tileY: 11, type: "chair" },
  { tileX: 8, tileY: 11, type: "chair" },
  { tileX: 2, tileY: 14, type: "desk" },
  { tileX: 5, tileY: 14, type: "desk" },
  { tileX: 8, tileY: 14, type: "desk" },
  { tileX: 2, tileY: 15, type: "chair" },
  { tileX: 5, tileY: 15, type: "chair" },
  { tileX: 8, tileY: 15, type: "chair" },
  { tileX: 10, tileY: 9, type: "whiteboard" },
  { tileX: 10, tileY: 16, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // OPEN SPACE - MARKETING
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 14, tileY: 10, type: "desk" },
  { tileX: 17, tileY: 10, type: "desk" },
  { tileX: 14, tileY: 11, type: "chair" },
  { tileX: 17, tileY: 11, type: "chair" },
  { tileX: 14, tileY: 14, type: "desk" },
  { tileX: 17, tileY: 14, type: "desk" },
  { tileX: 14, tileY: 15, type: "chair" },
  { tileX: 17, tileY: 15, type: "chair" },
  { tileX: 18, tileY: 9, type: "whiteboard" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // PRACA CENTRAL - Logo no chao, ranking digital, bancos
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 25, tileY: 13, type: "logo_floor", glow: "#fbbf24" },
  { tileX: 25, tileY: 9, type: "ranking_screen", glow: "#eab308" },
  { tileX: 22, tileY: 11, type: "sofa", glow: "#fbbf24" },
  { tileX: 28, tileY: 11, type: "sofa", glow: "#fbbf24" },
  { tileX: 22, tileY: 15, type: "sofa", glow: "#fbbf24" },
  { tileX: 28, tileY: 15, type: "sofa", glow: "#fbbf24" },
  { tileX: 21, tileY: 9, type: "plant" },
  { tileX: 29, tileY: 9, type: "plant" },
  { tileX: 21, tileY: 18, type: "plant" },
  { tileX: 29, tileY: 18, type: "plant" },
  { tileX: 25, tileY: 17, type: "neon_sign", glow: "#fbbf24" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // HALL DE VALORIZACAO - Trofeus digitais, mural de conquistas
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 32, tileY: 10, type: "trophy", glow: "#eab308" },
  { tileX: 35, tileY: 10, type: "trophy", glow: "#eab308" },
  { tileX: 38, tileY: 10, type: "trophy", glow: "#eab308" },
  { tileX: 32, tileY: 14, type: "medal_display", glow: "#fbbf24" },
  { tileX: 35, tileY: 14, type: "medal_display", glow: "#fbbf24" },
  { tileX: 38, tileY: 14, type: "medal_display", glow: "#fbbf24" },
  { tileX: 35, tileY: 12, type: "podium", glow: "#eab308" },
  { tileX: 31, tileY: 9, type: "neon_sign", glow: "#fbbf24" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // MURAL DE CONQUISTAS
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 42, tileY: 10, type: "medal_display", glow: "#eab308" },
  { tileX: 45, tileY: 10, type: "medal_display", glow: "#eab308" },
  { tileX: 48, tileY: 10, type: "medal_display", glow: "#eab308" },
  { tileX: 42, tileY: 14, type: "trophy", glow: "#fbbf24" },
  { tileX: 45, tileY: 14, type: "trophy", glow: "#fbbf24" },
  { tileX: 48, tileY: 14, type: "trophy", glow: "#fbbf24" },
  { tileX: 45, tileY: 12, type: "screen", glow: "#eab308" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // VENDAS
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 2, tileY: 20, type: "desk" },
  { tileX: 5, tileY: 20, type: "desk" },
  { tileX: 2, tileY: 21, type: "chair" },
  { tileX: 5, tileY: 21, type: "chair" },
  { tileX: 2, tileY: 23, type: "desk" },
  { tileX: 5, tileY: 23, type: "desk" },
  { tileX: 2, tileY: 24, type: "chair" },
  { tileX: 5, tileY: 24, type: "chair" },
  { tileX: 8, tileY: 20, type: "whiteboard" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // RH
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 12, tileY: 20, type: "desk" },
  { tileX: 15, tileY: 20, type: "desk" },
  { tileX: 12, tileY: 21, type: "chair" },
  { tileX: 15, tileY: 21, type: "chair" },
  { tileX: 12, tileY: 23, type: "desk" },
  { tileX: 15, tileY: 23, type: "desk" },
  { tileX: 12, tileY: 24, type: "chair" },
  { tileX: 15, tileY: 24, type: "chair" },
  { tileX: 18, tileY: 19, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // FINANCEIRO
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 32, tileY: 20, type: "desk" },
  { tileX: 35, tileY: 20, type: "desk" },
  { tileX: 32, tileY: 21, type: "chair" },
  { tileX: 35, tileY: 21, type: "chair" },
  { tileX: 32, tileY: 23, type: "desk" },
  { tileX: 35, tileY: 23, type: "desk" },
  { tileX: 32, tileY: 24, type: "chair" },
  { tileX: 35, tileY: 24, type: "chair" },
  { tileX: 38, tileY: 19, type: "screen", glow: "#eab308" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // JURIDICO
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 42, tileY: 20, type: "desk" },
  { tileX: 45, tileY: 20, type: "desk" },
  { tileX: 42, tileY: 21, type: "chair" },
  { tileX: 45, tileY: 21, type: "chair" },
  { tileX: 42, tileY: 23, type: "bookshelf" },
  { tileX: 45, tileY: 23, type: "bookshelf" },
  { tileX: 48, tileY: 20, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SALA DA MISSAO - Telas com impacto e valores
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 3, tileY: 27, type: "mission_board", glow: "#f59e0b" },
  { tileX: 8, tileY: 27, type: "mission_board", glow: "#f59e0b" },
  { tileX: 13, tileY: 27, type: "dashboard_screen", glow: "#eab308" },
  { tileX: 3, tileY: 31, type: "sofa", glow: "#fbbf24" },
  { tileX: 6, tileY: 31, type: "sofa", glow: "#fbbf24" },
  { tileX: 10, tileY: 31, type: "sofa", glow: "#fbbf24" },
  { tileX: 13, tileY: 31, type: "sofa", glow: "#fbbf24" },
  { tileX: 8, tileY: 29, type: "podium", glow: "#eab308" },
  { tileX: 1, tileY: 27, type: "neon_sign", glow: "#fbbf24" },
  { tileX: 14, tileY: 34, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SALA DE REUNIOES
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 20, tileY: 28, type: "table_round" },
  { tileX: 18, tileY: 28, type: "chair" },
  { tileX: 22, tileY: 28, type: "chair" },
  { tileX: 20, tileY: 30, type: "chair" },
  { tileX: 20, tileY: 32, type: "chair" },
  { tileX: 24, tileY: 27, type: "screen", glow: "#eab308" },
  { tileX: 17, tileY: 34, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SALA DA LIDERANCA - Dashboards estrategicos, acesso restrito
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 28, tileY: 27, type: "dashboard_screen", glow: "#d97706" },
  { tileX: 32, tileY: 27, type: "dashboard_screen", glow: "#d97706" },
  { tileX: 36, tileY: 27, type: "dashboard_screen", glow: "#d97706" },
  { tileX: 28, tileY: 30, type: "desk" },
  { tileX: 32, tileY: 30, type: "desk" },
  { tileX: 36, tileY: 30, type: "desk" },
  { tileX: 28, tileY: 31, type: "gaming_chair" },
  { tileX: 32, tileY: 31, type: "gaming_chair" },
  { tileX: 36, tileY: 31, type: "gaming_chair" },
  { tileX: 30, tileY: 33, type: "sofa", glow: "#b45309" },
  { tileX: 34, tileY: 33, type: "sofa", glow: "#b45309" },
  { tileX: 27, tileY: 27, type: "plant" },
  { tileX: 38, tileY: 34, type: "plant" },
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // ESCRITORIO CEO - Sofisticado, dashboard exclusivo
  // ═══════════════════════════════════════════════════════════════════════════════════
  { tileX: 44, tileY: 27, type: "dashboard_screen", glow: "#92400e" },
  { tileX: 44, tileY: 30, type: "desk" },
  { tileX: 44, tileY: 31, type: "gaming_chair" },
  { tileX: 42, tileY: 33, type: "sofa", glow: "#92400e" },
  { tileX: 46, tileY: 33, type: "sofa", glow: "#92400e" },
  { tileX: 48, tileY: 27, type: "trophy", glow: "#eab308" },
  { tileX: 41, tileY: 27, type: "plant" },
  { tileX: 48, tileY: 34, type: "plant" },
  { tileX: 41, tileY: 34, type: "neon_sign", glow: "#eab308" },
]

// ── NPCs - Distribuidos pelo novo mapa ───────────────────────────────────────────────────
export const npcs: NPC[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════
  // CEO - Escritorio CEO
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "ceo1", name: "Roberto Almeida", initials: "RA", role: "CEO", department: "Diretoria", tileX: 45, tileY: 29, level: 20, xp: 15000, isManager: false, isCeo: true, avatarColor: "#EAB308", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Lideranca - Sala da Lideranca
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "lid_mgr", name: "Marina Santos", initials: "MS", role: "COO", department: "Diretoria", tileX: 30, tileY: 29, level: 18, xp: 12000, isManager: true, isCeo: false, avatarColor: "#EAB308", status: "online" },
  { id: "lid_cfo", name: "Eduardo Lima", initials: "EL", role: "CFO", department: "Diretoria", tileX: 34, tileY: 29, level: 17, xp: 11000, isManager: true, isCeo: false, avatarColor: "#EAB308", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Open Space - Tech
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "tec_mgr", name: "Carlos Mendes", initials: "CM", role: "Gestor de Tecnologia", department: "Tecnologia", tileX: 4, tileY: 12, level: 12, xp: 5600, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "tec1", name: "Ana Silva", initials: "AS", role: "Dev Frontend", department: "Tecnologia", tileX: 3, tileY: 10, level: 7, xp: 2340, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec2", name: "Pedro Santos", initials: "PS", role: "Dev Backend", department: "Tecnologia", tileX: 6, tileY: 10, level: 6, xp: 2100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec3", name: "Lucas Ferreira", initials: "LF", role: "DevOps", department: "Tecnologia", tileX: 9, tileY: 10, level: 5, xp: 1750, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "tec4", name: "Julia Oliveira", initials: "JO", role: "QA Engineer", department: "Tecnologia", tileX: 3, tileY: 14, level: 5, xp: 1620, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "tec5", name: "Marcos Ribeiro", initials: "MR", role: "UX Designer", department: "Tecnologia", tileX: 6, tileY: 14, level: 4, xp: 1200, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },
  { id: "tec6", name: "Camila Souza", initials: "CS", role: "Data Analyst", department: "Tecnologia", tileX: 9, tileY: 14, level: 4, xp: 1100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Open Space - Marketing
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "mkt_mgr", name: "Fernanda Lima", initials: "FL", role: "Gestora de Marketing", department: "Marketing", tileX: 15, tileY: 12, level: 10, xp: 4800, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "mkt1", name: "Carla Dias", initials: "CD", role: "Social Media", department: "Marketing", tileX: 15, tileY: 10, level: 6, xp: 2050, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "mkt2", name: "Thiago Moura", initials: "TM", role: "Content Writer", department: "Marketing", tileX: 18, tileY: 10, level: 5, xp: 1800, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "mkt3", name: "Beatriz Ramos", initials: "BR", role: "Designer Grafico", department: "Marketing", tileX: 18, tileY: 14, level: 5, xp: 1650, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Praca Central - Colaboradores transitando
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "praca1", name: "Leticia Costa", initials: "LC", role: "Analista", department: "Geral", tileX: 24, tileY: 12, level: 6, xp: 2000, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "praca2", name: "Matheus Oliveira", initials: "MO", role: "Estagiario", department: "Geral", tileX: 26, tileY: 14, level: 2, xp: 500, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Vendas
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "ven_mgr", name: "Ricardo Souza", initials: "RS", role: "Gestor de Vendas", department: "Vendas", tileX: 4, tileY: 22, level: 11, xp: 5200, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "ven1", name: "Diego Martins", initials: "DM", role: "Vendedor Senior", department: "Vendas", tileX: 3, tileY: 20, level: 8, xp: 3400, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "ven2", name: "Isabela Rocha", initials: "IR", role: "Vendedora", department: "Vendas", tileX: 6, tileY: 20, level: 6, xp: 2200, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "ven3", name: "Gabriel Lopes", initials: "GL", role: "Vendedor", department: "Vendas", tileX: 3, tileY: 23, level: 5, xp: 1900, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },
  { id: "ven4", name: "Larissa Neves", initials: "LN", role: "SDR", department: "Vendas", tileX: 6, tileY: 23, level: 4, xp: 1400, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RH
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "rh_mgr", name: "Patricia Nunes", initials: "PN", role: "Gestora de RH", department: "RH", tileX: 14, tileY: 22, level: 9, xp: 4200, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "rh1", name: "Amanda Vieira", initials: "AV", role: "Analista RH", department: "RH", tileX: 13, tileY: 20, level: 6, xp: 2100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "rh2", name: "Felipe Cardoso", initials: "FC", role: "Recrutador", department: "RH", tileX: 16, tileY: 20, level: 5, xp: 1700, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },
  { id: "rh3", name: "Renata Barros", initials: "RB", role: "T&D", department: "RH", tileX: 16, tileY: 23, level: 4, xp: 1350, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Financeiro
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "fin_mgr", name: "Bruno Costa", initials: "BC", role: "Gestor Financeiro", department: "Financeiro", tileX: 34, tileY: 22, level: 10, xp: 4600, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "fin1", name: "Daniela Pinto", initials: "DP", role: "Controller", department: "Financeiro", tileX: 33, tileY: 20, level: 7, xp: 2800, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "fin2", name: "Gustavo Alves", initials: "GA", role: "Analista Financeiro", department: "Financeiro", tileX: 36, tileY: 20, level: 5, xp: 1550, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "fin3", name: "Vanessa Lima", initials: "VL", role: "Tesoureira", department: "Financeiro", tileX: 36, tileY: 23, level: 4, xp: 1250, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "away" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Juridico
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "jur_mgr", name: "Helena Martins", initials: "HM", role: "Gestora Juridica", department: "Juridico", tileX: 44, tileY: 22, level: 9, xp: 4000, isManager: true, isCeo: false, avatarColor: "#8B5CF6", status: "online" },
  { id: "jur1", name: "Roberto Ferreira", initials: "RF", role: "Advogado", department: "Juridico", tileX: 43, tileY: 20, level: 6, xp: 2300, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "jur2", name: "Priscila Santos", initials: "PS", role: "Paralegal", department: "Juridico", tileX: 46, tileY: 20, level: 4, xp: 1400, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Lounge Social
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "lounge1", name: "Felipe Almeida", initials: "FA", role: "Dev Fullstack", department: "Tecnologia", tileX: 4, tileY: 3, level: 5, xp: 1800, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "lounge2", name: "Bianca Rocha", initials: "BR", role: "Designer", department: "Marketing", tileX: 11, tileY: 4, level: 4, xp: 1500, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Sala de Treinamento
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "train1", name: "Rodrigo Santos", initials: "RS", role: "Instrutor", department: "RH", tileX: 32, tileY: 3, level: 8, xp: 3200, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "train2", name: "Lucia Mendes", initials: "LM", role: "Treinadora", department: "RH", tileX: 36, tileY: 5, level: 7, xp: 2900, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "busy" },

  // ═══════════════════════════════════════════════════════════════════════════════════
  // Sala da Missao
  // ═══════════════════════════════════════════════════════════════════════════════════
  { id: "missao1", name: "Andre Costa", initials: "AC", role: "Culture Officer", department: "RH", tileX: 6, tileY: 29, level: 9, xp: 4100, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
  { id: "missao2", name: "Juliana Lima", initials: "JL", role: "Engagement Lead", department: "RH", tileX: 10, tileY: 29, level: 8, xp: 3500, isManager: false, isCeo: false, avatarColor: "#3B82F6", status: "online" },
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
