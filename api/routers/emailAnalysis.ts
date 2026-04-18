import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { emailAnalyses } from "@db/schema";
import { eq } from "drizzle-orm";

export const emailAnalysisRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        rawEmail: z.string().min(1),
        subject: z.string().optional(),
        sender: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(emailAnalyses).values({
        rawEmail: input.rawEmail,
        subject: input.subject ?? null,
        sender: input.sender ?? null,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.emailAnalyses.findMany({
      orderBy: (analyses, { desc }) => [desc(analyses.createdAt)],
    });
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.emailAnalyses.findFirst({
        where: eq(emailAnalyses.id, input.id),
      });
    }),
});
