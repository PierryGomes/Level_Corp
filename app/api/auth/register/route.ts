import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, company, department, birthDate, acceptedTerms } = body

    // Validation
    if (!fullName || !email || !company || !department || !birthDate) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Terms validation
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "Você deve aceitar os termos de uso" },
        { status: 400 }
      )
    }

    // Age validation (must be at least 16)
    const birthDateObj = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    if (age < 16) {
      return NextResponse.json(
        { error: "Você deve ter pelo menos 16 anos" },
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
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        company: company.trim(),
        department: department.trim(),
        birth_date: birthDate,
        accepted_terms: acceptedTerms,
        role: "colaborador",
        xp: 0,
        level: 1,
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
        company: newUser.company,
        department: newUser.department,
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
