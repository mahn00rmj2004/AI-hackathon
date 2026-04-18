import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { studentProfiles } from "@db/schema";
import { eq } from "drizzle-orm";

export const studentProfileRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        degreeProgram: z.string().min(1),
        semester: z.string().min(1),
        cgpa: z.string().optional().nullable(),
        skills: z.string().optional().nullable(),
        interests: z.string().optional().nullable(),
        preferredOpportunityTypes: z.string().optional().nullable(),
        financialNeed: z.enum(["yes", "no", "partial"]),
        locationPreference: z.string().optional().nullable(),
        pastExperience: z.string().optional().nullable(),
        languages: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(studentProfiles).values(input);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.id, input.id),
      });
      return profile ?? null;
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.studentProfiles.findMany({
      orderBy: (profiles, { desc }) => [desc(profiles.createdAt)],
    });
  }),
});
