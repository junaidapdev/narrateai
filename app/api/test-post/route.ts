import { NextResponse } from "next/server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

export async function POST() {
  try {
    const supabase = createClientComponentClient<Database>()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create a test post
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: `This is a test post created at ${new Date().toLocaleString()}.\n\nThis post was automatically generated to test the posts functionality.\n\nYou can edit or delete this post.`,
        platform: "linkedin",
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
