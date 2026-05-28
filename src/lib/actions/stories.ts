import { prisma } from "@/lib/prisma"

export async function createStory(userId: string, userLevel: number, data: { title: string, content: string, hindiTitle?: string, hindiContent?: string }) {
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

export async function approveStory(userId: string, userLevel: number, storyId: string) {
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
