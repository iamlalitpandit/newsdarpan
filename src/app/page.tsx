"use client"

import { useSession, signOut } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StorySubmissionForm } from "@/components/stories/story-submission-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories")
      const data = await res.json()
      setStories(data)
    } catch (err) {
      toast.error("Failed to load stories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchStories()
  }, [session])

  const approveStory = async (id: string) => {
    try {
      const res = await fetch(`/api/stories/${id}/approve`, { method: "POST" })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
      }
      toast.success("Story approved!")
      fetchStories()
    } catch (err: any) {
      toast.error(err.message || "Approval failed")
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Welcome to NewsDarpan</CardTitle>
            <CardDescription>Editorial Operating System</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/api/auth/signin"}>
              Sign In to Newsroom
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userLevel = session.user.level

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster />
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">NewsDarpan Editorial</h1>
          <p className="text-muted-foreground">Welcome, {session.user?.name} (Level {userLevel})</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </header>

      <Tabs defaultValue="stories" className="w-full">
        <TabsList>
          <TabsTrigger value="stories">Story Queue</TabsTrigger>
          <TabsTrigger value="submit">New Submission</TabsTrigger>
          {userLevel >= 11 && <TabsTrigger value="admin">System Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Editorial Queue</CardTitle>
              <CardDescription>Manage stories across the newsroom</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitter (Level)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">{story.title}</TableCell>
                      <TableCell>{story.submitter?.name} ({story.submitter?.level})</TableCell>
                      <TableCell>
                        <Badge variant={story.status === "PUBLISHED" ? "default" : "secondary"}>
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(story.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {story.status === "PENDING" && userLevel > story.submitter?.level && (
                          <Button size="sm" onClick={() => approveStory(story.id)}>Approve</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stories.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No stories in the queue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <StorySubmissionForm />
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <p>System settings and user level management (Phase 1 Admin View)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
