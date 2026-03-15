"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

const avatarColors = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#22C55E" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Ciano", value: "#06B6D4" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Amarelo", value: "#EAB308" },
]

const avatarStyles = [
  { name: "Círculo", value: "circle" },
  { name: "Quadrado", value: "square" },
  { name: "Hexágono", value: "hexagon" },
]

interface PendingUser {
  id: string
  fullName: string
  email: string
  company: string
  department: string
}

export default function AvatarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<PendingUser | null>(null)

  const [selectedColor, setSelectedColor] = useState(avatarColors[0].value)
  const [selectedStyle, setSelectedStyle] = useState(avatarStyles[0].value)
  const [initials, setInitials] = useState("")

  useEffect(() => {
    const pendingUser = localStorage.getItem("levelcorp_pending_user")
    if (!pendingUser) {
      router.push("/registro")
      return
    }

    try {
      const userData = JSON.parse(pendingUser) as PendingUser
      setUser(userData)

      // Generate initials from name
      const names = userData.fullName.split(" ")
      const generatedInitials =
        names.length >= 2
          ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          : userData.fullName.substring(0, 2).toUpperCase()
      setInitials(generatedInitials)

      setIsLoading(false)
    } catch {
      router.push("/registro")
    }
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const response = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          avatarColor: selectedColor,
          avatarStyle: selectedStyle,
          initials,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save avatar")
      }

      // Clear pending user and store full user data
      localStorage.removeItem("levelcorp_pending_user")
      localStorage.setItem(
        "levelcorp_user",
        JSON.stringify({
          id: user.id,
          name: user.fullName,
          email: user.email,
          company: user.company,
          department: user.department,
          avatar: initials,
          avatarColor: selectedColor,
          avatarStyle: selectedStyle,
          role: "colaborador",
          xp: 0,
          level: 1,
        })
      )

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving avatar:", error)
      setIsSaving(false)
    }
  }

  const renderAvatar = (size: number, color: string, style: string) => {
    const shapeClasses = {
      circle: "rounded-full",
      square: "rounded-2xl",
      hexagon: "rounded-2xl",
    }

    return (
      <div
        className={`flex items-center justify-center ${shapeClasses[style as keyof typeof shapeClasses]}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          clipPath: style === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined,
        }}
      >
        <span
          className="font-bold text-white"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Preview */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 lg:flex">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Preview do Avatar</h2>
          <p className="mt-2 text-muted-foreground">
            Assim você aparecerá no escritório virtual
          </p>
        </div>

        {/* Large avatar preview */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />
          <div className="relative">
            {renderAvatar(160, selectedColor, selectedStyle)}
          </div>
        </div>

        {/* Name card preview */}
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 shadow-lg">
          <div className="flex items-center gap-4">
            {renderAvatar(48, selectedColor, selectedStyle)}
            <div>
              <p className="font-semibold text-foreground">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.department}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Nível 1</span>
            </div>
            <span className="text-xs text-muted-foreground">0 XP</span>
          </div>
        </div>

        {/* Map preview */}
        <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            No mapa do escritório
          </p>
          <div className="flex items-end justify-center gap-8">
            {/* Other avatars for context */}
            <div className="opacity-50">
              {renderAvatar(32, "#8B5CF6", "circle")}
            </div>
            <div className="flex flex-col items-center">
              {renderAvatar(40, selectedColor, selectedStyle)}
              <span className="mt-2 text-xs font-medium text-foreground">
                {user?.fullName.split(" ")[0]}
              </span>
            </div>
            <div className="opacity-50">
              {renderAvatar(32, "#22C55E", "circle")}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Customization */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">LevelCorp</span>
          </div>

          {/* Mobile avatar preview */}
          <div className="mb-8 flex justify-center lg:hidden">
            {renderAvatar(100, selectedColor, selectedStyle)}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Crie seu avatar</h1>
            <p className="mt-2 text-muted-foreground">
              Personalize como você aparecerá no escritório virtual
            </p>
          </div>

          <div className="space-y-8">
            {/* Initials */}
            <div className="space-y-3">
              <Label className="text-foreground">Iniciais do avatar</Label>
              <Input
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="text-center text-xl font-bold uppercase tracking-widest"
                placeholder="JS"
              />
              <p className="text-xs text-muted-foreground">
                Até 2 caracteres que aparecerão no seu avatar
              </p>
            </div>

            {/* Color selection */}
            <div className="space-y-3">
              <Label className="text-foreground">Cor do avatar</Label>
              <div className="grid grid-cols-4 gap-3">
                {avatarColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative flex h-12 w-full items-center justify-center rounded-xl transition-all ${
                      selectedColor === color.value
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && (
                      <div className="h-3 w-3 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Style selection */}
            <div className="space-y-3">
              <Label className="text-foreground">Formato do avatar</Label>
              <div className="grid grid-cols-3 gap-3">
                {avatarStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setSelectedStyle(style.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      selectedStyle === style.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {renderAvatar(40, selectedColor, style.value)}
                    <span className="text-xs font-medium text-foreground">
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/registro")}
                disabled={isSaving}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !initials}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
