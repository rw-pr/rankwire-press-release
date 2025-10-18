import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, entities, InsertEntity, pressReleases, InsertPressRelease, mediaFiles, InsertMediaFile } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Entity queries
export async function getUserEntities(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(entities).where(eq(entities.userId, userId));
}

export async function getEntityById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
  return result[0];
}

export async function createEntity(entity: InsertEntity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(entities).values(entity);
  return entity;
}

export async function updateEntity(id: string, data: Partial<InsertEntity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(entities).set(data).where(eq(entities.id, id));
}

export async function deleteEntity(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(entities).where(eq(entities.id, id));
}

// Press release queries
export async function getUserPressReleases(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pressReleases).where(eq(pressReleases.userId, userId));
}

export async function getPressReleaseById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pressReleases).where(eq(pressReleases.id, id)).limit(1);
  return result[0];
}

// Generate next PR ID in sequence (RW10000, RW10001, etc.)
export async function generateNextPrId(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the latest PR ID
  const latest = await db
    .select({ prId: pressReleases.prId })
    .from(pressReleases)
    .where(sql`${pressReleases.prId} IS NOT NULL`)
    .orderBy(desc(pressReleases.prId))
    .limit(1);
  
  if (latest.length === 0 || !latest[0].prId) {
    // First PR ID
    return "RW10000";
  }
  
  // Extract number from latest PR ID (e.g., "RW10005" -> 10005)
  const latestNumber = parseInt(latest[0].prId.replace("RW", ""), 10);
  const nextNumber = latestNumber + 1;
  
  return `RW${nextNumber}`;
}

export async function createPressRelease(pressRelease: InsertPressRelease) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate PR ID if not provided
  if (!pressRelease.prId) {
    pressRelease.prId = await generateNextPrId();
  }
  
  await db.insert(pressReleases).values(pressRelease);
  return pressRelease;
}

export async function updatePressRelease(id: string, data: Partial<InsertPressRelease>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pressReleases).set(data).where(eq(pressReleases.id, id));
}

export async function deletePressRelease(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pressReleases).where(eq(pressReleases.id, id));
}

// Media file queries
export async function getPressReleaseMedia(pressReleaseId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaFiles).where(eq(mediaFiles.pressReleaseId, pressReleaseId));
}

export async function createMediaFile(media: InsertMediaFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(mediaFiles).values(media);
  return media;
}

export async function deleteMediaFile(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
}
