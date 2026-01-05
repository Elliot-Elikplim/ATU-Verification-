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
    const { indexNumber } = body

    if (!indexNumber) {
      return NextResponse.json({ error: "Index number is required" }, { status: 400 })
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
              console.error("[v0] Error setting cookies:", error)
            }
          },
        },
      },
    )

    // Generate a unique code
    let code = generateCPSCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase.from("reference_codes").select("id").eq("code", code).single()

      if (!existing) {
        break
      }
      code = generateCPSCode()
      attempts++
    }

    if (attempts === maxAttempts) {
      return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 })
    }

    // Insert the code
    const { data, error } = await supabase
      .from("reference_codes")
      .insert([
        {
          code,
          index_number: indexNumber,
          status: "unused",
          created_by: "admin",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Code generation error:", error)
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
    }

    return NextResponse.json({ code, message: "Code generated successfully" })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
