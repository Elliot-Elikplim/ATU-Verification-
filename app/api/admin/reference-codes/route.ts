import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
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

    const { data, error } = await supabase.from("reference_codes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching codes:", error)
      return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
