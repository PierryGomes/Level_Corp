"use client"

import { useState, useEffect, useCallback, useRef } from "react"

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
  companyId?: string
  roomName?: string
}

// Local storage based presence (mock multiplayer for demo)
export function usePresence({
  odijfoiasjdfois,
  name,
  initials,
  role,
  initialX,
  initialY,
  enabled = true,
  companyId,
}: UsePresenceOptions) {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const positionRef = useRef({ x: initialX, y: initialY })
  const roomKey = companyId ? `levelcorp-presence-${companyId}` : "levelcorp-presence-demo"

  // Update position
  const updatePosition = useCallback((x: number, y: number) => {
    positionRef.current = { x, y }
    
    if (!enabled || !odijfoiasjdfois) return

    // Update local storage with current user position
    try {
      const stored = localStorage.getItem(roomKey)
      const users: Record<string, PresenceUser & { lastSeen: number }> = stored ? JSON.parse(stored) : {}
      
      users[odijfoiasjdfois] = {
        odijfoiasjdfois,
        name,
        initials,
        role,
        x,
        y,
        lastSeen: Date.now(),
      }
      
      localStorage.setItem(roomKey, JSON.stringify(users))
    } catch (e) {
      console.error("Error updating presence:", e)
    }
  }, [enabled, odijfoiasjdfois, name, initials, role, roomKey])

  // Initialize and sync presence
  useEffect(() => {
    if (!enabled || !odijfoiasjdfois) return

    setIsConnected(true)
    setConnectionError(null)

    // Register current user
    updatePosition(initialX, initialY)

    // Poll for other users
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(roomKey)
        if (!stored) return

        const users: Record<string, PresenceUser & { lastSeen: number }> = JSON.parse(stored)
        const now = Date.now()
        const activeUsers: PresenceUser[] = []

        // Filter out stale users (not seen in last 10 seconds) and current user
        for (const [odijfoiasjdfoisKey, user] of Object.entries(users)) {
          if (now - user.lastSeen > 10000) {
            delete users[odijfoiasjdfoisKey]
          } else if (odijfoiasjdfoisKey !== odijfoiasjdfois) {
            activeUsers.push({
              odijfoiasjdfois: user.odijfoiasjdfois,
              name: user.name,
              initials: user.initials,
              role: user.role,
              x: user.x,
              y: user.y,
            })
          }
        }

        localStorage.setItem(roomKey, JSON.stringify(users))
        setPresenceUsers(activeUsers)
      } catch (e) {
        console.error("Error syncing presence:", e)
      }
    }, 500)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      
      // Remove current user from presence
      try {
        const stored = localStorage.getItem(roomKey)
        if (stored) {
          const users = JSON.parse(stored)
          delete users[odijfoiasjdfois]
          localStorage.setItem(roomKey, JSON.stringify(users))
        }
      } catch (e) {
        console.error("Error cleaning up presence:", e)
      }
      
      setIsConnected(false)
    }
  }, [enabled, odijfoiasjdfois, initialX, initialY, roomKey, updatePosition])

  return {
    presenceUsers,
    updatePosition,
    isConnected,
    connectionError,
    onlineCount: presenceUsers.length + 1,
  }
}
