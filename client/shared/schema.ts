import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // wallet address (optional) - store lowercase hex address to map wallet-authenticated users
  address: text("address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Referral system tables
export const referralEvents = pgTable("referral_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerUserId: varchar("referrer_user_id").notNull(),
  referredUserId: varchar("referred_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralClaims = pgTable("referral_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(), // Reward amount (stored as integer for decimal precision)
  referralCount: integer("referral_count").notNull(), // Number of referrals at time of claim
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralEventSchema = createInsertSchema(referralEvents).pick({
  referrerUserId: true,
  referredUserId: true,
});

export const insertReferralClaimSchema = createInsertSchema(referralClaims).pick({
  userId: true,
  amount: true,
  referralCount: true,
});

export type InsertReferralEvent = z.infer<typeof insertReferralEventSchema>;
export type ReferralEvent = typeof referralEvents.$inferSelect;
export type InsertReferralClaim = z.infer<typeof insertReferralClaimSchema>;
export type ReferralClaim = typeof referralClaims.$inferSelect;

// Response types for API
export const referralStatsSchema = z.object({
  totalReferrals: z.number(),
  totalEarned: z.number(),
  claimableRewards: z.number(),
  referralLink: z.string(),
});

export type ReferralStats = z.infer<typeof referralStatsSchema>;

// User profile and XP system
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  displayName: text("display_name"),
  avatar: text("avatar"),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(0).notNull(),
  questsCompleted: integer("quests_completed").default(0).notNull(),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  socialProfiles: text("social_profiles").default('{}').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Projects and related tables
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id"),
  ownerAddress: text("owner_address"),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  imageUrl: text("image_url"),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const quests = pgTable("quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  xpReward: integer("xp_reward").default(0),
  data: text("data").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Quest completions - records when a user completes a specific quest
export const questCompletions = pgTable("quest_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  questId: varchar("quest_id").notNull().references(() => quests.id),
  xpAwarded: integer("xp_awarded").notNull(),
  metadata: text("metadata").default("{}").notNull(), // JSON with any verification/proof
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertQuestCompletionSchema = createInsertSchema(questCompletions).omit({ id: true, completedAt: true });

export type InsertQuestCompletion = z.infer<typeof insertQuestCompletionSchema>;
export type QuestCompletion = typeof questCompletions.$inferSelect;

export const projectTasks = pgTable("project_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type"),
  reward: text("reward").default("{}"),
  active: integer("active").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const projectCollaborators = pgTable("project_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id"),
  address: text("address"),
  role: text("role"),
  invitedBy: varchar("invited_by"),
  accepted: integer("accepted").default(0),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectLeaderboard = pgTable("project_leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id"),
  address: text("address"),
  score: integer("score").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// XP and level system constants
export const XP_PER_LEVEL = 100;

// Tier system - tiers are independent of levels
export const TIERS = ["enchanter", "illuminated", "conscious", "oracle", "templar"] as const;
export type Tier = typeof TIERS[number];

export const TIER_ORDER: Record<Tier, number> = {
  enchanter: 1,
  illuminated: 2,
  conscious: 3,
  oracle: 4,
  templar: 5
} as const;

export const TIER_DISPLAY: Record<Tier, string> = {
  enchanter: "Enchanter",
  illuminated: "Illuminated", 
  conscious: "Conscious",
  oracle: "Oracle",
  templar: "Templar"
} as const;

export const TIER_COLORS: Record<Tier, string> = {
  enchanter: "#8b5cf6", // purple
  illuminated: "#10b981", // green
  conscious: "#3b82f6", // blue
  oracle: "#6366f1", // indigo
  templar: "#ef4444" // red
} as const;

// Level thresholds to unlock tiers (levels needed to achieve each tier)
export const TIER_UNLOCK_MIN_LEVEL: Record<Tier, number> = {
  enchanter: 0,   // Starting tier
  illuminated: 5, // Level 5 required to unlock Illuminated
  conscious: 15,  // Level 15 required to unlock Conscious
  oracle: 30,     // Level 30 required to unlock Oracle
  templar: 50     // Level 50 required to unlock Templar
} as const;

// NFT records for level badges
export const userLevelNfts = pgTable("user_level_nfts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  level: integer("level").notNull(),
  tokenId: text("token_id"),
  txHash: text("tx_hash"),
  metadataUri: text("metadata_uri"),
  metadataCid: text("metadata_cid"),
  status: text("status").default("queued"),
  jobId: text("job_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertUserLevelNftSchema = createInsertSchema(userLevelNfts).omit({ id: true, createdAt: true, updatedAt: true });

export type TierType = Tier;

// Helper function schemas
export const getTierFromLevelSchema = z.function()
  .args(z.number())
  .returns(z.enum(["enchanter", "illuminated", "conscious", "oracle", "templar"]));

export const getXpForNextLevelSchema = z.function()
  .args(z.number(), z.number())
  .returns(z.number());

// Tasks table - defines all available tasks in the system
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  taskType: text("task_type").notNull(), // 'daily', 'onetime', 'campaign', 'featured', 'extra'
  xpReward: integer("xp_reward").notNull(),
  questIncrement: integer("quest_increment").default(0).notNull(), // How many quests this counts as
  taskIncrement: integer("task_increment").default(0).notNull(), // How many tasks this counts as
  metadata: text("metadata").default("{}").notNull(), // JSON for kind, url, actionLabel, etc.
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Task completions - tracks which users have completed which tasks
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  xpAwarded: integer("xp_awarded").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

// Campaign Tasks - organization-level tasks for campaigns
export const campaignTasks = pgTable("campaign_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  taskCategory: text("task_category").notNull(), // 'discord', 'twitter', 'onchain', 'telegram', 'poh', 'quiz', 'email'
  taskSubtype: text("task_subtype").notNull(), // e.g., 'role-claim', 'like-post', 'verify-holdings', etc.
  xpReward: integer("xp_reward").default(0).notNull(),
  verificationConfig: text("verification_config").default("{}").notNull(), // JSON with task-specific config
  isActive: integer("is_active").default(1).notNull(),
  orderIndex: integer("order_index").default(0).notNull(), // For sorting tasks in UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Campaign task completions - tracks user completion of campaign tasks
export const campaignTaskCompletions = pgTable("campaign_task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: varchar("task_id").notNull().references(() => campaignTasks.id),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  xpAwarded: integer("xp_awarded").notNull(),
  verificationData: text("verification_data").default("{}").notNull(), // JSON with proof of completion
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertCampaignTaskSchema = createInsertSchema(campaignTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignTaskCompletionSchema = createInsertSchema(campaignTaskCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertCampaignTask = z.infer<typeof insertCampaignTaskSchema>;
export type CampaignTask = typeof campaignTasks.$inferSelect;
export type InsertCampaignTaskCompletion = z.infer<typeof insertCampaignTaskCompletionSchema>;
export type CampaignTaskCompletion = typeof campaignTaskCompletions.$inferSelect;
