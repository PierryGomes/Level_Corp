"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Users,
  FolderTree,
  Mail,
  Settings,
  LogOut,
  Plus,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Search,
  Crown,
  Star,
  User,
  Loader2,
  TrendingUp,
  Copy,
  Check,
  AlertCircle,
  MapPin,
} from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  companyId: string
  companyName: string
  companySlug: string
}

interface CompanyUser {
  id: string
  full_name: string
  email: string
  role: string
  avatar_color: string
  is_active: boolean
  created_at: string
  departments: { id: string; name: string } | null
}

interface Department {
  id: string
  name: string
  description: string
  userCount: number
  created_at: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  departments: { id: string; name: string } | null
}

interface Stats {
  totalUsers: number
  activeUsers: number
  departments: number
  pendingInvitations: number
  roleBreakdown: { ceo: number; gestor: number; colaborador: number }
  recentJoins: number
}

const navItems = [
  { id: "overview", label: "Visão Geral", icon: Building2 },
  { id: "users", label: "Usuários", icon: Users },
  { id: "departments", label: "Departamentos", icon: FolderTree },
  { id: "invites", label: "Convites", icon: Mail },
  { id: "settings", label: "Configurações", icon: Settings },
]

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  
  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: "", role: "colaborador", departmentId: "" })
  const [departmentForm, setDepartmentForm] = useState({ name: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    try {
      const userData = JSON.parse(stored)
      if (!userData.companyId) {
        router.push("/criar-workspace")
        return
      }
      if (userData.role !== "ceo" && userData.role !== "gestor") {
        router.push("/dashboard")
        return
      }
      setUser(userData)
    } catch {
      router.push("/login")
    }
  }, [router])

  // Fetch data
  const fetchStats = useCallback(async () => {
    if (!user?.companyId) return
    try {
      const res = await fetch(`/api/admin/stats?companyId=${user.companyId}`)
      const data = await res.json()
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }, [user?.companyId])

  const fetchUsers = useCallback(async () => {
    if (!user?.companyId) return
    try {
      const res = await fetch(`/api/admin/users?companyId=${user.companyId}`)
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }, [user?.companyId])

  const fetchDepartments = useCallback(async () => {
    if (!user?.companyId) return
    try {
      const res = await fetch(`/api/admin/departments?companyId=${user.companyId}`)
      const data = await res.json()
      if (data.departments) setDepartments(data.departments)
    } catch (err) {
      console.error("Error fetching departments:", err)
    }
  }, [user?.companyId])

  const fetchInvitations = useCallback(async () => {
    if (!user?.companyId) return
    try {
      const res = await fetch(`/api/admin/invitations?companyId=${user.companyId}`)
      const data = await res.json()
      if (data.invitations) setInvitations(data.invitations)
    } catch (err) {
      console.error("Error fetching invitations:", err)
    }
  }, [user?.companyId])

  useEffect(() => {
    if (user?.companyId) {
      setIsLoading(true)
      Promise.all([fetchStats(), fetchUsers(), fetchDepartments(), fetchInvitations()])
        .finally(() => setIsLoading(false))
    }
  }, [user?.companyId, fetchStats, fetchUsers, fetchDepartments, fetchInvitations])

  // Handle invite
  const handleSendInvite = async () => {
    if (!inviteForm.email || !user?.companyId) {
      setError("Email é obrigatório")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          departmentId: inviteForm.departmentId || null,
          companyId: user.companyId,
          invitedBy: user.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setShowInviteModal(false)
      setInviteForm({ email: "", role: "colaborador", departmentId: "" })
      fetchInvitations()
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar convite")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle department creation
  const handleCreateDepartment = async () => {
    if (!departmentForm.name || !user?.companyId) {
      setError("Nome é obrigatório")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: departmentForm.name,
          description: departmentForm.description,
          companyId: user.companyId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setShowDepartmentModal(false)
      setDepartmentForm({ name: "", description: "" })
      fetchDepartments()
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar departamento")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy invite link
  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedLink(token)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!user?.companyId || !confirm("Tem certeza que deseja remover este usuário?")) return

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}&companyId=${user.companyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchUsers()
      fetchStats()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover usuário")
    }
  }

  // Delete department
  const handleDeleteDepartment = async (departmentId: string) => {
    if (!user?.companyId || !confirm("Tem certeza que deseja remover este departamento?")) return

    try {
      const res = await fetch(`/api/admin/departments?departmentId=${departmentId}&companyId=${user.companyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchDepartments()
      fetchStats()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover departamento")
    }
  }

  // Cancel invitation
  const handleCancelInvite = async (invitationId: string) => {
    if (!user?.companyId || !confirm("Tem certeza que deseja cancelar este convite?")) return

    try {
      const res = await fetch(`/api/admin/invitations?invitationId=${invitationId}&companyId=${user.companyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchInvitations()
      fetchStats()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao cancelar convite")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("levelcorp_user")
    router.push("/login")
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ceo": return <Crown className="h-4 w-4 text-yellow-500" />
      case "gestor": return <Star className="h-4 w-4 text-purple-500" />
      default: return <User className="h-4 w-4 text-primary" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ceo": return "CEO"
      case "gestor": return "Gestor"
      default: return "Colaborador"
    }
  }

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Image
            src="/images/logo-levelcorp.jpeg"
            alt="LevelCorp"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">LevelCorp</span>
            <span className="text-xs text-muted-foreground">{user.companyName}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick actions */}
        <div className="border-t border-border p-4">
          <Link href="/mapa">
            <Button variant="outline" className="w-full justify-start gap-2">
              <MapPin className="h-4 w-4" />
              Ir para o Mapa
            </Button>
          </Link>
        </div>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "#3B82F6" }}
            >
              {user.avatar}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
                <p className="text-muted-foreground">Estatísticas e métricas da sua empresa</p>
              </div>

              {/* Stats cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Usuários totais</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats?.activeUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Usuários ativos</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                      <FolderTree className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats?.departments || 0}</p>
                      <p className="text-sm text-muted-foreground">Departamentos</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                      <Mail className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats?.pendingInvitations || 0}</p>
                      <p className="text-sm text-muted-foreground">Convites pendentes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Convidar colaborador</p>
                    <p className="text-sm text-muted-foreground">Envie um convite por email</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Plus className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Criar departamento</p>
                    <p className="text-sm text-muted-foreground">Organize sua equipe</p>
                  </div>
                </button>
              </div>

              {/* Role breakdown */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Distribuição por cargo</h3>
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">CEO:</span>
                    <span className="font-semibold text-foreground">{stats?.roleBreakdown.ceo || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Gestores:</span>
                    <span className="font-semibold text-foreground">{stats?.roleBreakdown.gestor || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Colaboradores:</span>
                    <span className="font-semibold text-foreground">{stats?.roleBreakdown.colaborador || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
                  <p className="text-muted-foreground">Gerencie os membros da sua equipe</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users list */}
              <div className="rounded-xl border border-border bg-card">
                <div className="grid grid-cols-[1fr,1fr,120px,120px,80px] gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
                  <span>Nome</span>
                  <span>Departamento</span>
                  <span>Cargo</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="grid grid-cols-[1fr,1fr,120px,120px,80px] items-center gap-4 border-b border-border px-6 py-4 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: u.avatar_color || "#3B82F6" }}
                        >
                          {u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.full_name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {u.departments?.name || "Sem departamento"}
                      </span>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        <span className="text-sm text-foreground">{getRoleLabel(u.role)}</span>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        u.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </span>
                      <div className="flex justify-end">
                        {u.role !== "ceo" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === "departments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Departamentos</h1>
                  <p className="text-muted-foreground">Organize sua empresa em áreas</p>
                </div>
                <Button onClick={() => setShowDepartmentModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar departamento
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderTree className="h-5 w-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-destructive"
                            disabled={dept.userCount > 0}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    {dept.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {dept.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {dept.userCount} {dept.userCount === 1 ? "membro" : "membros"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invites Tab */}
          {activeTab === "invites" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Convites</h1>
                  <p className="text-muted-foreground">Gerencie convites pendentes</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo convite
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="grid grid-cols-[1fr,120px,140px,120px,100px] gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
                  <span>Email</span>
                  <span>Cargo</span>
                  <span>Departamento</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {invitations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum convite enviado
                  </div>
                ) : (
                  invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="grid grid-cols-[1fr,120px,140px,120px,100px] items-center gap-4 border-b border-border px-6 py-4 last:border-0"
                    >
                      <span className="text-foreground">{inv.email}</span>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(inv.role)}
                        <span className="text-sm">{getRoleLabel(inv.role)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {inv.departments?.name || "—"}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        inv.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : inv.status === "accepted"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {inv.status === "pending" ? "Pendente" : inv.status === "accepted" ? "Aceito" : "Cancelado"}
                      </span>
                      <div className="flex justify-end gap-1">
                        {inv.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyInviteLink((inv as unknown as { invite_token: string }).invite_token)}
                            >
                              {copiedLink === (inv as unknown as { invite_token: string }).invite_token ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelInvite(inv.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
                <p className="text-muted-foreground">Configurações da empresa</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Informações da empresa</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Nome da empresa</Label>
                    <p className="font-medium text-foreground">{user.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Slug</Label>
                    <p className="font-medium text-foreground">{user.companySlug}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar colaborador</DialogTitle>
            <DialogDescription>
              Envie um convite por email para um novo membro da equipe
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colaborador@empresa.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Cargo</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-department">Departamento (opcional)</Label>
              <Select
                value={inviteForm.departmentId}
                onValueChange={(value) => setInviteForm({ ...inviteForm, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvite} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar convite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Modal */}
      <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar departamento</DialogTitle>
            <DialogDescription>
              Crie um novo departamento para organizar sua equipe
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Nome</Label>
              <Input
                id="dept-name"
                placeholder="Ex: Marketing"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-description">Descrição (opcional)</Label>
              <Textarea
                id="dept-description"
                placeholder="Descreva as responsabilidades deste departamento"
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepartmentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDepartment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar departamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
