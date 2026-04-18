import { relations } from "drizzle-orm";
import { studentProfiles, emailAnalyses, opportunities } from "./schema";

export const studentProfilesRelations = relations(studentProfiles, ({ many }) => ({
  opportunities: many(opportunities),
}));

export const emailAnalysesRelations = relations(emailAnalyses, ({ one }) => ({
  opportunity: one(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [opportunities.studentProfileId],
    references: [studentProfiles.id],
  }),
  emailAnalysis: one(emailAnalyses, {
    fields: [opportunities.emailAnalysisId],
    references: [emailAnalyses.id],
  }),
}));
