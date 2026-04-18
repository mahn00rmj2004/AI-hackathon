import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { opportunities } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const opportunityRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.opportunities.findMany({
      orderBy: [desc(opportunities.overallScore)],
    });
  }),

  getByProfileId: publicQuery
    .input(z.object({ profileId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.opportunities.findMany({
        where: eq(opportunities.studentProfileId, input.profileId),
        orderBy: [desc(opportunities.overallScore)],
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.opportunities.findFirst({
        where: eq(opportunities.id, input.id),
      });
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "expired", "applied", "saved"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(opportunities)
        .set({ status: input.status })
        .where(eq(opportunities.id, input.id));
      return { success: true };
    }),
});
