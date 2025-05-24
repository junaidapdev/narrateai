import { NextResponse } from "next/server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Sample posts
    const samplePosts = [
      {
        user_id: user.id,
        content:
          "Three key leadership principles that transformed my team's performance this quarter. 📈\n\nIn today's rapidly evolving business landscape, adaptable leadership isn't optional—it's essential.\n\nAfter implementing three core principles with my team, we saw measurable improvements across all KPIs.\n\nFirst, radical transparency. By sharing both successes and challenges openly, we built unprecedented trust.\n\nSecond, outcome-focused autonomy. We defined clear objectives but gave team members freedom in execution.\n\nThird, continuous feedback loops. We replaced annual reviews with weekly micro-feedback sessions.\n\nThe result? 37% increase in team productivity and significantly higher engagement scores.\n\nWhich of these principles could make the biggest impact in your organization? Have you implemented similar approaches?\n\n#LeadershipStrategy #TeamPerformance #BusinessGrowth #ProfessionalDevelopment",
        platform: "linkedin",
        status: "draft",
      },
      {
        user_id: user.id,
        content:
          "I tried a crazy productivity hack last month... and it actually worked! 🤯\n\nEver feel like you're drowning in your to-do list?\n\nYeah, me too. All. The. Time.\n\nSo last month I tried something different. Instead of my usual morning email check (hello, anxiety!), I started with 90 minutes of focused work on ONE important task.\n\nNo phone. No Slack. No distractions.\n\nJust me and the most important thing I needed to accomplish.\n\nHonestly? The first few days were HARD. My brain kept screaming for that dopamine hit of checking messages.\n\nBut by week two? Game changer.\n\nI was knocking out my most important work before most people even finished their coffee.\n\nWhat's your morning routine look like? Anyone else tried the \"important task first\" approach?\n\n#ProductivityHacks #MorningRoutine #WorkSmarter #FocusTime",
        platform: "linkedin",
        status: "posted",
      },
    ]

    // Insert the posts
    const { data, error } = await supabase.from("posts").insert(samplePosts).select()

    if (error) {
      console.error("Error seeding posts:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in seed-posts:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
