import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// POST - Create new workspace (company)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      fullName, 
      email, 
      password, 
      companyName, 
      employeeCount, 
      birthDate 
    } = body

    // Validation
    if (!fullName || !email || !password || !companyName || !birthDate) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    // Generate slug from company name
    const slug = companyName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: "Uma empresa com este nome já existe" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create company first (without owner_id)
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        slug,
        employee_count: employeeCount || null,
      })
      .select()
      .single()

    if (companyError) {
      console.error("Error creating company:", companyError)
      return NextResponse.json(
        { error: "Erro ao criar empresa" },
        { status: 500 }
      )
    }

    // Create user (CEO)
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        full_name: fullName,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        birth_date: birthDate,
        role: "ceo",
        company_id: company.id,
      })
      .select()
      .single()

    if (userError) {
      // Rollback: delete company if user creation fails
      await supabase.from("companies").delete().eq("id", company.id)
      console.error("Error creating user:", userError)
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      )
    }

    // Update company with owner_id
    await supabase
      .from("companies")
      .update({ owner_id: user.id })
      .eq("id", company.id)

    // Create default departments
    const defaultDepartments = [
      { name: "Diretoria", description: "Diretoria executiva da empresa" },
      { name: "Recursos Humanos", description: "Gestão de pessoas e talentos" },
      { name: "Tecnologia", description: "Desenvolvimento e infraestrutura" },
      { name: "Marketing", description: "Marketing e comunicação" },
      { name: "Financeiro", description: "Finanças e contabilidade" },
      { name: "Comercial", description: "Vendas e relacionamento com clientes" },
    ]

    await supabase.from("departments").insert(
      defaultDepartments.map((dept) => ({
        ...dept,
        company_id: company.id,
      }))
    )

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        companyId: company.id,
        companyName: company.name,
        companySlug: company.slug,
      },
    })
  } catch (error) {
    console.error("Workspace creation error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// GET - Get current user's company info
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID é obrigatório" },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        role,
        company_id,
        companies (
          id,
          name,
          slug,
          employee_count,
          created_at
        )
      `)
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get workspace error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
