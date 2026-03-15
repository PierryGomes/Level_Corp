import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha sao obrigatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: "Token invalido ou expirado" },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "Este link ja foi utilizado. Solicite um novo link de recuperacao." },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Este link expirou. Solicite um novo link de recuperacao." },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq("id", resetToken.user_id)

    if (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json(
        { error: "Erro ao atualizar senha" },
        { status: 500 }
      )
    }

    // Mark token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetToken.id)

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso! Voce ja pode fazer login."
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// GET endpoint to validate token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token nao fornecido" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: resetToken, error } = await supabase
      .from("password_reset_tokens")
      .select("id, expires_at, used, users(full_name, email)")
      .eq("token", token)
      .single()

    if (error || !resetToken) {
      return NextResponse.json(
        { valid: false, error: "Token invalido" },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { valid: false, error: "Este link ja foi utilizado" },
        { status: 400 }
      )
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Este link expirou" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      user: resetToken.users
    })

  } catch (error) {
    console.error("Validate token error:", error)
    return NextResponse.json(
      { valid: false, error: "Erro ao validar token" },
      { status: 500 }
    )
  }
}
