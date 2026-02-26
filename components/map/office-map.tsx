"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import {
  TILE, COLS, ROWS, MAP_W, MAP_H,
  rooms, npcs, furniture, isWall, getNpcNear,
  type NPC, type Room, type DeptPerformance,
} from "@/lib/map-data"

interface Props {
  playerName: string
  playerInitials: string
  playerRole: "colaborador" | "gestor" | "ceo"
  startTileX?: number
  startTileY?: number
  onNpcProximity?: (npc: NPC | null) => void
  onEnterChat?: (npc: NPC) => void
}

// ── Performance glow colors ──
const perfGlow: Record<DeptPerformance, string> = {
  green: "rgba(34,197,94,0.08)",
  yellow: "rgba(234,179,8,0.08)",
  red: "rgba(239,68,68,0.08)",
}
const perfBorder: Record<DeptPerformance, string> = {
  green: "rgba(34,197,94,0.4)",
  yellow: "rgba(234,179,8,0.4)",
  red: "rgba(239,68,68,0.4)",
}

// ── Speech bubble snippets per NPC ──
const speechSnippets: Record<string, string[]> = {
  "ceo1": ["Level up!", "Foco nos resultados!", "Excelente work!"],
  "lid_mgr": ["OKRs on track!", "Time alinhado!", "Go team!"],
  "lid_cfo": ["ROI positivo!", "Budget aprovado!", "Numeros fortes!"],
  "tec_mgr": ["Sprint indo bem!", "Revisem os PRs!", "Ship it!"],
  "tec1": ["Refactoring...", "Review please!", "Quase pronto!"],
  "tec2": ["Debugando...", "Fix commitada!", "API otimizada!"],
  "tec3": ["Deploy em 3..2..1", "Pipeline verde!", "CI/CD ok!"],
  "tec4": ["Testes passando!", "QA approved!", "Bug fixed!"],
  "tec5": ["Design ready!", "UX polished!", "Prototyping..."],
  "tec6": ["Data analyzed!", "Insights prontos!", "Dashboard up!"],
  "mkt_mgr": ["Meta em vista!", "Numeros otimos!", "Campanha top!"],
  "mkt1": ["Post agendado!", "Engajamento alto!", "Viral!"],
  "mkt2": ["Content ready!", "Blog publicado!", "SEO otimizado!"],
  "mkt3": ["Design pronto!", "Criativos ok!", "Brand on point!"],
  "ven_mgr": ["Foco total!", "Meta batavel!", "Vamos fechar!"],
  "ven1": ["Deal fechado!", "Cliente feliz!", "120k ARR!"],
  "ven2": ["Pipeline cheio!", "Demo agendada!", "Follow up ok!"],
  "rh_mgr": ["Pesquisa aberta!", "Clima melhorou!", "NPS subiu!"],
  "rh1": ["Feedback dado!", "1:1 marcado!", "PDI atualizado!"],
  "fin_mgr": ["Conciliacao ok!", "Budget aprovado!", "ROI positivo!"],
  "fin1": ["Relatorio pronto!", "Auditoria ok!", "Numeros batem!"],
  "jur_mgr": ["Contrato revisado!", "Compliance ok!", "Due diligence!"],
  "praca1": ["Networking!", "Cafe break!", "Level up!"],
  "praca2": ["Aprendendo muito!", "Time incrivel!", "Motivado!"],
  "lounge1": ["Pausa merecida!", "Cafe top!", "Recarregando..."],
  "lounge2": ["Ideias fluindo!", "Brainstorm!", "Criatividade!"],
  "train1": ["Aula comecando!", "Conteudo novo!", "Certificacao!"],
  "train2": ["Workshop hoje!", "Skills up!", "Treinamento ok!"],
  "missao1": ["Cultura forte!", "Valores!", "Proposito!"],
  "missao2": ["Engajamento 100%!", "Team spirit!", "Juntos!"],
}

export function OfficeMap({ playerName, playerInitials, playerRole, startTileX = 10, startTileY = 2, onNpcProximity, onEnterChat }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  const posRef = useRef({ x: startTileX, y: startTileY })
  const targetRef = useRef({ x: startTileX, y: startTileY })
  const keysRef = useRef<Set<string>>(new Set())
  const moveTimer = useRef(0)
  const camRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef({ w: 0, h: 0 })

  const [hoveredNpc, setHoveredNpc] = useState<NPC | null>(null)
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 })
  const [currentRoom, setCurrentRoom] = useState("")
  const nearNpcRef = useRef<NPC | null>(null)

  // Speech bubble state: which NPCs are currently "speaking"
  const bubbleState = useRef<Map<string, { text: string; until: number }>>(new Map())

  // ── Resize handler ──
  useEffect(() => {
    function handleResize() {
      const el = wrapRef.current
      const cvs = canvasRef.current
      if (!el || !cvs) return
      const w = el.clientWidth
      const h = el.clientHeight
      cvs.width = w
      cvs.height = h
      sizeRef.current = { w, h }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ── Speech bubble cycling ──
  useEffect(() => {
    function cycleBubbles() {
      const now = Date.now()
      const map = bubbleState.current

      // Remove expired
      for (const [k, v] of map) {
        if (now > v.until) map.delete(k)
      }

      // Add new random bubbles (2-4 NPCs at a time)
      const candidates = Object.keys(speechSnippets).filter((id) => !map.has(id))
      const count = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < Math.min(count, candidates.length); i++) {
        const idx = Math.floor(Math.random() * candidates.length)
        const npcId = candidates.splice(idx, 1)[0]
        const snippets = speechSnippets[npcId]
        const text = snippets[Math.floor(Math.random() * snippets.length)]
        map.set(npcId, { text, until: now + 3000 + Math.random() * 2000 })
      }
    }

    cycleBubbles()
    const interval = setInterval(cycleBubbles, 4000)
    return () => clearInterval(interval)
  }, [])

  // ── Key handlers ──
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) {
        e.preventDefault()
        keysRef.current.add(e.key)
      }
      if (e.key === "Enter" && nearNpcRef.current && onEnterChat) {
        e.preventDefault()
        onEnterChat(nearNpcRef.current)
      }
    }
    function up(e: KeyboardEvent) { keysRef.current.delete(e.key) }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  }, [onEnterChat])

  // ── Drawing helpers ──
  const drawFloor = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    // Dark futuristic base
    const baseFloor = dark ? "#0c0a09" : "#fefce8"
    ctx.fillStyle = baseFloor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    for (const room of rooms) {
      const rx = room.x * TILE - ox
      const ry = room.y * TILE - oy
      const rw = room.w * TILE
      const rh = room.h * TILE

      // Room base color with yellow theme
      ctx.fillStyle = dark ? room.darkColor : room.color
      ctx.fillRect(rx, ry, rw, rh)

      // Special glow for central plaza
      if (room.type === "central") {
        const centralGlow = 0.15 + Math.sin(time * 0.001) * 0.08
        ctx.fillStyle = `rgba(251, 191, 36, ${centralGlow})`
        ctx.fillRect(rx, ry, rw, rh)
      }

      // Performance indicators with subtle glow
      if (room.performance) {
        ctx.fillStyle = perfGlow[room.performance]
        ctx.fillRect(rx, ry, rw, rh)
        ctx.strokeStyle = perfBorder[room.performance]
        ctx.lineWidth = 2
        ctx.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4)
      }

      // Room borders - yellow/gold accent
      ctx.strokeStyle = dark ? "rgba(251, 191, 36, 0.3)" : "rgba(217, 119, 6, 0.4)"
      ctx.lineWidth = 2
      ctx.strokeRect(rx, ry, rw, rh)

      // Room label with background
      const labelPadding = 4
      ctx.font = "bold 11px 'Geist', sans-serif"
      const textWidth = ctx.measureText(room.label).width
      
      // Label background
      ctx.fillStyle = dark ? "rgba(12, 10, 9, 0.8)" : "rgba(254, 252, 232, 0.9)"
      roundRect(ctx, rx + rw / 2 - textWidth / 2 - labelPadding, ry + 6, textWidth + labelPadding * 2, 16, 4)
      ctx.fill()
      
      // Label border
      ctx.strokeStyle = "#fbbf24"
      ctx.lineWidth = 1
      roundRect(ctx, rx + rw / 2 - textWidth / 2 - labelPadding, ry + 6, textWidth + labelPadding * 2, 16, 4)
      ctx.stroke()
      
      // Label text
      ctx.fillStyle = dark ? "#fbbf24" : "#92400e"
      ctx.textAlign = "center"
      ctx.fillText(room.label, rx + rw / 2, ry + 18)
    }

    // Grid lines - subtle pixel art style
    ctx.strokeStyle = dark ? "rgba(251, 191, 36, 0.05)" : "rgba(217, 119, 6, 0.08)"
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * TILE - ox, -oy)
      ctx.lineTo(x * TILE - ox, MAP_H - oy)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(-ox, y * TILE - oy)
      ctx.lineTo(MAP_W - ox, y * TILE - oy)
      ctx.stroke()
    }

    // Walls - dark with yellow accent
    for (let ty = 0; ty < ROWS; ty++) {
      for (let tx = 0; tx < COLS; tx++) {
        if (isWall(tx, ty)) {
          ctx.fillStyle = dark ? "#1c1917" : "#292524"
          ctx.fillRect(tx * TILE - ox, ty * TILE - oy, TILE, TILE)
          // Yellow accent line on walls
          ctx.fillStyle = "#fbbf24"
          ctx.fillRect(tx * TILE - ox, ty * TILE - oy, TILE, 2)
        }
      }
    }
  }, [dark])

  const drawFurniture = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    for (const f of furniture) {
      const fx = f.tileX * TILE - ox + TILE / 2
      const fy = f.tileY * TILE - oy + TILE / 2
      
      // Glow effect for interactive furniture
      if (f.glow) {
        const glowIntensity = 0.3 + Math.sin(time * 0.003) * 0.15
        ctx.shadowColor = f.glow
        ctx.shadowBlur = 12 * glowIntensity
      }
      
      switch (f.type) {
        case "desk":
          ctx.fillStyle = dark ? "#1c1917" : "#fef3c7"
          ctx.fillRect(fx - 12, fy - 6, 24, 12)
          ctx.strokeStyle = dark ? "#fbbf24" : "#d97706"
          ctx.lineWidth = 1
          ctx.strokeRect(fx - 12, fy - 6, 24, 12)
          break
        case "chair":
          ctx.fillStyle = dark ? "#292524" : "#fef9c3"
          ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 1; ctx.stroke()
          break
        case "gaming_chair":
          ctx.fillStyle = dark ? "#1c1917" : "#1c1917"
          ctx.beginPath(); ctx.arc(fx, fy, 7, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2; ctx.stroke()
          ctx.fillStyle = "#fbbf24"
          ctx.beginPath(); ctx.arc(fx, fy - 2, 3, 0, Math.PI * 2); ctx.fill()
          break
        case "plant":
          ctx.fillStyle = dark ? "#166534" : "#22c55e"
          ctx.beginPath(); ctx.arc(fx, fy - 2, 7, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = dark ? "#1c1917" : "#fef3c7"
          ctx.fillRect(fx - 3, fy + 4, 6, 6)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 1
          ctx.strokeRect(fx - 3, fy + 4, 6, 6)
          break
        case "trophy":
          // Glowing trophy
          ctx.fillStyle = "#EAB308"
          ctx.beginPath()
          ctx.moveTo(fx, fy - 10); ctx.lineTo(fx + 8, fy - 2); ctx.lineTo(fx + 5, fy + 6)
          ctx.lineTo(fx - 5, fy + 6); ctx.lineTo(fx - 8, fy - 2); ctx.closePath(); ctx.fill()
          ctx.fillStyle = dark ? "#1c1917" : "#fef3c7"
          ctx.fillRect(fx - 4, fy + 6, 8, 5)
          // Star on trophy
          ctx.fillStyle = "#fff"
          drawStar(ctx, fx, fy - 4, 3, 5)
          break
        case "medal_display":
          ctx.fillStyle = dark ? "#1c1917" : "#fef9c3"
          ctx.fillRect(fx - 10, fy - 10, 20, 20)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2
          ctx.strokeRect(fx - 10, fy - 10, 20, 20)
          // Medal
          ctx.fillStyle = "#EAB308"
          ctx.beginPath(); ctx.arc(fx, fy - 2, 6, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = "#fff"
          drawStar(ctx, fx, fy - 2, 3, 5)
          // Ribbon
          ctx.fillStyle = "#dc2626"
          ctx.fillRect(fx - 2, fy - 10, 4, 5)
          break
        case "whiteboard":
          ctx.fillStyle = dark ? "#1c1917" : "#fefce8"
          ctx.fillRect(fx - 14, fy - 10, 28, 20)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2; ctx.strokeRect(fx - 14, fy - 10, 28, 20)
          // Content lines
          ctx.strokeStyle = dark ? "#fbbf24" : "#d97706"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(fx - 10, fy - 5); ctx.lineTo(fx + 10, fy - 5)
          ctx.moveTo(fx - 10, fy); ctx.lineTo(fx + 6, fy)
          ctx.moveTo(fx - 10, fy + 5); ctx.lineTo(fx + 8, fy + 5)
          ctx.stroke()
          break
        case "sofa":
          ctx.fillStyle = dark ? "#1c1917" : "#fef9c3"
          roundRect(ctx, fx - 14, fy - 6, 28, 12, 4); ctx.fill()
          ctx.strokeStyle = f.glow || "#fbbf24"
          ctx.lineWidth = 2
          roundRect(ctx, fx - 14, fy - 6, 28, 12, 4); ctx.stroke()
          // Cushion details
          ctx.fillStyle = f.glow || "#fbbf24"
          ctx.fillRect(fx - 12, fy - 4, 10, 8)
          ctx.fillRect(fx + 2, fy - 4, 10, 8)
          break
        case "podium":
          ctx.fillStyle = dark ? "#1c1917" : "#fef3c7"
          ctx.fillRect(fx - 8, fy - 12, 16, 24)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2
          ctx.strokeRect(fx - 8, fy - 12, 16, 24)
          // LevelCorp logo hint
          ctx.fillStyle = "#EAB308"
          ctx.beginPath(); ctx.arc(fx, fy - 4, 4, 0, Math.PI * 2); ctx.fill()
          break
        case "screen":
          ctx.fillStyle = dark ? "#0c0a09" : "#1c1917"
          ctx.fillRect(fx - 14, fy - 10, 28, 20)
          // Screen glow
          const screenGlow = 0.7 + Math.sin(time * 0.002) * 0.3
          ctx.fillStyle = `rgba(251, 191, 36, ${screenGlow * 0.8})`
          ctx.fillRect(fx - 12, fy - 8, 24, 16)
          // Screen content - chart
          ctx.fillStyle = "#22c55e"
          ctx.fillRect(fx - 8, fy + 2, 4, 4)
          ctx.fillRect(fx - 2, fy - 2, 4, 8)
          ctx.fillRect(fx + 4, fy - 4, 4, 10)
          break
        case "ranking_screen":
          // Large ranking display
          ctx.fillStyle = dark ? "#0c0a09" : "#1c1917"
          ctx.fillRect(fx - 18, fy - 12, 36, 28)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 3
          ctx.strokeRect(fx - 18, fy - 12, 36, 28)
          // Animated glow
          const rankGlow = 0.6 + Math.sin(time * 0.002) * 0.4
          ctx.fillStyle = `rgba(251, 191, 36, ${rankGlow})`
          ctx.fillRect(fx - 15, fy - 9, 30, 22)
          // Ranking bars
          ctx.fillStyle = "#EAB308"
          ctx.fillRect(fx - 12, fy - 5, 8, 3)
          ctx.fillStyle = "#d97706"
          ctx.fillRect(fx - 12, fy, 6, 3)
          ctx.fillStyle = "#b45309"
          ctx.fillRect(fx - 12, fy + 5, 4, 3)
          // Crown for #1
          ctx.fillStyle = "#EAB308"
          ctx.beginPath()
          ctx.moveTo(fx + 6, fy - 6); ctx.lineTo(fx + 8, fy - 3); ctx.lineTo(fx + 10, fy - 6)
          ctx.lineTo(fx + 12, fy - 3); ctx.lineTo(fx + 14, fy - 6); ctx.lineTo(fx + 14, fy - 1)
          ctx.lineTo(fx + 6, fy - 1); ctx.closePath(); ctx.fill()
          break
        case "logo_floor":
          // LevelCorp logo on floor
          const logoGlow = 0.4 + Math.sin(time * 0.001) * 0.2
          ctx.fillStyle = `rgba(251, 191, 36, ${logoGlow})`
          ctx.beginPath(); ctx.arc(fx, fy, 20, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = "#EAB308"
          ctx.lineWidth = 3
          ctx.beginPath(); ctx.arc(fx, fy, 20, 0, Math.PI * 2); ctx.stroke()
          // L shape in center
          ctx.fillStyle = dark ? "#1c1917" : "#0c0a09"
          ctx.font = "bold 16px 'Geist', sans-serif"
          ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText("L", fx, fy)
          break
        case "coffee_machine":
          ctx.fillStyle = dark ? "#1c1917" : "#292524"
          ctx.fillRect(fx - 8, fy - 10, 16, 20)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 1
          ctx.strokeRect(fx - 8, fy - 10, 16, 20)
          // Coffee indicator
          const coffeeGlow = 0.5 + Math.sin(time * 0.004) * 0.5
          ctx.fillStyle = `rgba(251, 191, 36, ${coffeeGlow})`
          ctx.beginPath(); ctx.arc(fx, fy - 4, 4, 0, Math.PI * 2); ctx.fill()
          // Cup
          ctx.fillStyle = "#fff"
          ctx.fillRect(fx - 3, fy + 4, 6, 5)
          break
        case "table_round":
          ctx.fillStyle = dark ? "#1c1917" : "#fef9c3"
          ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2; ctx.stroke()
          break
        case "bookshelf":
          ctx.fillStyle = dark ? "#1c1917" : "#fef3c7"
          ctx.fillRect(fx - 10, fy - 12, 20, 24)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 1
          ctx.strokeRect(fx - 10, fy - 12, 20, 24)
          // Books
          const bookColors = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b"]
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
              ctx.fillStyle = bookColors[(i + j) % bookColors.length]
              ctx.fillRect(fx - 8 + j * 4, fy - 10 + i * 8, 3, 6)
            }
          }
          break
        case "arcade":
          ctx.fillStyle = dark ? "#0c0a09" : "#1c1917"
          ctx.fillRect(fx - 10, fy - 12, 20, 24)
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 2
          ctx.strokeRect(fx - 10, fy - 12, 20, 24)
          // Screen
          const arcadeGlow = 0.6 + Math.sin(time * 0.005 + fx) * 0.4
          ctx.fillStyle = `rgba(251, 191, 36, ${arcadeGlow})`
          ctx.fillRect(fx - 7, fy - 9, 14, 10)
          // Joystick
          ctx.fillStyle = "#fbbf24"
          ctx.beginPath(); ctx.arc(fx - 3, fy + 6, 3, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = "#ef4444"
          ctx.beginPath(); ctx.arc(fx + 4, fy + 5, 2, 0, Math.PI * 2); ctx.fill()
          break
        case "neon_sign":
          // Neon sign effect
          const neonGlow = 0.5 + Math.sin(time * 0.003) * 0.5
          ctx.shadowColor = f.glow || "#fbbf24"
          ctx.shadowBlur = 15 * neonGlow
          ctx.fillStyle = f.glow || "#fbbf24"
          ctx.font = "bold 10px 'Geist', sans-serif"
          ctx.textAlign = "center"; ctx.textBaseline = "middle"
          ctx.fillText("LEVEL", fx, fy - 3)
          ctx.fillText("UP!", fx, fy + 6)
          ctx.shadowBlur = 0
          break
        case "mission_board":
          ctx.fillStyle = dark ? "#0c0a09" : "#1c1917"
          ctx.fillRect(fx - 16, fy - 12, 32, 24)
          ctx.strokeStyle = "#f59e0b"
          ctx.lineWidth = 2
          ctx.strokeRect(fx - 16, fy - 12, 32, 24)
          // Mission content
          const missionGlow = 0.7 + Math.sin(time * 0.002) * 0.3
          ctx.fillStyle = `rgba(245, 158, 11, ${missionGlow})`
          ctx.fillRect(fx - 13, fy - 9, 26, 18)
          // Target icon
          ctx.strokeStyle = "#1c1917"
          ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(fx, fy - 2, 6, 0, Math.PI * 2); ctx.stroke()
          ctx.beginPath(); ctx.arc(fx, fy - 2, 3, 0, Math.PI * 2); ctx.stroke()
          ctx.fillStyle = "#dc2626"
          ctx.beginPath(); ctx.arc(fx, fy - 2, 2, 0, Math.PI * 2); ctx.fill()
          break
        case "dashboard_screen":
          ctx.fillStyle = dark ? "#0c0a09" : "#1c1917"
          ctx.fillRect(fx - 16, fy - 12, 32, 24)
          ctx.strokeStyle = f.glow || "#d97706"
          ctx.lineWidth = 2
          ctx.strokeRect(fx - 16, fy - 12, 32, 24)
          // Dashboard content
          const dashGlow = 0.6 + Math.sin(time * 0.0025) * 0.4
          ctx.fillStyle = `rgba(217, 119, 6, ${dashGlow})`
          ctx.fillRect(fx - 13, fy - 9, 26, 18)
          // KPI bars
          ctx.fillStyle = "#22c55e"
          ctx.fillRect(fx - 10, fy + 2, 6, 4)
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(fx - 2, fy, 6, 6)
          ctx.fillStyle = "#EAB308"
          ctx.fillRect(fx + 6, fy - 3, 6, 9)
          // Percentage
          ctx.fillStyle = "#1c1917"
          ctx.font = "bold 8px 'Geist', sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("+87%", fx, fy - 5)
          break
      }
      
      // Reset shadow
      ctx.shadowBlur = 0
    }
  }, [dark])

  const drawNpcs = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    for (const npc of npcs) {
      const nx = npc.tileX * TILE - ox + TILE / 2
      const ny = npc.tileY * TILE - oy + TILE / 2

      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.beginPath(); ctx.ellipse(nx, ny + 12, 10, 4, 0, 0, Math.PI * 2); ctx.fill()

      const bob = Math.sin(time * 0.003 + npc.tileX) * 1.5

      ctx.fillStyle = npc.avatarColor
      ctx.beginPath(); ctx.arc(nx, ny - 2 + bob, 12, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1.5; ctx.stroke()

      ctx.fillStyle = "#fff"
      ctx.font = "bold 9px 'Geist', sans-serif"
      ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(npc.initials, nx, ny - 1 + bob)

      if (npc.isCeo) {
        ctx.fillStyle = "#EAB308"
        ctx.beginPath()
        ctx.moveTo(nx - 6, ny - 16 + bob); ctx.lineTo(nx - 4, ny - 12 + bob)
        ctx.lineTo(nx, ny - 15 + bob); ctx.lineTo(nx + 4, ny - 12 + bob)
        ctx.lineTo(nx + 6, ny - 16 + bob); ctx.lineTo(nx + 7, ny - 10 + bob)
        ctx.lineTo(nx - 7, ny - 10 + bob); ctx.closePath(); ctx.fill()
      } else if (npc.isManager) {
        ctx.fillStyle = "#a78bfa"
        drawStar(ctx, nx + 9, ny - 10 + bob, 4, 5)
      }

      const statusColors: Record<string, string> = { online: "#22c55e", busy: "#ef4444", away: "#eab308" }
      ctx.fillStyle = statusColors[npc.status] ?? "#22c55e"
      ctx.beginPath(); ctx.arc(nx + 10, ny + 5 + bob, 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dark ? "#1e293b" : "#fff"
      ctx.lineWidth = 1.5; ctx.stroke()

      // ── Speech bubbles ──
      const bubble = bubbleState.current.get(npc.id)
      if (bubble) {
        const bx = nx
        const by = ny - 28 + bob

        ctx.font = "10px 'Geist', sans-serif"
        const textWidth = ctx.measureText(bubble.text).width
        const padX = 8
        const padY = 5
        const bw = textWidth + padX * 2
        const bh = 16 + padY

        // Bubble background
        ctx.fillStyle = dark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)"
        ctx.strokeStyle = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
        ctx.lineWidth = 1
        roundRect(ctx, bx - bw / 2, by - bh, bw, bh, 8)
        ctx.fill(); ctx.stroke()

        // Tail triangle
        ctx.fillStyle = dark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)"
        ctx.beginPath()
        ctx.moveTo(bx - 4, by); ctx.lineTo(bx + 4, by); ctx.lineTo(bx, by + 5)
        ctx.closePath(); ctx.fill()

        // Text
        ctx.fillStyle = dark ? "#e2e8f0" : "#1e293b"
        ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillText(bubble.text, bx, by - bh / 2)
      }
    }
  }, [dark])

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    const pos = posRef.current
    const px = pos.x * TILE - ox + TILE / 2
    const py = pos.y * TILE - oy + TILE / 2
    const bob = Math.sin(time * 0.004) * 1

    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.beginPath(); ctx.ellipse(px, py + 13, 11, 5, 0, 0, Math.PI * 2); ctx.fill()

    ctx.strokeStyle = "#EAB308"
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(px, py - 2 + bob, 15, 0, Math.PI * 2); ctx.stroke()

    const playerColor = playerRole === "ceo" ? "#EAB308" : playerRole === "gestor" ? "#8B5CF6" : "#3B82F6"
    ctx.fillStyle = playerColor
    ctx.beginPath(); ctx.arc(px, py - 2 + bob, 13, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke()

    ctx.fillStyle = "#fff"
    ctx.font = "bold 10px 'Geist', sans-serif"
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(playerInitials, px, py - 1 + bob)

    ctx.fillStyle = dark ? "#e2e8f0" : "#1e293b"
    ctx.font = "bold 10px 'Geist', sans-serif"
    ctx.fillText(playerName.split(" ")[0], px, py - 22 + bob)
  }, [dark, playerInitials, playerName, playerRole])

  const drawMinimap = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    const mw = 180
    const mh = (ROWS / COLS) * mw
    const mx = cw - mw - 12
    const my = ch - mh - 12
    const sx = mw / COLS
    const sy = mh / ROWS

    // Minimap background - dark with yellow border
    ctx.fillStyle = dark ? "rgba(12, 10, 9, 0.92)" : "rgba(254, 252, 232, 0.92)"
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 2
    roundRect(ctx, mx - 6, my - 6, mw + 12, mh + 12, 8)
    ctx.fill(); ctx.stroke()

    // Rooms
    for (const room of rooms) {
      ctx.fillStyle = dark ? room.darkColor : room.color
      ctx.fillRect(mx + room.x * sx, my + room.y * sy, room.w * sx, room.h * sy)
      
      // Highlight central plaza
      if (room.type === "central") {
        ctx.fillStyle = "rgba(251, 191, 36, 0.4)"
        ctx.fillRect(mx + room.x * sx, my + room.y * sy, room.w * sx, room.h * sy)
      }
      
      ctx.strokeStyle = dark ? "rgba(251, 191, 36, 0.3)" : "rgba(217, 119, 6, 0.3)"
      ctx.lineWidth = 0.5
      ctx.strokeRect(mx + room.x * sx, my + room.y * sy, room.w * sx, room.h * sy)
    }

    // NPCs on minimap
    for (const npc of npcs) {
      ctx.fillStyle = npc.isCeo ? "#EAB308" : npc.isManager ? "#8B5CF6" : "#3B82F6"
      ctx.beginPath(); ctx.arc(mx + npc.tileX * sx, my + npc.tileY * sy, 1.5, 0, Math.PI * 2); ctx.fill()
    }

    // Player position with glow
    const pos = posRef.current
    ctx.shadowColor = "#EAB308"
    ctx.shadowBlur = 8
    ctx.fillStyle = "#EAB308"
    ctx.beginPath(); ctx.arc(mx + pos.x * sx, my + pos.y * sy, 3, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke()

    // Camera viewport
    const cam = camRef.current
    const sz = sizeRef.current
    ctx.strokeStyle = "rgba(251, 191, 36, 0.7)"
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 2])
    ctx.strokeRect(mx + (cam.x / TILE) * sx, my + (cam.y / TILE) * sy, (sz.w / TILE) * sx, (sz.h / TILE) * sy)
    ctx.setLineDash([])
  }, [dark])

  // ── Game loop ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId = 0

    function loop(time: number) {
      const ctx = canvas!.getContext("2d")
      if (!ctx) return
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { animId = requestAnimationFrame(loop); return }

      const keys = keysRef.current
      const now = performance.now()
      if (now - moveTimer.current > 120) {
        moveTimer.current = now
        let dx = 0, dy = 0
        if (keys.has("ArrowLeft") || keys.has("a")) dx = -1
        if (keys.has("ArrowRight") || keys.has("d")) dx = 1
        if (keys.has("ArrowUp") || keys.has("w")) dy = -1
        if (keys.has("ArrowDown") || keys.has("s")) dy = 1
        if (dx !== 0 || dy !== 0) {
          const nx = targetRef.current.x + dx
          const ny = targetRef.current.y + dy
          if (!isWall(nx, ny)) targetRef.current = { x: nx, y: ny }
        }
      }

      const pos = posRef.current
      const tgt = targetRef.current
      pos.x += (tgt.x - pos.x) * 0.25
      pos.y += (tgt.y - pos.y) * 0.25

      const cam = camRef.current
      const targetCamX = pos.x * TILE - w / 2 + TILE / 2
      const targetCamY = pos.y * TILE - h / 2 + TILE / 2
      cam.x += (targetCamX - cam.x) * 0.1
      cam.y += (targetCamY - cam.y) * 0.1
      cam.x = Math.max(0, Math.min(MAP_W - w, cam.x))
      cam.y = Math.max(0, Math.min(MAP_H - h, cam.y))

      const near = getNpcNear(tgt.x, tgt.y, 2)
      nearNpcRef.current = near
      if (near) {
        setHoveredNpc(near)
        setPopupPos({
          x: near.tileX * TILE - cam.x + TILE / 2,
          y: near.tileY * TILE - cam.y - 30,
        })
        onNpcProximity?.(near)
      } else {
        setHoveredNpc(null)
        onNpcProximity?.(null)
      }

      const roomsAtPlayer = rooms.find(
        r => tgt.x >= r.x && tgt.x < r.x + r.w && tgt.y >= r.y && tgt.y < r.y + r.h
      )
      setCurrentRoom(roomsAtPlayer?.label ?? "")

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      drawFloor(ctx, cam.x, cam.y, time)
      drawFurniture(ctx, cam.x, cam.y, time)
      drawNpcs(ctx, cam.x, cam.y, time)
      drawPlayer(ctx, cam.x, cam.y, time)
      ctx.restore()
      drawMinimap(ctx, w, h)

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [drawFloor, drawFurniture, drawNpcs, drawPlayer, drawMinimap, onNpcProximity])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-background" tabIndex={0}>
      <canvas ref={canvasRef} className="block h-full w-full" />

      {hoveredNpc && (
        <div
          className="pointer-events-none absolute z-30 min-w-[220px] rounded-lg border border-border bg-card p-3 shadow-xl"
          style={{ left: popupPos.x, top: popupPos.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: hoveredNpc.avatarColor }}
            >
              {hoveredNpc.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{hoveredNpc.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredNpc.role}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{hoveredNpc.department}</span>
            <span className="font-semibold text-primary">Lv.{hoveredNpc.level}</span>
            <span>{hoveredNpc.xp.toLocaleString()} XP</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: hoveredNpc.status === "online" ? "#22c55e" : hoveredNpc.status === "busy" ? "#ef4444" : "#eab308" }}
            />
            <span className="capitalize text-muted-foreground">{hoveredNpc.status}</span>
          </div>
          <div className="mt-2 rounded-md bg-primary/10 px-2 py-1 text-center text-[10px] font-medium text-primary">
            Pressione Enter para conversar
          </div>
        </div>
      )}

      {currentRoom && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm">
          {currentRoom}
        </div>
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.4
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath(); ctx.fill()
}
