import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email e obrigatorio" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "Se o email existir em nossa base, voce recebera um link de recuperacao"
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate any existing tokens for this user
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("user_id", user.id)
      .eq("used", false)

    // Create new reset token
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error("Error creating reset token:", tokenError)
      return NextResponse.json(
        { error: "Erro ao gerar token de recuperacao" },
        { status: 500 }
      )
    }

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get("host")?.includes("localhost") 
        ? `http://${request.headers.get("host")}` 
        : `https://${request.headers.get("host")}`)
    
    const resetUrl = `${baseUrl}/redefinir-senha?token=${token}`

    // In production, you would send an actual email here using a service like Resend, SendGrid, etc.
    // For now, we'll log it and return success
    console.log("=== PASSWORD RESET EMAIL ===")
    console.log(`To: ${user.email}`)
    console.log(`Name: ${user.full_name}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Token expires at: ${expiresAt.toISOString()}`)
    console.log("============================")

    // Try to send email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "LevelCorp <noreply@levelcorp.com>",
            to: [user.email],
            subject: "Redefinicao de Senha - LevelCorp",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">LevelCorp</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Escritorio Virtual Gamificado</p>
                  </div>
                  <div style="padding: 32px;">
                    <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px;">Ola, ${user.full_name}!</h2>
                    <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
                      Recebemos uma solicitacao para redefinir sua senha. Clique no botao abaixo para criar uma nova senha:
                    </p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Redefinir Senha
                    </a>
                    <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                      Este link expira em <strong>1 hora</strong>. Se voce nao solicitou esta alteracao, ignore este email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                      Se o botao nao funcionar, copie e cole este link no seu navegador:<br>
                      <a href="${resetUrl}" style="color: #3B82F6; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        })

        if (!emailResponse.ok) {
          console.error("Failed to send email:", await emailResponse.text())
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Se o email existir em nossa base, voce recebera um link de recuperacao",
      // Include reset URL in development for testing
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
