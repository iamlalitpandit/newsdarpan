import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createStory(data: { title: string, content: string, hindiTitle?: string, hindiContent?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const userLevel = (session.user as any).level
  const userId = (session.user as any).id

  // Status logic based on user level
  // Level 7+ can self-publish, others go to PENDING
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

  return story
}

export async function approveStory(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const userLevel = (session.user as any).level
  const userId = (session.user as any).id

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { submitter: true }
  })

  if (!story) throw new Error("Story not found")

  // Relative Approval Logic:
  // Level 1-6 requires one approval from any user senior to them.
  if (userLevel <= story.submitter.level) {
    throw new Error("You do not have enough seniority to approve this story.")
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

  return updatedStory
}
