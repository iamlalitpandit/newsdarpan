import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const { id: storyId } = await params
  const userLevel = (session.user as any).level
  const userId = (session.user as any).id

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { submitter: true }
  })

  if (!story) return new NextResponse("Story not found", { status: 404 })

  if (userLevel <= story.submitter.level) {
    return new NextResponse("Insufficient seniority for approval", { status: 403 })
  }

  const updatedStory = await prisma.story.update({
    where: { id: storyId },
    data: {
      status: "PUBLISHED",
      approverId: userId,
      publishedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "STORY_APPROVED",
      userId: userId,
      storyId: story.id,
      details: `Story approved by level ${userLevel} user`,
    },
  })

  return NextResponse.json(updatedStory)
}
