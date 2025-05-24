"use server"

import { revalidatePath } from "next/cache"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

interface GeneratePostParams {
  recordingId: string
  userId: string
  platform: string
}

export async function generatePostFromRecording({ recordingId, userId, platform }: GeneratePostParams) {
  try {
    console.log("Starting post generation for recording:", recordingId)

    // Create a server-side Supabase client
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the recording with transcript directly from Supabase
    const { data: recording, error: recordingError } = await supabase
      .from("recordings")
      .select("*")
      .eq("id", recordingId)
      .single()

    if (recordingError || !recording) {
      console.error("Error fetching recording:", recordingError)
      return { success: false, error: "Recording not found" }
    }

    if (!recording.transcript) {
      console.error("Recording has no transcript")
      return { success: false, error: "Transcript not found" }
    }

    console.log("Transcript found, length:", recording.transcript.length)

    // Use OpenAI's GPT-4o model to generate post content
    const prompt = `
      You are a professional LinkedIn content creator known for creating viral, engaging posts.
      
      Create a compelling LinkedIn post based on the following transcript. The post should follow best practices for LinkedIn engagement:
      
      1. Start with a powerful, attention-grabbing hook (1-2 sentences)
      2. Use short, punchy paragraphs (1-2 sentences each) with plenty of white space
      3. Include storytelling elements or examples that illustrate key points
      4. End with a thought-provoking question or clear call to action
      5. Include 3-5 relevant hashtags
      
      Format the response in JSON with these fields:
      - hook: A powerful, attention-grabbing opening statement or question (1-2 sentences)
      - body: The main content broken into short paragraphs (use \\n\\n between paragraphs)
      - callToAction: A clear call to action or thought-provoking question (1 sentence)
      - hashtags: An array of 3-5 relevant hashtags (without the # symbol)
      
      Make the post sound conversational, direct, and authentic - like a real person sharing valuable insights.
      
      Transcript: ${recording.transcript}
    `

    console.log("Calling OpenAI API...")

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set")
      return { success: false, error: "OpenAI API key is not configured" }
    }

    try {
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional social media content creator specializing in LinkedIn posts.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      })

      console.log("OpenAI API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenAI API error:", errorText)

        // Handle specific error cases
        if (response.status === 401) {
          return { success: false, error: "Authentication error with OpenAI API. Please check your API key." }
        } else if (response.status === 429) {
          return { success: false, error: "OpenAI API rate limit exceeded. Please try again later." }
        } else if (response.status === 500) {
          return { success: false, error: "OpenAI API server error. Please try again later." }
        }

        return { success: false, error: `Failed to generate post: ${response.statusText}` }
      }

      const data = await response.json()
      console.log("OpenAI API response received")

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("Unexpected OpenAI API response format:", JSON.stringify(data))
        return { success: false, error: "Invalid response from OpenAI API" }
      }

      const generatedText = data.choices[0].message.content

      // Parse the JSON response
      let parsedContent
      try {
        parsedContent = JSON.parse(generatedText)
        console.log("Successfully parsed OpenAI response")
      } catch (e) {
        console.error("Failed to parse JSON response:", e)
        console.log("Raw response:", generatedText)

        // Fallback: try to extract content using regex
        const hookMatch = generatedText.match(/hook["\s:]+([^"]*?)[",$]/)
        const bodyMatch = generatedText.match(/body["\s:]+([^"]*?)[",$]/)
        const ctaMatch = generatedText.match(/callToAction["\s:]+([^"]*?)[",$]/)
        const hashtagsMatch = generatedText.match(/hashtags["\s:]+\[(.*?)\]/)

        parsedContent = {
          hook: hookMatch ? hookMatch[1] : "",
          body: bodyMatch ? bodyMatch[1] : "",
          callToAction: ctaMatch ? ctaMatch[1] : "",
          hashtags: hashtagsMatch ? hashtagsMatch[1].split(",").map((tag: string) => tag.trim().replace(/"/g, "")) : [],
        }

        console.log("Used regex fallback to parse response")
      }

      // Fallback content if parsing completely fails
      if (!parsedContent || (!parsedContent.hook && !parsedContent.body)) {
        console.log("Using fallback content generation")
        // Create a simple post from the transcript
        const transcript = recording.transcript
        const firstSentence = transcript.split(".")[0] + "."
        const remainingSentences = transcript.split(".").slice(1).join(".")

        parsedContent = {
          hook: firstSentence,
          body: remainingSentences,
          callToAction: "What are your thoughts on this?",
          hashtags: ["content", "socialmedia", "thoughts"],
        }
      }

      // Combine all parts for the full content
      const fullContent = [
        parsedContent.hook,
        parsedContent.body,
        parsedContent.callToAction,
        parsedContent.hashtags.map((tag: string) => `#${tag.replace(/^#/, "")}`).join(" "),
      ]
        .filter(Boolean)
        .join("\n\n")

      console.log("Generated post content, length:", fullContent.length)

      // Create the post with only the fields that exist in the database schema
      console.log("Creating post in database...")

      // Insert the post directly using the server-side Supabase client
      const { data: post, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          recording_id: recordingId,
          content: fullContent,
          platform,
          status: "draft",
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating post:", insertError)
        return { success: false, error: `Failed to create post: ${insertError.message}` }
      }

      console.log("Post created successfully with ID:", post.id)
      revalidatePath("/posts")
      return { success: true, postId: post.id }
    } catch (openAiError) {
      console.error("Error during OpenAI API call:", openAiError)
      return { success: false, error: `OpenAI API error: ${openAiError.message || "Unknown error"}` }
    }
  } catch (error) {
    console.error("Error generating post:", error)
    return { success: false, error: `Failed to generate post: ${error.message || "Unknown error"}` }
  }
}
