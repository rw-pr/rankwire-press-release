import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { generateRSSFeed, submitToXPRMedia } from "./rss";
import { pressReleases } from "../drizzle/schema";
import { getDb, getEntityById } from "./db";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  entities: router({
    list: protectedProcedure.query(({ ctx }) => 
      db.getUserEntities(ctx.user.id)
    ),
    
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const entity = await db.getEntityById(input.id);
        if (!entity || entity.userId !== ctx.user.id) {
          throw new Error("Entity not found");
        }
        return entity;
      }),
    
    create: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        companyAddress: z.string().optional(),
        googleBusinessProfileUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        industry: z.string().optional(),
        prContactFirstName: z.string().optional(),
        prContactLastName: z.string().optional(),
        prEmail: z.string().email().optional(),
        facebookUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        redditUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const entity = {
          id: nanoid(),
          userId: ctx.user.id,
          ...input,
        };
        return db.createEntity(entity);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        companyName: z.string().min(1).optional(),
        companyAddress: z.string().optional(),
        googleBusinessProfileUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        industry: z.string().optional(),
        prContactFirstName: z.string().optional(),
        prContactLastName: z.string().optional(),
        prEmail: z.string().email().optional(),
        facebookUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        redditUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const entity = await db.getEntityById(id);
        if (!entity || entity.userId !== ctx.user.id) {
          throw new Error("Entity not found");
        }
        await db.updateEntity(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const entity = await db.getEntityById(input.id);
        if (!entity || entity.userId !== ctx.user.id) {
          throw new Error("Entity not found");
        }
        await db.deleteEntity(input.id);
        return { success: true };
      }),
  }),

  pressReleases: router({
    list: protectedProcedure.query(({ ctx }) => 
      db.getUserPressReleases(ctx.user.id)
    ),
    
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const pr = await db.getPressReleaseById(input.id);
        if (!pr || pr.userId !== ctx.user.id) {
          throw new Error("Press release not found");
        }
        const media = await db.getPressReleaseMedia(input.id);
        return { ...pr, media };
      }),
    
    create: protectedProcedure
      .input(z.object({
        entityId: z.string().optional(),
        headline: z.string().max(70).min(1),
        subheadline: z.string().max(120).optional(),
        datelineCity: z.string().optional(),
        datelineState: z.string().optional(),
        datelineDate: z.date().optional(),
        leadParagraph: z.string().optional(),
        bodyContent: z.string().optional(),
        boilerplate: z.string().optional(),
        callToAction: z.string().optional(),
        wordCount: z.string().optional(),
        mediaContactName: z.string().optional(),
        mediaContactTitle: z.string().optional(),
        mediaContactEmail: z.string().optional(),
        mediaContactPhone: z.string().optional(),
        mediaContactWebsite: z.string().optional(),
        authorName: z.string().optional(),
        authorTitle: z.string().optional(),
        authorCompany: z.string().optional(),
        authorEmail: z.string().optional(),
        authorSocialHandle: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const pr = {
          id: nanoid(),
          userId: ctx.user.id,
          status: "draft" as const,
          ...input,
        };
        return db.createPressRelease(pr);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        entityId: z.string().optional(),
        headline: z.string().max(70).optional(),
        subheadline: z.string().max(120).optional(),
        datelineCity: z.string().optional(),
        datelineState: z.string().optional(),
        datelineDate: z.date().optional(),
        leadParagraph: z.string().optional(),
        bodyContent: z.string().optional(),
        boilerplate: z.string().optional(),
        callToAction: z.string().optional(),
        wordCount: z.string().optional(),
        mediaContactName: z.string().optional(),
        mediaContactTitle: z.string().optional(),
        mediaContactEmail: z.string().optional(),
        mediaContactPhone: z.string().optional(),
        mediaContactWebsite: z.string().optional(),
        authorName: z.string().optional(),
        authorTitle: z.string().optional(),
        authorCompany: z.string().optional(),
        authorEmail: z.string().optional(),
        authorSocialHandle: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.string().optional(),
        status: z.enum(["draft", "published", "reporting"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const pr = await db.getPressReleaseById(id);
        if (!pr || pr.userId !== ctx.user.id) {
          throw new Error("Press release not found");
        }
        await db.updatePressRelease(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const pr = await db.getPressReleaseById(input.id);
        if (!pr || pr.userId !== ctx.user.id) {
          throw new Error("Press release not found");
        }
        await db.deletePressRelease(input.id);
        return { success: true };
      }),
    
    publish: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const pr = await db.getPressReleaseById(input.id);
        if (!pr || pr.userId !== ctx.user.id) {
          throw new Error("Press release not found");
        }
        await db.updatePressRelease(input.id, { 
          status: "published",
          publishedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  rss: router({
    publicFeed: publicProcedure
      .query(async () => {
        // Get all published press releases from all users
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const allPublished = await db.select().from(pressReleases).where(eq(pressReleases.status, "published"));
        
        // Fetch entities for each press release
        const pressReleasesWithEntities = await Promise.all(
          allPublished.map(async (pr) => {
            const entity = pr.entityId ? await getEntityById(pr.entityId) : null;
            return { ...pr, entity };
          })
        );
        
        const baseUrl = "https://rankwire.ai";
        const rssContent = generateRSSFeed(pressReleasesWithEntities, baseUrl);
        
        return { rssContent };
      }),
    
    generate: protectedProcedure
      .input(z.object({ pressReleaseId: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        let pressReleases;
        
        if (input.pressReleaseId) {
          const pr = await db.getPressReleaseById(input.pressReleaseId);
          if (!pr || pr.userId !== ctx.user.id) {
            throw new Error("Press release not found");
          }
          pressReleases = [pr];
        } else {
          pressReleases = await db.getUserPressReleases(ctx.user.id);
        }
        
        // Fetch entities for each press release
        const pressReleasesWithEntities = await Promise.all(
          pressReleases.map(async (pr) => {
            const entity = pr.entityId ? await db.getEntityById(pr.entityId) : null;
            return { ...pr, entity };
          })
        );
        
        const baseUrl = "https://example.com"; // TODO: Get from env or request
        const rssContent = generateRSSFeed(pressReleasesWithEntities, baseUrl);
        
        return { rssContent };
      }),
    
    submit: protectedProcedure
      .input(z.object({ 
        pressReleaseId: z.string(),
        endpoint: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const pr = await db.getPressReleaseById(input.pressReleaseId);
        if (!pr || pr.userId !== ctx.user.id) {
          throw new Error("Press release not found");
        }
        
        if (pr.status !== "published") {
          throw new Error("Only published press releases can be submitted");
        }
        
        const entity = pr.entityId ? await db.getEntityById(pr.entityId) : null;
        const baseUrl = "https://example.com"; // TODO: Get from env or request
        const rssContent = generateRSSFeed([{ ...pr, entity }], baseUrl);
        
        const result = await submitToXPRMedia(rssContent, input.endpoint);
        
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
