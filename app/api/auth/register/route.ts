import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, birthDate, acceptedTerms, companyId, departmentId, role } = body

    // Validation
    if (!fullName || !email || !password || !birthDate) {
      return NextResponse.json(
        { error: "Todos os campos obrigatorios devem ser preenchidos" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email invalido" },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Terms validation
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "Voce deve aceitar os termos de uso" },
        { status: 400 }
      )
    }

    // Age validation (must be at least 16)
    const birthDateObj = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    if (age < 16) {
      return NextResponse.json(
        { error: "Voce deve ter pelo menos 16 anos" },
        { status: 400 }
      )
    }

    // Company ID is required for new multi-tenant system
    if (!companyId) {
      return NextResponse.json(
        { error: "ID da empresa e obrigatorio. Use /criar-workspace para criar uma nova empresa." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Empresa nao encontrada" },
        { status: 404 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        birth_date: birthDate,
        company_id: companyId,
        department_id: departmentId || null,
        role: role || "colaborador",
        xp: 0,
        level: 1,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      return NextResponse.json(
        { error: "Erro ao criar conta. Tente novamente." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        companyId: newUser.company_id,
        role: newUser.role,
      },
      message: "Conta criada com sucesso!",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
