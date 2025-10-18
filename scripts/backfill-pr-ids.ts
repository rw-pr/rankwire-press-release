import { drizzle } from "drizzle-orm/mysql2";
import { pressReleases } from "../drizzle/schema";
import { eq, sql, asc } from "drizzle-orm";

async function backfillPrIds() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const db = drizzle(DATABASE_URL);

  try {
    // Get all press releases without PR IDs, ordered by creation date
    console.log("Fetching press releases without PR IDs...");
    const prsWithoutIds = await db
      .select()
      .from(pressReleases)
      .where(sql`${pressReleases.prId} IS NULL`)
      .orderBy(asc(pressReleases.createdAt));

    console.log(`Found ${prsWithoutIds.length} press releases without PR IDs`);

    if (prsWithoutIds.length === 0) {
      console.log("No press releases need PR IDs. Exiting.");
      return;
    }

    // Get the highest existing PR ID to continue from there
    const latestWithId = await db
      .select({ prId: pressReleases.prId })
      .from(pressReleases)
      .where(sql`${pressReleases.prId} IS NOT NULL`)
      .orderBy(sql`${pressReleases.prId} DESC`)
      .limit(1);

    let nextNumber = 10000; // Start from RW10000
    
    if (latestWithId.length > 0 && latestWithId[0].prId) {
      // Extract number and increment
      const latestNumber = parseInt(latestWithId[0].prId.replace("RW", ""), 10);
      nextNumber = latestNumber + 1;
      console.log(`Latest PR ID found: ${latestWithId[0].prId}, starting from RW${nextNumber}`);
    } else {
      console.log(`No existing PR IDs found, starting from RW${nextNumber}`);
    }

    // Assign PR IDs to all press releases without them
    console.log("Assigning PR IDs...");
    for (const pr of prsWithoutIds) {
      const prId = `RW${nextNumber}`;
      console.log(`  Assigning ${prId} to press release ${pr.id} (${pr.headline})`);
      
      await db
        .update(pressReleases)
        .set({ prId })
        .where(eq(pressReleases.id, pr.id));
      
      nextNumber++;
    }

    console.log(`Successfully assigned PR IDs to ${prsWithoutIds.length} press releases`);
    console.log(`Next available PR ID: RW${nextNumber}`);
    
  } catch (error) {
    console.error("Error during backfill:", error);
    process.exit(1);
  }
}

// Run the backfill
backfillPrIds()
  .then(() => {
    console.log("Backfill completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });

