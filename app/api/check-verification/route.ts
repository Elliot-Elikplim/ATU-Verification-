import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, indexNumber } = body

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }
    if (!indexNumber || !indexNumber.trim()) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
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

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, index_number, verified_at")
      .eq("email", email.toLowerCase())
      .eq("index_number", indexNumber.toUpperCase())
      .eq("verified", true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { verified: false, error: "No verified record found with the provided email and student ID" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      verified: true,
      fullName: user.name,
      email: user.email,
      indexNumber: user.index_number,
      verifiedAt: user.verified_at,
    })
  } catch (error) {
    console.error("[v0] Check verification error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const searchBy = searchParams.get("searchBy") || "email"

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
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

    let filterField = "email"
    let filterValue = query.toLowerCase()

    if (searchBy === "index_number") {
      filterField = "index_number"
      filterValue = query.toUpperCase()
    } else if (searchBy === "name") {
      filterField = "name"
      filterValue = query.toLowerCase()
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, index_number, verified_at")
      .eq(filterField, filterValue)
      .eq("verified", true)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found or not verified" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Check verification error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
