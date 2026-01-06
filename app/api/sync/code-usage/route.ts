import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      )
    }

    // Mark code as used in Supabase
    const { error } = await supabase
      .from("reference_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("code", code.toUpperCase())

    if (error) {
      console.error("Failed to update code:", error)
      return NextResponse.json(
        { error: "Failed to update code status" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync code usage error:", error)
    return NextResponse.json(
      { error: "Failed to sync code usage" },
      { status: 500 }
    )
  }
}
