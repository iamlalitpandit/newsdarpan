import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const data = await req.json()
  const userLevel = (session.user as any).level
  const userId = (session.user as any).id

  const status = userLevel >= 7 ? "PUBLISHED" : "PENDING"

  const story = await prisma.story.create({
    data: {
      ...data,
      submitterId: userId,
      status: status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "STORY_CREATED",
      userId: userId,
      storyId: story.id,
      details: `Story created with status: ${status}`,
    },
  })

  return NextResponse.json(story)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    include: { submitter: true }
  })

  return NextResponse.json(stories)
}
