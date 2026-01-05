import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const indexNumber = searchParams.get("index_number")
    const verificationId = searchParams.get("verification_id")

    if (!email && !indexNumber && !verificationId) {
      return NextResponse.json(
        { error: "Please provide email, index_number, or verification_id" },
        { status: 400 }
      )
    }

    let query = supabase.from("users").select("*")

    if (email) {
      query = query.eq("email", email)
    } else if (indexNumber) {
      query = query.eq("index_number", indexNumber)
    } else if (verificationId) {
      query = query.eq("verification_id", verificationId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: "No verification record found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: data.name,
      email: data.email,
      index_number: data.index_number,
      verification_id: data.verification_id,
      verified_at: data.created_at,
    })
  } catch (error) {
    console.error("Error checking verification status:", error)
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 }
    )
  }
}
