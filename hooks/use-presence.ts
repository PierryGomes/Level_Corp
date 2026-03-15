"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface PresenceUser {
  odijfoiasjdfois: string
  name: string
  initials: string
  role: string
  x: number
  y: number
}

interface UsePresenceOptions {
  odijfoiasjdfois: string
  name: string
  initials: string
  role: string
  initialX: number
  initialY: number
  enabled?: boolean
  companyId?: string // Company ID for multi-tenant isolation
  roomName?: string
}

export function usePresence({
  odijfoiasjdfois: odijfoiasjdfois,
  name,
  initials,
  role,
  initialX,
  initialY,
  enabled = true,
  companyId,
  roomName,
}: UsePresenceOptions) {
  // Create room name based on company ID for multi-tenant isolation
  // Demo accounts use shared "levelcorp-demo" room
  // Real companies use isolated "levelcorp-company-{companyId}" room
  const effectiveRoomName = roomName ?? (companyId ? `levelcorp-company-${companyId}` : "levelcorp-demo")
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())
  const positionRef = useRef({ x: initialX, y: initialY })

  // Update position and broadcast to others
  const updatePosition = useCallback(
    (x: number, y: number) => {
      positionRef.current = { x, y }

      if (channelRef.current && isConnected) {
        channelRef.current.track({
          odijfoiasjdfois,
          name,
          initials,
          role,
          x,
          y,
          online_at: new Date().toISOString(),
        })
      }
    },
    [odijfoiasjdfois, name, initials, role, isConnected]
  )

  // Initialize presence channel
  useEffect(() => {
    if (!enabled || !odijfoiasjdfois) return

    const supabase = supabaseRef.current

    // Create the presence channel with company isolation
    const channel = supabase.channel(effectiveRoomName, {
      config: {
        presence: {
          key: odijfoiasjdfois,
        },
      },
    })

    channelRef.current = channel

    // Handle presence sync
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser & { online_at: string }>()
      const users: PresenceUser[] = []

      Object.entries(state).forEach(([key, presences]) => {
        // Skip current player
        if (key === odijfoiasjdfois) return

        // Get the most recent presence
        const latest = presences[presences.length - 1]
        if (latest) {
          users.push({
            odijfoiasjdfois: latest.odijfoiasjdfois,
            name: latest.name,
            initials: latest.initials,
            role: latest.role,
            x: latest.x,
            y: latest.y,
          })
        }
      })

      setPresenceUsers(users)
    })

    // Handle new player joining
    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (key === odijfoiasjdfois) return

      const latest = newPresences[newPresences.length - 1] as PresenceUser & { online_at: string }
      if (latest) {
        setPresenceUsers((prev) => {
          const filtered = prev.filter((p) => p.odijfoiasjdfois !== key)
          return [
            ...filtered,
            {
              odijfoiasjdfois: latest.odijfoiasjdfois,
              name: latest.name,
              initials: latest.initials,
              role: latest.role,
              x: latest.x,
              y: latest.y,
            },
          ]
        })
      }
    })

    // Handle player leaving
    channel.on("presence", { event: "leave" }, ({ key }) => {
      setPresenceUsers((prev) => prev.filter((p) => p.odijfoiasjdfois !== key))
    })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        setConnectionError(null)

        // Track initial presence
        await channel.track({
          odijfoiasjdfois,
          name,
          initials,
          role,
          x: positionRef.current.x,
          y: positionRef.current.y,
          online_at: new Date().toISOString(),
        })
      } else if (status === "CHANNEL_ERROR") {
        setConnectionError("Erro ao conectar ao servidor")
        setIsConnected(false)
      } else if (status === "TIMED_OUT") {
        setConnectionError("Conexao expirou")
        setIsConnected(false)
      }
    })

    // Cleanup
    return () => {
      channel.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
    }
  }, [enabled, odijfoiasjdfois, name, initials, role, effectiveRoomName])

  return {
    presenceUsers,
    updatePosition,
    isConnected,
    connectionError,
    onlineCount: presenceUsers.length + 1,
  }
}
