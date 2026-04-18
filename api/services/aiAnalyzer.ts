// AI-Powered Opportunity Analysis Engine
// Handles classification, extraction, scoring, and ranking

// Types for extracted data
export interface ExtractedOpportunity {
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
  confidence: number;
}

export interface StudentProfile {
  id?: number;
  fullName: string;
  email: string;
  degreeProgram: string;
  semester: string;
  cgpa?: string | null;
  skills?: string | null;
  interests?: string | null;
  preferredOpportunityTypes?: string | null;
  financialNeed: "yes" | "no" | "partial";
  locationPreference?: string | null;
  pastExperience?: string | null;
  languages?: string | null;
}

export interface FitAnalysis {
  skillMatch: number;
  degreeMatch: number;
  gpaMatch: number;
  locationMatch: number;
  interestMatch: number;
  financialFit: number;
  details: string[];
}

export interface ActionItem {
  step: number;
  action: string;
  deadline: string | null;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ScoredOpportunity extends ExtractedOpportunity {
  relevanceScore: number;
  urgencyScore: number;
  completenessScore: number;
  overallScore: number;
  rankingReason: string;
  fitAnalysis: FitAnalysis;
  actionItems: ActionItem[];
  urgencyLevel: "critical" | "high" | "medium" | "low";
  daysUntilDeadline: number | null;
}

// ===== 1. CLASSIFICATION =====

const OPPORTUNITY_KEYWORDS = [
  "scholarship", "fellowship", "internship", "research", "assistantship",
  "grant", "funding", "stipend", "application", "apply", "deadline",
  "program", "opportunity", "position", "opening", "vacancy", "competition",
  "hackathon", "conference", "workshop", "training", "course", "certification",
  "job", "employment", "career", "placement", "fellow", "undergraduate",
  "graduate", "phd", "master", "mba", "enrollment", "admission",
  "exchange", "study abroad", "volunteer", "mentorship", "leadership",
  "award", "prize", "fellowship", "full-time", "part-time", "remote",
  "on-campus", "off-campus", "summer", "winter", "semester",
];

const SPAM_INDICATORS = [
  "unsubscribe", "promotional", "advertisement", "sale", "discount",
  "limited time offer", "buy now", "click here to win", "you won",
  "lottery", "free gift", "act now", "exclusive deal", "order now",
  "special promotion", "marketing", "newsletter subscription",
];

export function classifyEmail(subject: string, body: string): {
  isOpportunity: "yes" | "no" | "uncertain";
  confidence: number;
  category: string;
} {
  const text = (subject + " " + body).toLowerCase();

  // Count opportunity keywords
  let oppScore = 0;
  let matchedKeywords: string[] = [];
  for (const kw of OPPORTUNITY_KEYWORDS) {
    if (text.includes(kw)) {
      oppScore += 1;
      matchedKeywords.push(kw);
    }
  }

  // Count spam indicators
  let spamScore = 0;
  for (const indicator of SPAM_INDICATORS) {
    if (text.includes(indicator)) {
      spamScore += 2;
    }
  }

  // Normalize
  const normalizedOppScore = Math.min(oppScore / 3, 5); // max 5
  const normalizedSpamScore = Math.min(spamScore, 5); // max 5

  // Decision
  if (normalizedOppScore > 2 && normalizedSpamScore < 2) {
    return {
      isOpportunity: "yes",
      confidence: Math.min(0.5 + normalizedOppScore * 0.1, 0.98),
      category: detectCategory(matchedKeywords),
    };
  } else if (normalizedOppScore <= 1 || normalizedSpamScore >= 3) {
    return {
      isOpportunity: "no",
      confidence: Math.min(0.5 + Math.max(normalizedSpamScore, 5 - normalizedOppScore) * 0.1, 0.98),
      category: "non-opportunity",
    };
  } else {
    return {
      isOpportunity: "uncertain",
      confidence: 0.5,
      category: detectCategory(matchedKeywords),
    };
  }
}

function detectCategory(keywords: string[]): string {
  if (keywords.some(k => ["scholarship", "fellowship", "grant", "funding", "stipend"].includes(k))) {
    return "scholarship";
  }
  if (keywords.some(k => ["internship", "assistantship", "research"].includes(k))) {
    return "internship";
  }
  if (keywords.some(k => ["job", "employment", "career", "position", "opening"].includes(k))) {
    return "job";
  }
  if (keywords.some(k => ["hackathon", "competition", "award", "prize"].includes(k))) {
    return "competition";
  }
  if (keywords.some(k => ["conference", "workshop", "training", "course", "certification"].includes(k))) {
    return "event";
  }
  if (keywords.some(k => ["admission", "enrollment", "program", "study abroad", "exchange"].includes(k))) {
    return "admission";
  }
  return "general";
}

// ===== 2. FIELD EXTRACTION =====

export function extractFields(subject: string, body: string): ExtractedOpportunity {
  const fullText = subject + "\n" + body;
  const lowerText = fullText.toLowerCase();

  // Title extraction
  const title = extractTitle(subject, body);

  // Organization extraction
  const organization = extractOrganization(fullText);

  // Deadline extraction
  const { deadline, deadlineTimestamp } = extractDeadline(fullText);

  // Required documents
  const requiredDocuments = extractRequiredDocuments(fullText);

  // Eligibility criteria
  const eligibilityCriteria = extractEligibility(fullText);

  // Application link
  const applicationLink = extractUrls(fullText);

  // Contact email
  const contactEmail = extractEmail(fullText);

  // Contact phone
  const contactPhone = extractPhone(fullText);

  // Benefits
  const benefits = extractBenefits(fullText);

  // Location
  const { location, isRemote } = extractLocation(fullText);

  // Stipend/Salary
  const stipend = extractStipend(fullText);

  // Duration
  const duration = extractDuration(fullText);

  // Description
  const description = generateDescription(fullText, title);

  // Opportunity type
  const opportunityType = detectOpportunityType(lowerText);

  // Category
  const category = detectCategoryFromText(lowerText);

  // Calculate confidence based on extracted fields
  const filledFields = [
    title, deadline, organization, applicationLink,
    eligibilityCriteria.length > 0,
    requiredDocuments.length > 0,
    contactEmail,
  ].filter(Boolean).length;
  const confidence = Math.min(0.6 + (filledFields / 10) * 0.35, 0.98);

  return {
    title,
    organization,
    opportunityType,
    category,
    description,
    deadline,
    deadlineTimestamp,
    eligibilityCriteria,
    requiredDocuments,
    applicationLink,
    contactEmail,
    contactPhone,
    benefits,
    location,
    isRemote,
    stipend,
    duration,
    confidence,
  };
}

function extractTitle(subject: string, body: string): string {
  // Use subject line first, clean it up
  let title = subject.replace(/^(Re:|Fwd?:|FW:|RE:)\s*/i, "").trim();

  if (!title || title.length < 5) {
    // Extract from first sentence of body
    const sentences = body.split(/[.!?\n]/);
    title = sentences[0]?.trim().substring(0, 100) || "Untitled Opportunity";
  }

  return title.length > 150 ? title.substring(0, 150) + "..." : title;
}

function extractOrganization(text: string): string {
  // Common patterns
  const patterns = [
    /(?:from|by|at|organized by|hosted by)\s+([A-Z][A-Za-z0-9\s&.,]+?(?:University|College|Institute|Center|Centre|Foundation|Organization|Corporation|Inc\.|Ltd\.|Company|Association|Agency|Department|Ministry|Lab|School))/i,
    /([A-Z][A-Za-z0-9\s&.,]+?(?:University|College|Institute|Center|Centre|Foundation))/,
    /^From:\s*([^<\n]+)/im,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }

  return "Unknown Organization";
}

function extractDeadline(text: string): { deadline: string | null; deadlineTimestamp: Date | null } {
  const patterns = [
    /(?:deadline|due date|apply by|submission date|closes? on|expires? on|last date)\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /(?:deadline|due date)\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(?:apply|submit)\s+before\s+([A-Za-z]+\s+\d{1,2},?\s*\d{4}?)/i,
    /(?:by|before)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\s*(?:deadline|due date)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const deadlineStr = match[1].trim();
      const timestamp = parseDate(deadlineStr);
      return { deadline: deadlineStr, deadlineTimestamp: timestamp };
    }
  }

