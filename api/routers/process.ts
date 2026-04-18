import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { emailAnalyses, opportunities, studentProfiles } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  analyzeEmails,
  type StudentProfile,
} from "../services/aiAnalyzer";

export const processRouter = createRouter({
  // Main pipeline: analyze emails and generate ranked opportunities
  analyze: publicQuery
    .input(
      z.object({
        emails: z.array(
          z.object({
            subject: z.string().min(1),
            body: z.string().min(1),
            sender: z.string().optional(),
          })
        ).min(1).max(15),
        profile: z.object({
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
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Step 1: Save student profile
      const profileResult = await db.insert(studentProfiles).values({
        fullName: input.profile.fullName,
        email: input.profile.email,
        degreeProgram: input.profile.degreeProgram,
        semester: input.profile.semester,
        cgpa: input.profile.cgpa ?? null,
        skills: input.profile.skills ?? null,
        interests: input.profile.interests ?? null,
        preferredOpportunityTypes: input.profile.preferredOpportunityTypes ?? null,
        financialNeed: input.profile.financialNeed,
        locationPreference: input.profile.locationPreference ?? null,
        pastExperience: input.profile.pastExperience ?? null,
        languages: input.profile.languages ?? null,
      });
      const profileId = Number(profileResult[0].insertId);

      // Step 2: Save emails for record
      const emailIds: number[] = [];
      for (const email of input.emails) {
        const emailResult = await db.insert(emailAnalyses).values({
          rawEmail: `${email.subject}\n\n${email.body}`,
          subject: email.subject,
          sender: email.sender ?? null,
          processingStatus: "processing",
        });
        emailIds.push(Number(emailResult[0].insertId));
      }

      // Step 3: Run AI analysis
      const analysisResults = analyzeEmails(input.emails, input.profile as StudentProfile);

      // Step 4: Save opportunities (only real ones)
      const savedOpportunities: Array<{
        id: number;
        title: string;
        overallScore: number;
        urgencyLevel: string;
        status: string;
      }> = [];

      for (let i = 0; i < analysisResults.length; i++) {
        const result = analysisResults[i];
        const emailId = emailIds[i];

        // Update email analysis record
        await db.update(emailAnalyses)
          .set({
            isOpportunity: result.classification.isOpportunity,
            confidence: result.classification.confidence.toFixed(3),
            category: result.classification.category,
            extractedData: result.extracted ? JSON.stringify(result.extracted) : null,
            processingStatus: "completed",
          })
          .where(eq(emailAnalyses.id, emailId));

        // Save opportunity if it's a real opportunity
        if (result.classification.isOpportunity === "yes" && result.scored) {
          const oppResult = await db.insert(opportunities).values({
            emailAnalysisId: emailId,
            studentProfileId: profileId,
            title: result.scored.title,
            organization: result.scored.organization,
            opportunityType: result.scored.opportunityType,
            category: result.scored.category,
            description: result.scored.description,
            deadline: result.scored.deadline,
            deadlineTimestamp: result.scored.deadlineTimestamp,
            eligibilityCriteria: JSON.stringify(result.scored.eligibilityCriteria),
            requiredDocuments: JSON.stringify(result.scored.requiredDocuments),
            applicationLink: result.scored.applicationLink,
            contactEmail: result.scored.contactEmail,
            contactPhone: result.scored.contactPhone,
            benefits: JSON.stringify(result.scored.benefits),
            location: result.scored.location,
            isRemote: result.scored.isRemote,
            stipend: result.scored.stipend,
            duration: result.scored.duration,
            relevanceScore: result.scored.relevanceScore.toFixed(2),
            urgencyScore: result.scored.urgencyScore.toFixed(2),
            completenessScore: result.scored.completenessScore.toFixed(2),
            overallScore: result.scored.overallScore.toFixed(2),
            rankingReason: result.scored.rankingReason,
            fitAnalysis: JSON.stringify(result.scored.fitAnalysis),
            actionItems: JSON.stringify(result.scored.actionItems),
            urgencyLevel: result.scored.urgencyLevel,
            daysUntilDeadline: result.scored.daysUntilDeadline,
            status: "open",
          });

          savedOpportunities.push({
            id: Number(oppResult[0].insertId),
            title: result.scored.title,
            overallScore: result.scored.overallScore,
            urgencyLevel: result.scored.urgencyLevel,
            status: "open",
          });
        }
      }

      // Sort by overall score
      savedOpportunities.sort((a, b) => b.overallScore - a.overallScore);

      return {
        profileId,
        totalEmails: input.emails.length,
        opportunitiesFound: savedOpportunities.length,
        nonOpportunities: analysisResults.filter(r => r.classification.isOpportunity === "no").length,
        opportunities: savedOpportunities,
        analysis: analysisResults.map(r => ({
          subject: r.subject,
          isOpportunity: r.classification.isOpportunity,
          confidence: r.classification.confidence,
          category: r.classification.category,
          hasExtractedData: !!r.extracted,
        })),
      };
    }),

  // Quick analyze without saving (for preview)
  preview: publicQuery
    .input(
      z.object({
        emails: z.array(
          z.object({
            subject: z.string().min(1),
            body: z.string().min(1),
          })
        ).min(1).max(15),
        profile: z.object({
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
        }),
      })
    )
    .mutation(async ({ input }) => {
      const analysisResults = analyzeEmails(input.emails, input.profile as StudentProfile);

      return {
        totalEmails: input.emails.length,
        opportunitiesFound: analysisResults.filter(r => r.classification.isOpportunity === "yes").length,
        nonOpportunities: analysisResults.filter(r => r.classification.isOpportunity === "no").length,
        results: analysisResults.map(r => ({
          subject: r.subject,
          classification: r.classification,
          extracted: r.extracted ? {
            title: r.extracted.title,
            organization: r.extracted.organization,
            opportunityType: r.extracted.opportunityType,
            deadline: r.extracted.deadline,
            requiredDocuments: r.extracted.requiredDocuments,
            applicationLink: r.extracted.applicationLink,
            contactEmail: r.extracted.contactEmail,
            stipend: r.extracted.stipend,
            location: r.extracted.location,
            isRemote: r.extracted.isRemote,
          } : null,
          scored: r.scored ? {
            relevanceScore: r.scored.relevanceScore,
            urgencyScore: r.scored.urgencyScore,
            completenessScore: r.scored.completenessScore,
            overallScore: r.scored.overallScore,
            urgencyLevel: r.scored.urgencyLevel,
            daysUntilDeadline: r.scored.daysUntilDeadline,
            rankingReason: r.scored.rankingReason,
            fitAnalysis: r.scored.fitAnalysis,
            actionItems: r.scored.actionItems,
          } : null,
        })),
      };
    }),
});

