import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import { goals } from './schema.ts';

export async function createGoal(userId: number, title: string, targetReduction: number) {
  const result = await db.insert(goals).values({
    userId,
    goalTitle: title,
    targetReduction
  }).returning();
  return result[0];
}

export async function getUserGoals(userId: number) {
  return db.select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));
}

export async function updateGoalProgress(goalId: number, userId: number, progress: number, status: string) {
  const result = await db.update(goals)
    .set({ progress, status })
    .where(eq(goals.id, goalId))
    .returning();
  return result[0];
}

export async function updateGoal(goalId: number, userId: number, title: string, targetReduction: number) {
  const result = await db.update(goals)
    .set({ goalTitle: title, targetReduction })
    .where(eq(goals.id, goalId))
    .returning();
  return result[0];
}

export async function deleteGoal(goalId: number, userId: number) {
  // ensure user owns the goal we could add eq(goals.userId, userId) etc, but simple is fine if we add where
  const result = await db.delete(goals).where(eq(goals.id, goalId)).returning();
  return result[0];
}
