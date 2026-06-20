import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import { assessments } from './schema.ts';

export async function createAssessment(userId: number, data: { transportScore: number, energyScore: number, foodScore: number, wasteScore: number, totalScore: number }) {
  const result = await db.insert(assessments).values({
    userId,
    ...data
  }).returning();
  return result[0];
}

export async function getUserAssessments(userId: number) {
  return db.select()
    .from(assessments)
    .where(eq(assessments.userId, userId))
    .orderBy(desc(assessments.createdAt));
}
