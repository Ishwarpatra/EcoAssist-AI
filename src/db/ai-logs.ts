import { eq, and, sql, gte } from 'drizzle-orm';
import { db } from './index.ts';
import { aiUsageLogs } from './schema.ts';

export async function checkAiRateLimit(userId: number, limit: number = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db.select({ count: sql<number>`count(*)` })
    .from(aiUsageLogs)
    .where(
      and(
        eq(aiUsageLogs.userId, userId),
        gte(aiUsageLogs.createdAt, today)
      )
    );
  
  const count = Number(result[0].count) || 0;
  return { allowed: count < limit, current: count };
}

export async function logAiUsage(userId: number, tokensUsed: number = 0) {
  await db.insert(aiUsageLogs).values({
    userId,
    tokensUsed,
    requestCount: 1,
  });
}
