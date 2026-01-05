import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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

    const { error } = await supabase.from("reference_codes").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting code:", error)
      return NextResponse.json({ error: "Failed to delete code" }, { status: 500 })
    }

    return NextResponse.json({ message: "Code deleted successfully" })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