  // Look for relative dates
  const relativePatterns = [
    /deadline.*?(\d+)\s+days?\s+from\s+now/i,
    /apply\s+within\s+(\d+)\s+days/i,
  ];

  for (const pattern of relativePatterns) {
    const match = text.match(pattern);
    if (match) {
      const days = parseInt(match[1]);
      const date = new Date();
      date.setDate(date.getDate() + days);
      return { deadline: date.toDateString(), deadlineTimestamp: date };
    }
  }

  return { deadline: null, deadlineTimestamp: null };
}

function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  return null;
}

function extractRequiredDocuments(text: string): string[] {
  const lowerText = text.toLowerCase();
  const documents: string[] = [];

  const docPatterns: [string, RegExp][] = [
    ["Resume/CV", /\b(?:resume|cv|curriculum vitae)\b/i],
    ["Transcript", /\b(?:transcript|academic record|grade report)\b/i],
    ["Cover Letter", /\b(?:cover letter|motivation letter|statement of purpose|sop)\b/i],
    ["Recommendation Letter", /\b(?:recommendation|reference letter|lor)\b/i],
    ["Portfolio", /\b(?:portfolio|work sample|project sample)\b/i],
    ["Personal Statement", /\b(?:personal statement|essay|writing sample)\b/i],
    ["ID Proof", /\b(?:id proof|passport|national id|id card)\b/i],
    ["Application Form", /\b(?:application form|online form|google form)\b/i],
    ["CGPA/Grades", /\b(?:cgpa|gpa|grade|academic standing)\b/i],
    ["Research Proposal", /\b(?:research proposal|project proposal|study plan)\b/i],
    ["Certificates", /\b(?:certificate|certification|diploma)\b/i],
  ];

  for (const [doc, pattern] of docPatterns) {
    if (pattern.test(lowerText)) {
      documents.push(doc);
    }
  }

  return documents;
}

