import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, indexNumber } = await request.json()

    // Validate required fields
    if (!name || !email || !indexNumber) {
      return NextResponse.json({ error: "Name, email, and student ID are required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Check if user already verified
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("index_number", indexNumber)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "User already verified", message: "This user has already been verified" },
        { status: 400 },
      )
    }

    // Insert manually verified user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          index_number: indexNumber.toUpperCase().trim(),
          verified_at: new Date().toISOString(),
          manually_verified: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Emergency verify error:", error)
      return NextResponse.json({ error: "Failed to verify user" }, { status: 400 })
    }

    return NextResponse.json({
      message: `${name} has been manually verified`,
      user: data,
    })
  } catch (error) {
    console.error("[v0] Emergency verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
