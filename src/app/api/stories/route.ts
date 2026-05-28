import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createStory } from "@/lib/actions/stories"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const data = await req.json()
  const userLevel = session.user.level
  const userId = session.user.id

  try {
    const story = await createStory(userId, userLevel, data)
    return NextResponse.json(story)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 400 })
  }
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
