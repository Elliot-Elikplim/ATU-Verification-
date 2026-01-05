import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
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
              console.error("Error setting cookies:", error)
            }
          },
        },
      },
    )

    // Delete all reference codes
    const { error, count } = await supabase
      .from("reference_codes")
      .delete()
      .gte("id", 0)

    if (error) {
      console.error("Flush codes error:", error)
      return NextResponse.json({ error: "Failed to flush codes", details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${count || 0} codes`,
      count: count || 0
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
