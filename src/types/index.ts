export interface EmailInput {
  subject: string;
  body: string;
  sender?: string;
}

export interface StudentProfileForm {
  fullName: string;
  email: string;
  degreeProgram: string;
  semester: string;
  cgpa: string;
  skills: string;
  interests: string;
  preferredOpportunityTypes: string;
  financialNeed: "yes" | "no" | "partial";
  locationPreference: string;
  pastExperience: string;
  languages: string;
}

export interface AnalysisSummary {
  subject: string;
  isOpportunity: "yes" | "no" | "uncertain";
  confidence: number;
  category: string;
  hasExtractedData: boolean;
}

export interface ProcessResult {
  profileId: number;
  totalEmails: number;
  opportunitiesFound: number;
  nonOpportunities: number;
  opportunities: Array<{
    id: number;
    title: string;
    overallScore: number;
    urgencyLevel: string;
    status: string;
  }>;
  analysis: AnalysisSummary[];
}

export interface ScoredOpportunity {
  id: number;
  title: string;
  organization: string;
  opportunityType: string;
  category: string;
  description: string;
  deadline: string | null;
  deadlineTimestamp: Date | null;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationLink: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  benefits: string[];
  location: string | null;
  isRemote: "yes" | "no" | "hybrid";
  stipend: string | null;
  duration: string | null;
  relevanceScore: number;
  urgencyScore: number;
  completenessScore: number;
  overallScore: number;
  rankingReason: string;
  fitAnalysis: {
    skillMatch: number;
    degreeMatch: number;
    gpaMatch: number;
    locationMatch: number;
    interestMatch: number;
    financialFit: number;
    details: string[];
  };
  actionItems: Array<{
    step: number;
    action: string;
    deadline: string | null;
    priority: "critical" | "high" | "medium" | "low";
  }>;
  urgencyLevel: "critical" | "high" | "medium" | "low";
  daysUntilDeadline: number | null;
  status: string;
}
