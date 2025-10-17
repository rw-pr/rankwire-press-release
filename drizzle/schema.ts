import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Entities table - stores company/brand information
export const entities = mysqlTable("entities", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyAddress: text("companyAddress"),
  googleBusinessProfileUrl: varchar("googleBusinessProfileUrl", { length: 500 }),
  websiteUrl: varchar("websiteUrl", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  prContactFirstName: varchar("prContactFirstName", { length: 100 }),
  prContactLastName: varchar("prContactLastName", { length: 100 }),
  prEmail: varchar("prEmail", { length: 255 }),
  facebookUrl: varchar("facebookUrl", { length: 255 }),
  twitterUrl: varchar("twitterUrl", { length: 255 }),
  redditUrl: varchar("redditUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;

// Press releases table
export const pressReleases = mysqlTable("pressReleases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  entityId: varchar("entityId", { length: 64 }).references(() => entities.id, { onDelete: "set null" }),
  status: mysqlEnum("status", ["draft", "published", "reporting"]).default("draft").notNull(),
  headline: varchar("headline", { length: 70 }).notNull(),
  subheadline: varchar("subheadline", { length: 120 }),
  datelineCity: varchar("datelineCity", { length: 100 }),
  datelineState: varchar("datelineState", { length: 100 }),
  datelineDate: timestamp("datelineDate"),
  leadParagraph: text("leadParagraph"),
  bodyContent: text("bodyContent"),
  boilerplate: text("boilerplate"),
  callToAction: text("callToAction"),
  wordCount: varchar("wordCount", { length: 10 }),
  mediaContactName: varchar("mediaContactName", { length: 255 }),
  mediaContactTitle: varchar("mediaContactTitle", { length: 255 }),
  mediaContactEmail: varchar("mediaContactEmail", { length: 255 }),
  mediaContactPhone: varchar("mediaContactPhone", { length: 50 }),
  mediaContactWebsite: varchar("mediaContactWebsite", { length: 255 }),
  authorName: varchar("authorName", { length: 255 }),
  authorTitle: varchar("authorTitle", { length: 255 }),
  authorCompany: varchar("authorCompany", { length: 255 }),
  authorEmail: varchar("authorEmail", { length: 255 }),
  authorSocialHandle: varchar("authorSocialHandle", { length: 100 }),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  keywords: text("keywords"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  publishedAt: timestamp("publishedAt"),
});

export type PressRelease = typeof pressReleases.$inferSelect;
export type InsertPressRelease = typeof pressReleases.$inferInsert;

// Media files table
export const mediaFiles = mysqlTable("mediaFiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  pressReleaseId: varchar("pressReleaseId", { length: 64 }).notNull().references(() => pressReleases.id, { onDelete: "cascade" }),
  fileType: mysqlEnum("fileType", ["logo", "image", "video", "other"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  altText: text("altText"),
  fileSize: varchar("fileSize", { length: 20 }),
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;