function extractEligibility(text: string): string[] {
  const criteria: string[] = [];
  const lowerText = text.toLowerCase();

  // CGPA requirements
  const gpaMatch = lowerText.match(/(?:minimum\s+)?(?:cgpa|gpa)\s*(?:of\s+)?([0-4]\.\d+)/i);
  if (gpaMatch) {
    criteria.push(`Minimum CGPA: ${gpaMatch[1]}`);
  }

  // Year/Semester requirements
  const yearPatterns = [
    /(first|second|third|fourth|final)\s+year/i,
    /(undergraduate|graduate|postgraduate|phd|master)/i,
    /(\d+)(?:st|nd|rd|th)\s+(year|semester)/i,
  ];

  for (const pattern of yearPatterns) {
    const match = lowerText.match(pattern);
    if (match && !criteria.some(c => c.includes(match[1]))) {
      criteria.push(`Target: ${match[0]}`);
    }
  }

  // Major/Field requirements
  const majorMatch = lowerText.match(/(?:major|field|background|discipline)\s+(?:in|of)\s+([A-Za-z\s]+?)(?:\s|,|\.|;)/i);
  if (majorMatch) {
    criteria.push(`Field: ${majorMatch[1].trim()}`);
  }

  // Language requirements
  if (/\b(?:ielts|toefl|english proficiency|language test)\b/i.test(lowerText)) {
    criteria.push("English proficiency required (IELTS/TOEFL)");
  }

  // Nationality/Location
  const nationalityMatch = lowerText.match(/(?:citizen|national|resident)\s+(?:of|from)\s+([A-Za-z\s]+?)(?:\s|,|\.|;)/i);
  if (nationalityMatch) {
    criteria.push(`Eligibility: ${nationalityMatch[0]}`);
  }

  return criteria;
}

function extractUrls(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s\)\]\>,]+/gi;
  const matches = text.match(urlPattern);
  if (matches) {
    // Filter out tracking pixels and common non-application URLs
    const filtered = matches.filter(url =>
      !url.includes("unsubscribe") &&
      !url.includes("tracking") &&
      !url.includes("pixel") &&
      !url.includes("google-analytics")
    );
    return filtered[0] || null;
  }
  return null;
}

