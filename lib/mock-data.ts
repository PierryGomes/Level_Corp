export type UserRole = "colaborador" | "gestor" | "ceo"

export interface MockUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  avatar: string
  department: string
  level: number
  xp: number
  xpToNext: number
  coins: number
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "colaborador@levelcorp.com",
    password: "123456",
    role: "colaborador",
    avatar: "AS",
    department: "Desenvolvimento",
    level: 7,
    xp: 2340,
    xpToNext: 3000,
    coins: 450,
  },
  {
    id: "2",
    name: "Carlos Mendes",
    email: "gestor@levelcorp.com",
    password: "123456",
    role: "gestor",
    avatar: "CM",
    department: "Tecnologia",
    level: 12,
    xp: 5600,
    xpToNext: 6000,
    coins: 1200,
  },
  {
    id: "3",
    name: "Roberto Almeida",
    email: "ceo@levelcorp.com",
    password: "123456",
    role: "ceo",
    avatar: "RA",
    department: "Diretoria",
    level: 20,
    xp: 15000,
    xpToNext: 20000,
    coins: 5000,
  },
]

export function authenticateUser(email: string, password: string): MockUser | null {
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  )
  return user ?? null
}

export const roleLabels: Record<UserRole, string> = {
  colaborador: "Colaborador",
  gestor: "Gestor",
  ceo: "CEO",
}
