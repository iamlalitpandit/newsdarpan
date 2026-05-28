import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { approveStory } from "@/lib/actions/stories"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const { id: storyId } = await params
  const userLevel = session.user.level
  const userId = session.user.id

  try {
    const updatedStory = await approveStory(userId, userLevel, storyId)
    return NextResponse.json(updatedStory)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 403 })
  }
}