function extractEmail(text: string): string | null {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailPattern);
  if (matches) {
    // Filter out noreply and similar
    const filtered = matches.filter(e =>
      !e.includes("noreply") &&
      !e.includes("no-reply") &&
      !e.includes("donotreply")
    );
    return filtered[0] || null;
  }
  return null;
}

function extractPhone(text: string): string | null {
  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const match = text.match(phonePattern);
  return match ? match[0] : null;
}

function extractBenefits(text: string): string[] {
  const benefits: string[] = [];
  const lowerText = text.toLowerCase();

  const benefitPatterns: [string, RegExp][] = [
    ["Stipend/Salary", /\$[\d,]+(?:\s*(?:per\/)?\s*(?:month|year|semester|annum))?|\b(?:stipend|salary|compensation|honorarium)\b/i],
    ["Certificate", /\b(?:certificate|certification|completion certificate)\b/i],
    ["Networking", /\b(?:networking|network|connections|mentorship)\b/i],
    ["Travel Support", /\b(?:travel|accommodation|lodging|housing)\b/i],
    ["Meals", /\b(?:meal|lunch|refreshment|food)\b/i],
    ["Research Experience", /\b(?:research experience|publication|paper)\b/i],
    ["Career Development", /\b(?:career|professional development|skill building)\b/i],
  ];

  for (const [benefit, pattern] of benefitPatterns) {
    if (pattern.test(lowerText)) {
      benefits.push(benefit);
    }
  }

  return benefits;
}

function extractLocation(text: string): { location: string | null; isRemote: "yes" | "no" | "hybrid" } {
  const lowerText = text.toLowerCase();

  // Check for remote/hybrid
  if (/\bremote\b/.test(lowerText) && /\bon-?site|on-?campus|in-?person\b/.test(lowerText)) {
    return { location: extractLocationName(text), isRemote: "hybrid" };
  }
  if (/\bremote\b/.test(lowerText)) {
    return { location: "Remote", isRemote: "yes" };
  }

  return { location: extractLocationName(text), isRemote: "no" };
}

function extractLocationName(text: string): string | null {
  const locationPatterns = [
    /(?:location|place|venue|based in|located in|at)\s*[:\-]?\s*([A-Za-z\s,]+(?:University|College|Center|Centre|City|State|Country))/i,
    /(?:location|place|venue)\s*[:\-]?\s*([A-Za-z\s,]+?)(?:\n|\.|,\s*\n|$)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }

  return null;
}

