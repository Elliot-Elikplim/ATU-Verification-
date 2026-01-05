import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

function generateCPSCode(): string {
  // Use crypto for secure random generation
  // 8 characters = 36^8 = 2.8 trillion combinations (very secure)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const randomBytes = crypto.getRandomValues(new Uint8Array(8))
  let randomPart = ""
  
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(randomBytes[i] % chars.length)
  }
  
  // Format: CPS-XXXXXXXX
  return `CPS-${randomPart}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 1000, indexPrefix = "BULK" } = body

    if (count < 1 || count > 10000) {
      return NextResponse.json({ error: "Count must be between 1 and 10000" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch (error) {
              console.error("Error setting cookies:", error)
            }
          },
        },
      },
    )

    const codes: Array<{
      code: string
      index_number: string
      status: string
      created_by: string
    }> = []

    const generatedCodes = new Set<string>()

    // Get existing codes to avoid duplicates
    const { data: existingCodes } = await supabase.from("reference_codes").select("code")
    const existingCodesSet = new Set(existingCodes?.map((c) => c.code) || [])

    // Generate unique codes
    for (let i = 0; i < count; i++) {
      let code = generateCPSCode()
      let attempts = 0

      while ((existingCodesSet.has(code) || generatedCodes.has(code)) && attempts < 100) {
        code = generateCPSCode()
        attempts++
      }

      if (attempts >= 100) {
        return NextResponse.json(
          { error: `Failed to generate unique code at index ${i}` },
          { status: 500 }
        )
      }

      generatedCodes.add(code)
      codes.push({
        code,
        index_number: `${indexPrefix}-${String(i + 1).padStart(4, "0")}`,
        status: "unused",
        created_by: "admin-bulk",
      })
    }

    // Insert all codes in batches
    const batchSize = 500
    const batches = []

    for (let i = 0; i < codes.length; i += batchSize) {
      batches.push(codes.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const { error } = await supabase.from("reference_codes").insert(batch)

      if (error) {
        console.error("Bulk generation error:", error)
        return NextResponse.json({ error: "Failed to generate all codes" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      count: codes.length,
      codes: codes.map((c) => ({ code: c.code, index_number: c.index_number })),
      message: `Successfully generated ${codes.length} codes`,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
