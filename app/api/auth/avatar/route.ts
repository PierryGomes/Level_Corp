import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, avatarColor, avatarStyle, initials } = body

    if (!userId || !avatarColor || !avatarStyle) {
      return NextResponse.json(
        { error: "Dados do avatar são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update user with avatar data
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        avatar_color: avatarColor,
        avatar_style: avatarStyle,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating avatar:", error)
      return NextResponse.json(
        { error: "Erro ao salvar avatar" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        company: updatedUser.company,
        department: updatedUser.department,
        avatarColor: updatedUser.avatar_color,
        avatarStyle: updatedUser.avatar_style,
        role: updatedUser.role,
        xp: updatedUser.xp,
        level: updatedUser.level,
      },
    })
  } catch (error) {
    console.error("Avatar update error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
