import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  transportScore: integer('transport_score').notNull(),
  energyScore: integer('energy_score').notNull(),
  foodScore: integer('food_score').notNull(),
  wasteScore: integer('waste_score').notNull(),
  totalScore: integer('total_score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  recommendation: text('recommendation').notNull(),
  impactLevel: text('impact_level').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  goalTitle: text('goal_title').notNull(),
  targetReduction: integer('target_reduction').notNull(),
  progress: integer('progress').default(0),
  status: text('status').default('in_progress'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  tokensUsed: integer('tokens_used').default(0),
  requestCount: integer('request_count').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  recommendations: many(recommendations),
  goals: many(goals),
  aiUsageLogs: many(aiUsageLogs),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
}));