function extractStipend(text: string): string | null {
  const patterns = [
    /(?:stipend|salary|compensation|award)\s*(?:of\s+)?[:\-]?\s*([$€£]?[\d,]+(?:\s*(?:per\/)?\s*(?:month|year|semester|annum|mo|yr))?)/i,
    /([$€£][\d,]+\s*(?:per|\/)\s*(?:month|year|semester))/i,
    /(?:stipend|salary)\s+\$?([\d,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Check for "paid" or "unpaid"
  if (/\bpaid\b/i.test(text)) return "Paid";
  if (/\bunpaid\b/i.test(text)) return "Unpaid";

  return null;
}

function extractDuration(text: string): string | null {
  const patterns = [
    /(?:duration|period|term|length)\s*[:\-]?\s*(\d+\s*(?:weeks?|months?|years?|semesters?|days?))/i,
    /(\d+\s*(?:weeks?|months?|years?|semesters?))\s*(?:duration|program|internship)/i,
    /(?:summer|winter|fall|spring)\s+(\d{4})\s+(?:semester|term|program)/i,
    /(?:\d+\s*-\s*\d+)\s*(?:weeks?|months?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function generateDescription(text: string, title: string): string {
  // Extract first meaningful paragraph
  const paragraphs = text.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed.length > 50 && trimmed.length < 500 && !trimmed.includes("From:") && !trimmed.includes("Subject:")) {
      return trimmed.substring(0, 400);
    }
  }
  return `Opportunity: ${title}`;
}

function detectOpportunityType(text: string): string {
  if (/\bscholarship\b/.test(text)) return "Scholarship";
  if (/\bfellowship\b/.test(text)) return "Fellowship";
  if (/\binternship\b/.test(text)) return "Internship";
  if (/\bresearch\b/.test(text)) return "Research";
  if (/\b(job|employment|hiring|position)\b/.test(text)) return "Job";
  if (/\b(hackathon|competition|contest)\b/.test(text)) return "Competition";
  if (/\b(conference|workshop|seminar|event)\b/.test(text)) return "Event";
  if (/\b(grant|funding)\b/.test(text)) return "Grant";
  if (/\b(program|course|certification)\b/.test(text)) return "Program";
  return "Opportunity";
}

function detectCategoryFromText(text: string): string {
  if (/\bscholarship\b/.test(text)) return "scholarship";
  if (/\bfellowship\b/.test(text)) return "fellowship";
  if (/\binternship\b/.test(text)) return "internship";
  if (/\bresearch\b/.test(text)) return "research";
  if (/\b(job|employment|hiring)\b/.test(text)) return "job";
  if (/\b(hackathon|competition)\b/.test(text)) return "competition";
  if (/\b(conference|workshop|event)\b/.test(text)) return "event";
  return "general";
}

// ===== 3. SCORING & RANKING =====

export function scoreOpportunity(
  opp: ExtractedOpportunity,
  profile: StudentProfile,
): ScoredOpportunity {
  const fitAnalysis = calculateFit(opp, profile);
  const urgencyScore = calculateUrgency(opp);
  const completenessScore = calculateCompleteness(opp);
  const relevanceScore = calculateRelevance(fitAnalysis);

  // Weighted overall score
  const overallScore =
    relevanceScore * 0.4 +
    urgencyScore * 0.3 +
    completenessScore * 0.2 +
    opp.confidence * 10 * 0.1;

  const daysUntilDeadline = calculateDaysUntilDeadline(opp.deadlineTimestamp);
  const urgencyLevel = determineUrgencyLevel(daysUntilDeadline);

  const rankingReason = generateRankingReason(opp, fitAnalysis, urgencyLevel, relevanceScore);
  const actionItems = generateActionItems(opp, daysUntilDeadline);

  return {
    ...opp,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    urgencyScore: Math.round(urgencyScore * 100) / 100,
    completenessScore: Math.round(completenessScore * 100) / 100,
    overallScore: Math.round(overallScore * 100) / 100,
    rankingReason,
    fitAnalysis,
    actionItems,
    urgencyLevel,
    daysUntilDeadline,
  };
}

function calculateFit(opp: ExtractedOpportunity, profile: StudentProfile): FitAnalysis {
  const details: string[] = [];

  // Skill match
  let skillMatch = 0;
  if (profile.skills) {
    const profileSkills = profile.skills.toLowerCase().split(/[,;]/);
    const oppText = (opp.description + " " + opp.title + " " + opp.eligibilityCriteria.join(" ")).toLowerCase();
    let matchedSkills = 0;
    for (const skill of profileSkills) {
      const trimmedSkill = skill.trim();
      if (trimmedSkill.length > 2 && oppText.includes(trimmedSkill)) {
        matchedSkills++;
      }
    }
    skillMatch = Math.min((matchedSkills / Math.max(profileSkills.length, 1)) * 100, 100);
    if (skillMatch > 30) {
      details.push(`Skills match: ${Math.round(skillMatch)}% aligned with your profile`);
    }
  }

  // Degree match
  let degreeMatch = 0;
  if (profile.degreeProgram) {
    const degreeText = (opp.eligibilityCriteria.join(" ") + " " + opp.title).toLowerCase();
    const profileDegree = profile.degreeProgram.toLowerCase();
    if (degreeText.includes(profileDegree) || profileDegree.includes("computer") && /\b(cs|computer science|software|programming)\b/i.test(opp.title + " " + opp.description)) {
      degreeMatch = 85;
      details.push("Your degree program matches the requirements");
    } else if (/\b(any|all|open to)\b/i.test(opp.eligibilityCriteria.join(" "))) {
      degreeMatch = 70;
      details.push("Open to all degree programs");
    } else {
      degreeMatch = 40;
    }
  }

  // GPA match
  let gpaMatch = 100;
  const gpaReq = extractGpaRequirement(opp.eligibilityCriteria);
  if (gpaReq && profile.cgpa) {
    const studentGpa = parseFloat(profile.cgpa);
    if (studentGpa >= gpaReq) {
      gpaMatch = 100;
      details.push(`Your CGPA (${profile.cgpa}) meets the requirement (${gpaReq})`);
    } else {
      gpaMatch = Math.max(0, 100 - (gpaReq - studentGpa) * 50);
      details.push(`Your CGPA (${profile.cgpa}) is below the requirement (${gpaReq})`);
    }
  }

  // Location match
  let locationMatch = 50;
  if (profile.locationPreference && opp.location) {
    if (profile.locationPreference.toLowerCase().includes(opp.location.toLowerCase()) ||
        opp.location.toLowerCase().includes(profile.locationPreference.toLowerCase())) {
      locationMatch = 100;
      details.push("Location preference matches");
    } else if (opp.isRemote === "yes") {
      locationMatch = 90;
      details.push("Remote opportunity - no location constraint");
    }
  } else if (opp.isRemote === "yes") {
    locationMatch = 90;
    details.push("Remote opportunity");
  }

  // Interest match
  let interestMatch = 0;
  if (profile.interests) {
    const interests = profile.interests.toLowerCase().split(/[,;]/);
    const oppText = (opp.title + " " + opp.description + " " + opp.category).toLowerCase();
    let matchedInterests = 0;
    for (const interest of interests) {
      const trimmed = interest.trim();
      if (trimmed.length > 2 && oppText.includes(trimmed)) {
        matchedInterests++;
      }
    }
    interestMatch = Math.min((matchedInterests / Math.max(interests.length, 1)) * 100, 100);
    if (interestMatch > 20) {
      details.push(`Interest alignment: ${Math.round(interestMatch)}% match`);
    }
  }

  // Financial fit
  let financialFit = 50;
  if (profile.financialNeed === "yes" && opp.stipend) {
    financialFit = 100;
    details.push("Stipend available - matches your financial need");
  } else if (profile.financialNeed === "yes" && opp.opportunityType === "Scholarship") {
    financialFit = 100;
    details.push("Scholarship opportunity - aligns with financial need");
  } else if (profile.financialNeed === "no" && !opp.stipend) {
    financialFit = 80;
  }

  return {
    skillMatch: Math.round(skillMatch),
    degreeMatch,
    gpaMatch: Math.round(gpaMatch),
    locationMatch,
    interestMatch: Math.round(interestMatch),
    financialFit,
    details,
  };
}

function extractGpaRequirement(criteria: string[]): number | null {
  for (const criterion of criteria) {
    const match = criterion.match(/([0-4]\.\d+)/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return null;
}

function calculateUrgency(opp: ExtractedOpportunity): number {
  if (!opp.deadlineTimestamp) {
    return 30; // No deadline = lower urgency
  }

  const now = new Date();
  const diffMs = opp.deadlineTimestamp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 100;
  if (diffDays <= 3) return 95;
  if (diffDays <= 7) return 85;
  if (diffDays <= 14) return 70;
  if (diffDays <= 30) return 50;
  if (diffDays <= 60) return 35;
  return 20;
}

function calculateCompleteness(opp: ExtractedOpportunity): number {
  let score = 0;
  const fields = [
    opp.title,
    opp.organization,
    opp.deadline,
    opp.description,
    opp.applicationLink,
    opp.contactEmail,
    opp.eligibilityCriteria.length > 0,
    opp.requiredDocuments.length > 0,
  ];

  score = (fields.filter(Boolean).length / fields.length) * 100;

  // Bonus for having action items
  if (opp.requiredDocuments.length > 0) score += 5;
  if (opp.benefits.length > 0) score += 3;

  return Math.min(score, 100);
}

function calculateRelevance(fit: FitAnalysis): number {
  return (
    fit.skillMatch * 0.25 +
    fit.degreeMatch * 0.2 +
    fit.gpaMatch * 0.2 +
    fit.locationMatch * 0.15 +
    fit.interestMatch * 0.1 +
    fit.financialFit * 0.1
  );
}

function calculateDaysUntilDeadline(deadline: Date | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function determineUrgencyLevel(days: number | null): "critical" | "high" | "medium" | "low" {
  if (days === null) return "medium";
  if (days <= 3) return "critical";
  if (days <= 7) return "high";
  if (days <= 30) return "medium";
  return "low";
}

function generateRankingReason(
  opp: ExtractedOpportunity,
  fit: FitAnalysis,
  urgency: "critical" | "high" | "medium" | "low",
  relevance: number,
): string {
  const parts: string[] = [];

  // Urgency part
  if (urgency === "critical") {
    parts.push(`Deadline approaching ${opp.deadline ? `(${opp.deadline})` : ""}`);
  } else if (urgency === "high") {
    parts.push(`Apply soon - deadline is ${opp.deadline}`);
  }

  // Fit part
  if (relevance > 75) {
    parts.push("Strong profile match");
  } else if (relevance > 50) {
    parts.push("Good profile alignment");
  }

  // Specific fit details
  if (fit.skillMatch > 50) parts.push("Your skills align well");
  if (fit.degreeMatch > 70) parts.push("Degree requirement met");
  if (fit.gpaMatch === 100) parts.push("CGPA requirement satisfied");

  return parts.join(". ") || "Review and evaluate this opportunity";
}

function generateActionItems(opp: ExtractedOpportunity, daysUntil: number | null): ActionItem[] {
  const items: ActionItem[] = [];
  let step = 1;

  // Priority based on deadline
  const priority: "critical" | "high" | "medium" | "low" =
    daysUntil !== null && daysUntil <= 3 ? "critical" :
    daysUntil !== null && daysUntil <= 7 ? "high" :
    daysUntil !== null && daysUntil <= 30 ? "medium" : "low";

  items.push({
    step: step++,
    action: `Review opportunity: "${opp.title}"`,
    deadline: null,
    priority: "high",
  });

  if (opp.applicationLink) {
    items.push({
      step: step++,
      action: `Visit application portal: ${opp.applicationLink}`,
      deadline: daysUntil !== null ? `${daysUntil} days` : null,
      priority: "critical",
    });
  }

  // Document preparation
  if (opp.requiredDocuments.length > 0) {
    const docs = opp.requiredDocuments.join(", ");
    items.push({
      step: step++,
      action: `Prepare documents: ${docs}`,
      deadline: daysUntil !== null && daysUntil > 7 ? `${daysUntil - 3} days` : null,
      priority,
    });
  }

  // Eligibility check
  if (opp.eligibilityCriteria.length > 0) {
    items.push({
      step: step++,
      action: "Verify you meet all eligibility criteria",
      deadline: null,
      priority: "high",
    });
  }

  // Contact
  if (opp.contactEmail) {
    items.push({
      step: step++,
      action: `Reach out to ${opp.contactEmail} for queries`,
      deadline: null,
      priority: "medium",
    });
  }

  // Submit
  items.push({
    step: step++,
    action: "Submit application before deadline",
    deadline: daysUntil !== null ? `${daysUntil} days` : null,
    priority: "critical",
  });

  return items;
}

// ===== 4. MAIN PIPELINE =====

export interface AnalysisResult {
  emailIndex: number;
  subject: string;
  classification: {
    isOpportunity: "yes" | "no" | "uncertain";
    confidence: number;
    category: string;
  };
  extracted: ExtractedOpportunity | null;
  scored: ScoredOpportunity | null;
}

export function analyzeEmails(
  emails: { subject: string; body: string; sender?: string }[],
  profile: StudentProfile,
): AnalysisResult[] {
  return emails.map((email, index) => {
    // Step 1: Classify
    const classification = classifyEmail(email.subject, email.body);

    if (classification.isOpportunity === "no") {
      return {
        emailIndex: index,
        subject: email.subject,
        classification,
        extracted: null,
        scored: null,
      };
    }

    // Step 2: Extract fields
    const extracted = extractFields(email.subject, email.body);

    // Step 3: Score against profile
    const scored = scoreOpportunity(extracted, profile);

    return {
      emailIndex: index,
      subject: email.subject,
      classification,
      extracted,
      scored,
    };
  });
}
