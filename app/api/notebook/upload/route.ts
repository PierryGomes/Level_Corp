import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Extract text from different file types
async function extractText(file: File): Promise<string> {
  const type = file.type
  const text = await file.text()
  
  if (type === "text/plain" || type === "text/markdown") {
    return text
  }
  
  // For PDF, we'll extract text client-side using pdf.js
  // Here we just store the raw content and handle it differently
  if (type === "application/pdf") {
    return text // Will be processed client-side
  }
  
  // For other types, return as text
  return text
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const notebookId = formData.get("notebookId") as string
    const extractedContent = formData.get("content") as string | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    if (!notebookId) {
      return NextResponse.json({ error: "ID do notebook não fornecido" }, { status: 400 })
    }

    // Upload to Vercel Blob (private)
    const blob = await put(`notebook/${notebookId}/${file.name}`, file, {
      access: "private",
    })

    // Use extracted content if provided (for PDFs processed client-side), otherwise extract
    const content = extractedContent || await extractText(file)
    const wordCount = countWords(content)

    // Save to Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("sources")
      .insert({
        notebook_id: notebookId,
        name: file.name,
        type: file.type,
        blob_url: blob.url,
        blob_pathname: blob.pathname,
        content: content,
        word_count: wordCount,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Erro ao salvar fonte" }, { status: 500 })
    }

    return NextResponse.json({ 
      source: data,
      pathname: blob.pathname 
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 })
  }
}
