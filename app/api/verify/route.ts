import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, indexNumber, referenceCode } = body

    // Validate inputs
    if (!fullName || !email || !indexNumber || !referenceCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
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

    // Check if reference code exists and is unused
    const { data: refCodeData, error: refCodeError } = await supabase
      .from("reference_codes")
      .select("*")
      .eq("code", referenceCode.toUpperCase())
      .single()

    if (refCodeError || !refCodeData) {
      return NextResponse.json({ error: "Invalid reference code" }, { status: 400 })
    }

    // Check if code is already used
    if (refCodeData.status === "used") {
      return NextResponse.json({ error: "This reference code has already been used" }, { status: 400 })
    }

    // Note: Index number check removed to allow flexible code assignment
    // Codes can be used by any student regardless of the index_number stored in reference_codes

    // Check if user with this email already exists
    const { data: existingEmailUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingEmailUser) {
      return NextResponse.json({ error: "This email address has already been verified" }, { status: 400 })
    }

    // Check if user with this index number already exists
    const { data: existingIndexUser } = await supabase
      .from("users")
      .select("id")
      .eq("index_number", indexNumber)
      .single()

    if (existingIndexUser) {
      return NextResponse.json({ error: "This index number has already been verified" }, { status: 400 })
    }

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([
        {
          name: fullName,
          email,
          index_number: indexNumber,
          verified: true,
          verified_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error("[v0] User creation error:", userError)
      return NextResponse.json({ error: "Failed to create user record" }, { status: 500 })
    }

    // Mark reference code as used
    const { error: updateError } = await supabase
      .from("reference_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", refCodeData.id)

    if (updateError) {
      console.error("[v0] Reference code update error:", updateError)
      return NextResponse.json({ error: "Failed to mark reference code as used" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful! Your identity has been confirmed.",
      user: newUser,
      redirectUrl: `/verification-success?email=${encodeURIComponent(email)}`,
    })
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "An error occurred during verification" }, { status: 500 })
  }
}
