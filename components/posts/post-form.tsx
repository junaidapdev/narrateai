"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPostAction, updatePostAction } from "@/actions/posts"
import type { Post } from "@/services/post-service"

interface PostFormProps {
  userId: string
  recordingId?: string
  post?: Post
  isEdit?: boolean
}

export function PostForm({ userId, recordingId, post, isEdit = false }: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [platform, setPlatform] = useState(post?.platform || "linkedin")
  const [content, setContent] = useState(post?.content || "")
  const [hook, setHook] = useState(post?.hook || "")
  const [body, setBody] = useState(post?.body || "")
  const [callToAction, setCallToAction] = useState(post?.call_to_action || "")
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(", ") || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      if (isEdit && post) {
        formData.append("id", post.id)
      } else {
        formData.append("userId", userId)
        if (recordingId) {
          formData.append("recordingId", recordingId)
        }
      }

      // Combine structured content into full content
      const fullContent = [
        hook,
        body,
        callToAction,
        hashtags
          ? hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
              .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
              .join(" ")
          : "",
      ]
        .filter(Boolean)
        .join("\n\n")

      formData.append("content", fullContent)
      formData.append("platform", platform)
      formData.append("hook", hook)
      formData.append("body", body)
      formData.append("callToAction", callToAction)
      formData.append("hashtags", hashtags)

      const result = isEdit ? await updatePostAction(formData) : await createPostAction(formData)

      if (result.success) {
        router.push("/posts")
      } else {
        console.error("Error submitting post:", result.error)
      }
    } catch (error) {
      console.error("Error submitting post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Post" : "Create Post"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook">Hook (Attention Grabber)</Label>
            <Textarea
              id="hook"
              placeholder="Start with a compelling hook to grab attention..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              placeholder="Main content of your post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callToAction">Call to Action</Label>
            <Textarea
              id="callToAction"
              placeholder="End with a clear call to action..."
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
            <Input
              id="hashtags"
              placeholder="#marketing, #business, #leadership"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview">Preview</Label>
            <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
              {hook && <p className="font-medium mb-2">{hook}</p>}
              {body && <p className="mb-2">{body}</p>}
              {callToAction && <p className="mb-2">{callToAction}</p>}
              {hashtags && (
                <p className="text-blue-600">
                  {hashtags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag)
                    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
                    .join(" ")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
