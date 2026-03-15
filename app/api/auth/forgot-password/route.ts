import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"
import nodemailer from "nodemailer"

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "LevelCorp.contato@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD, // App password from Gmail
  },
})

async function sendResetEmail(to: string, name: string, resetUrl: string) {
  const mailOptions = {
    from: '"LevelCorp" <LevelCorp.contato@gmail.com>',
    to,
    subject: "Redefinicao de Senha - LevelCorp",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a1a; margin: 0; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.2);">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3B82F6 50%, #60a5fa 100%); padding: 40px; text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.15); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px; font-weight: bold; color: white;">LC</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">LevelCorp</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Escritorio Virtual Gamificado</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #f3f4f6; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Ola, ${name}!</h2>
            <p style="color: #9ca3af; line-height: 1.7; margin: 0 0 28px 0; font-size: 15px;">
              Recebemos uma solicitacao para redefinir a senha da sua conta na LevelCorp. Clique no botao abaixo para criar uma nova senha:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                Redefinir Minha Senha
              </a>
            </div>
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 10px; padding: 16px; margin: 24px 0;">
              <p style="color: #60a5fa; font-size: 13px; margin: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">⏱</span>
                Este link expira em <strong style="margin-left: 4px;">1 hora</strong>
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
              Se voce nao solicitou esta alteracao, pode ignorar este email com seguranca. Sua senha permanecera inalterada.
            </p>
            <hr style="border: none; border-top: 1px solid #374151; margin: 28px 0;">
            <p style="color: #4b5563; font-size: 12px; margin: 0 0 8px 0;">
              Se o botao nao funcionar, copie e cole este link no seu navegador:
            </p>
            <p style="margin: 0;">
              <a href="${resetUrl}" style="color: #3B82F6; font-size: 12px; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div style="background: #0d1117; padding: 24px; text-align: center; border-top: 1px solid #1f2937;">
            <p style="color: #4b5563; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} LevelCorp. Todos os direitos reservados.
            </p>
            <p style="color: #374151; font-size: 11px; margin: 8px 0 0 0;">
              Este email foi enviado para ${to}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

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

    // Log for debugging
    console.log("=== PASSWORD RESET REQUEST ===")
    console.log(`To: ${user.email}`)
    console.log(`Name: ${user.full_name}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Token expires at: ${expiresAt.toISOString()}`)
    console.log("==============================")

    // Send email
    if (process.env.GMAIL_APP_PASSWORD) {
      try {
        await sendResetEmail(user.email, user.full_name, resetUrl)
        console.log("Email sent successfully to:", user.email)
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
        // Don't fail the request if email fails - user can request again
      }
    } else {
      console.log("GMAIL_APP_PASSWORD not configured - email not sent")
      console.log("Set GMAIL_APP_PASSWORD environment variable to enable email sending")
    }

    // Check if email was actually sent
    const emailSent = !!process.env.GMAIL_APP_PASSWORD

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Se o email existir em nossa base, voce recebera um link de recuperacao"
        : "Link de recuperacao gerado com sucesso",
      // Always include reset URL if email wasn't sent (no GMAIL_APP_PASSWORD configured)
      ...(!emailSent && { resetUrl }),
      emailSent,
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
