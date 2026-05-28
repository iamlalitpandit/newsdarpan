"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function StorySubmissionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      hindiTitle: formData.get("hindiTitle") as string,
      hindiContent: formData.get("hindiContent") as string,
    }

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to submit")

      toast.success("Story submitted successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Error submitting story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Story</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">English Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">English Content</Label>
            <Textarea id="content" name="content" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hindiTitle">Hindi Title (Optional)</Label>
            <Input id="hindiTitle" name="hindiTitle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hindiContent">Hindi Content (Optional)</Label>
            <Textarea id="hindiContent" name="hindiContent" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Story"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
