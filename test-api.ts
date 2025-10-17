import { appRouter } from "./server/routers";
import * as db from "./server/db";

async function testAPI() {
  console.log("Testing Press Release Management API...\n");

  // Mock context for testing
  const mockUser = {
    id: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "oauth",
    role: "user" as const,
    createdAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  try {
    // Test 1: Create an entity
    console.log("1. Creating entity...");
    const entity = await caller.entities.create({
      companyName: "Acme Corporation",
      industry: "Technology",
      websiteUrl: "https://acme.example.com",
      prEmail: "pr@acme.example.com",
      prContactFirstName: "Jane",
      prContactLastName: "Doe",
    });
    console.log("✓ Entity created:", entity.companyName);

    // Test 2: List entities
    console.log("\n2. Listing entities...");
    const entities = await caller.entities.list();
    console.log(`✓ Found ${entities.length} entity(ies)`);

    // Test 3: Create a press release
    console.log("\n3. Creating press release...");
    const pressRelease = await caller.pressReleases.create({
      entityId: entity.id,
      headline: "Acme Corp Unveils AI-Powered Innovation Platform",
      subheadline: "New platform improves delivery efficiency by up to 30 percent",
      datelineCity: "NEW YORK",
      datelineState: "NY",
      datelineDate: new Date(),
      leadParagraph: "Acme Corporation today announced the launch of its revolutionary AI-powered innovation platform designed to transform business operations.",
      bodyContent: "<p>The new platform leverages cutting-edge artificial intelligence to streamline workflows and enhance productivity across enterprise environments.</p><p>\"We're excited to bring this transformative technology to market,\" said Jane Doe, CTO of Acme Corp.</p>",
      boilerplate: "Founded in 2015, Acme Corp develops smart business solutions powered by AI, serving clients across North America.",
      callToAction: "Visit www.acme.example.com/demo to learn more.",
      authorName: "Jane Smith",
      authorEmail: "jane@acme.example.com",
      metaTitle: "Acme Corp Launches AI Innovation Platform",
      keywords: "AI, innovation, technology, business",
    });
    console.log("✓ Press release created:", pressRelease.headline);

    // Test 4: List press releases
    console.log("\n4. Listing press releases...");
    const pressReleases = await caller.pressReleases.list();
    console.log(`✓ Found ${pressReleases.length} press release(s)`);

    // Test 5: Update press release status to published
    console.log("\n5. Publishing press release...");
    await caller.pressReleases.publish({ id: pressRelease.id });
    console.log("✓ Press release published");

    // Test 6: Generate RSS feed
    console.log("\n6. Generating RSS feed...");
    const rss = await caller.rss.generate({ pressReleaseId: pressRelease.id });
    console.log("✓ RSS feed generated");
    console.log("\nRSS Feed Preview:");
    console.log(rss.rssContent.substring(0, 500) + "...");

    // Test 7: Submit to RSS endpoint
    console.log("\n7. Submitting to RSS endpoint...");
    const submitResult = await caller.rss.submit({ pressReleaseId: pressRelease.id });
    console.log(`✓ Submission result: ${submitResult.message}`);

    // Cleanup
    console.log("\n8. Cleaning up test data...");
    await caller.pressReleases.delete({ id: pressRelease.id });
    await caller.entities.delete({ id: entity.id });
    console.log("✓ Test data cleaned up");

    console.log("\n✅ All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testAPI();

