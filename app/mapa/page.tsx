"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { type MockUser } from "@/lib/mock-data"
import { type NPC } from "@/lib/map-data"
import { OfficeMap, type RemotePlayer } from "@/components/map/office-map"
import { MapHud } from "@/components/map/map-hud"
import { ProximityChat } from "@/components/chat/proximity-chat"
import { usePresence, type PresenceUser } from "@/hooks/use-presence"

// Map role to color
const roleColors: Record<string, string> = {
  ceo: "#EAB308",
  gestor: "#8B5CF6",
  colaborador: "#3B82F6",
}

export default function MapaPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)
  const [chatNpc, setChatNpc] = useState<NPC | null>(null)
  const [nearNpc, setNearNpc] = useState<NPC | null>(null)

  // Spawn positions based on role
  const spawnPositions: Record<string, { x: number; y: number }> = useMemo(() => ({
    ceo: { x: 32, y: 23 },
    gestor: { x: 10, y: 6 },
    colaborador: { x: 10, y: 2 },
  }), [])

  const spawn = user ? (spawnPositions[user.role] ?? spawnPositions.colaborador) : spawnPositions.colaborador

  // Use presence hook for multiplayer
  const { presenceUsers, updatePosition, isConnected, connectionError } = usePresence({
    odijfoiasjdfois: user?.id ?? "",
    name: user?.name ?? "",
    initials: user?.avatar ?? "",
    role: user?.role ?? "colaborador",
    initialX: spawn.x,
    initialY: spawn.y,
    enabled: !!user,
  })

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

  // Convert presence users to remote players format
  const remotePlayers: RemotePlayer[] = useMemo(() => {
    return presenceUsers.map((p: PresenceUser) => ({
      odijfoiasjdfois: p.odijfoiasjdfois,
      name: p.name,
      initials: p.initials,
      role: p.role as "colaborador" | "gestor" | "ceo",
      x: p.x,
      y: p.y,
      color: roleColors[p.role] ?? "#3B82F6",
    }))
  }, [presenceUsers])

  const handleNpcProximity = useCallback((npc: NPC | null) => {
    setNearNpc(npc)
    // Auto-close chat if player walks away from the NPC being chatted with
    if (!npc && chatNpc) {
      // Keep chat open even if player moves slightly, only close if they leave radius
    }
  }, [chatNpc])

  const handleEnterChat = useCallback((npc: NPC) => {
    setChatNpc(npc)
  }, [])

  const handleCloseChat = useCallback(() => {
    setChatNpc(null)
  }, [])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapHud userName={user.name} userRole={user.role} />
      
      {/* Connection status indicator */}
      <div className="absolute right-4 top-16 z-30 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : connectionError ? "bg-red-500" : "bg-yellow-500"
          }`}
        />
        <span className="text-muted-foreground">
          {isConnected 
            ? `${remotePlayers.length + 1} online` 
            : connectionError 
              ? "Desconectado" 
              : "Conectando..."}
        </span>
      </div>

      <div className="h-full w-full pt-14">
        <OfficeMap
          playerName={user.name}
          playerInitials={user.avatar}
          playerRole={user.role}
          startTileX={spawn.x}
          startTileY={spawn.y}
          onNpcProximity={handleNpcProximity}
          onEnterChat={handleEnterChat}
          remotePlayers={remotePlayers}
          onPositionChange={updatePosition}
        />
      </div>

      {/* Proximity hint (when near NPC but chat not open) */}
      {nearNpc && !chatNpc && (
        <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 rounded-full border border-primary/30 bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm animate-in fade-in duration-200">
          <span className="text-primary">{nearNpc.name}</span> esta perto &mdash; pressione <kbd className="mx-1 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">Enter</kbd> para conversar
        </div>
      )}

      {/* Proximity chat panel */}
      {chatNpc && (
        <ProximityChat npc={chatNpc} onClose={handleCloseChat} />
      )}
    </div>
  )
}
