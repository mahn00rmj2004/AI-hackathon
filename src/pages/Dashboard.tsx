import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  MapPin,
  Mail,
  FileText,
  Award,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Loader2,
  Filter,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function Dashboard() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: opportunities, isLoading } = trpc.opportunities.list.useQuery();

  const utils = trpc.useUtils();
  const updateStatus = trpc.opportunities.updateStatus.useMutation({
    onSuccess: () => {
      utils.opportunities.list.invalidate();
      toast.success("Status updated!");
    },
  });

  // Group opportunities by category
  const filteredOpps = opportunities?.filter(o =>
    filterType === "all" || o.category === filterType
  ) || [];

  const categories = [...new Set(opportunities?.map(o => o.category).filter((c): c is string => c !== null) || [])];

  // Stats
  const stats = {
    total: opportunities?.length || 0,
    critical: opportunities?.filter(o => o.urgencyLevel === "critical").length || 0,
    high: opportunities?.filter(o => o.urgencyLevel === "high").length || 0,
    avgScore: opportunities?.length
      ? Math.round(
          (opportunities.reduce((acc, o) => acc + Number(o.overallScore), 0) / opportunities.length) * 10
        ) / 10
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto" />
          <p className="text-lg text-slate-600">Loading your opportunities...</p>
        </div>
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Opportunities Yet</h2>
            <p className="text-slate-600 mb-6">
              Go back and analyze some emails to discover your personalized opportunities.
            </p>
            <Link to="/">
              <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                <ArrowLeft className="w-4 h-4" />
                Analyze Emails
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Opportunity Dashboard
            </span>
          </h1>
          <p className="text-slate-600 mt-1">
            AI-ranked opportunities based on your profile and urgency
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Opportunities</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical Urgency</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">High Priority</p>
                <p className="text-3xl font-bold text-amber-600">{stats.high}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Score</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.avgScore}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <Badge
          variant={filterType === "all" ? "default" : "outline"}
          className="cursor-pointer hover:bg-violet-100"
          onClick={() => setFilterType("all")}
        >
          All ({opportunities.length})
        </Badge>
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={filterType === cat ? "default" : "outline"}
            className="cursor-pointer capitalize hover:bg-violet-100"
            onClick={() => setFilterType(cat)}
          >
            {cat} ({opportunities.filter(o => o.category === cat).length})
          </Badge>
        ))}
      </div>

      {/* Ranked Opportunities List */}
      <div className="space-y-4">
        {filteredOpps.map((opp, index) => {
          const isSelected = selectedOpportunity === opp.id;
          const fitData = opp.fitAnalysis ? JSON.parse(opp.fitAnalysis as string) : null;
          const actionItems = opp.actionItems ? JSON.parse(opp.actionItems as string) : [];
          const eligibility = opp.eligibilityCriteria ? JSON.parse(opp.eligibilityCriteria as string) : [];
          const documents = opp.requiredDocuments ? JSON.parse(opp.requiredDocuments as string) : [];
          const benefits = opp.benefits ? JSON.parse(opp.benefits as string) : [];

          return (
            <Card
              key={opp.id}
              className={`border transition-all ${
                isSelected
                  ? "border-violet-400 shadow-lg shadow-violet-100"
                  : "border-slate-200 hover:border-violet-300"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Rank */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-amber-100 text-amber-700"
                          : index === 1
                          ? "bg-slate-200 text-slate-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">{opp.title}</h3>
                        <UrgencyBadge level={opp.urgencyLevel as "critical" | "high" | "medium" | "low"} />
                        <TypeBadge type={opp.opportunityType} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{opp.organization}</p>

                      {/* Score Bar */}
                      <div className="flex items-center gap-4 mt-3">
                        <ScorePill
                          label="Relevance"
                          score={Number(opp.relevanceScore)}
                          color="bg-emerald-500"
                        />
                        <ScorePill
                          label="Urgency"
                          score={Number(opp.urgencyScore)}
                          color="bg-red-500"
                        />
                        <ScorePill
                          label="Complete"
                          score={Number(opp.completenessScore)}
                          color="bg-blue-500"
                        />
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-2xl font-bold text-violet-700">
                            {opp.overallScore}
                          </span>
                          <span className="text-xs text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOpportunity(isSelected ? null : opp.id)}
                    className="ml-2"
                  >
                    {isSelected ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Quick Info Row */}
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 flex-wrap">
                  {opp.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Due: {opp.deadline}
                    </span>
                  )}
                  {opp.daysUntilDeadline !== null && (
                    <span
                      className={`font-medium ${
                        opp.daysUntilDeadline <= 3
                          ? "text-red-600"
                          : opp.daysUntilDeadline <= 7
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {opp.daysUntilDeadline} days left
                    </span>
                  )}
                  {opp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {opp.location}
                    </span>
                  )}
                  {opp.stipend && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-slate-400" />
                      {opp.stipend}
                    </span>
                  )}
                  {opp.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {opp.duration}
                    </span>
                  )}
                  <StatusBadge status={opp.status || "open"} />
                </div>

                {/* Ranking Reason */}
                <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-violet-800">{opp.rankingReason || "Review this opportunity"}</p>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Details */}
              {isSelected && (
                <CardContent className="border-t border-slate-100 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Description */}
                      <Section icon={<FileText className="w-4 h-4" />} title="Description">
                        <p className="text-sm text-slate-700">{opp.description}</p>
                      </Section>

                      {/* Eligibility */}
                      {eligibility.length > 0 && (
                        <Section icon={<Target className="w-4 h-4" />} title="Eligibility Criteria">
                          <ul className="space-y-1">
                            {eligibility.map((c: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </Section>
                      )}

                      {/* Required Documents */}
                      {documents.length > 0 && (
                        <Section icon={<FileText className="w-4 h-4" />} title="Required Documents">
                          <div className="flex flex-wrap gap-2">
                            {documents.map((d: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-amber-50 border-amber-200 text-amber-800">
                                {d}
                              </Badge>
                            ))}
                          </div>
                        </Section>
                      )}

                      {/* Benefits */}
                      {benefits.length > 0 && (
                        <Section icon={<Award className="w-4 h-4" />} title="Benefits">
                          <div className="flex flex-wrap gap-2">
                            {benefits.map((b: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </Section>
                      )}

                      {/* Contact */}
                      <Section icon={<Mail className="w-4 h-4" />} title="Contact">
                        <div className="space-y-1">
                          {opp.contactEmail && (
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">Email:</span>{" "}
                              <a href={`mailto:${opp.contactEmail}`} className="text-violet-600 hover:underline">
                                {opp.contactEmail}
                              </a>
                            </p>
                          )}
                          {opp.contactPhone && (
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">Phone:</span> {opp.contactPhone}
                            </p>
                          )}
                          {opp.applicationLink && (
                            <a
                              href={opp.applicationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline mt-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Application Portal
                            </a>
                          )}
                        </div>
                      </Section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Profile Fit Analysis */}
                      {fitData && (
                        <Section icon={<TrendingUp className="w-4 h-4" />} title="Profile Fit Analysis">
                          <div className="space-y-3">
                            <FitBar label="Skills" score={fitData.skillMatch} />
                            <FitBar label="Degree" score={fitData.degreeMatch} />
                            <FitBar label="GPA" score={fitData.gpaMatch} />
                            <FitBar label="Location" score={fitData.locationMatch} />
                            <FitBar label="Interests" score={fitData.interestMatch} />
                            <FitBar label="Financial" score={fitData.financialFit} />
                          </div>
                          {fitData.details.length > 0 && (
                            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                              <p className="text-sm font-medium text-emerald-800 mb-2">Why this matches you:</p>
                              <ul className="space-y-1">
                                {fitData.details.map((d: string, i: number) => (
                                  <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                                    <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Section>
                      )}

                      {/* Action Items */}
                      <Section icon={<CheckCircle2 className="w-4 h-4" />} title="Action Checklist">
                        <div className="space-y-2">
                          {actionItems.map((item: any, i: number) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border ${
                                item.priority === "critical"
                                  ? "bg-red-50 border-red-200"
                                  : item.priority === "high"
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    item.priority === "critical"
                                      ? "bg-red-200 text-red-700"
                                      : item.priority === "high"
                                      ? "bg-amber-200 text-amber-700"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {item.step}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{item.action}</p>
                                  {item.deadline && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {item.deadline}
                                    </p>
                                  )}
                                </div>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Section>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-sm text-slate-500">Mark as:</span>
                        {["open", "applied", "saved", "expired"].map((s) => (
                          <Button
                            key={s}
                            variant={opp.status === s ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: opp.id, status: s as any })}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Sub-components

function UrgencyBadge({ level }: { level: "critical" | "high" | "medium" | "low" }) {
  const styles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <Badge variant="outline" className={`${styles[level]} capitalize text-xs`}>
      {level === "critical" && <Flame className="w-3 h-3 mr-1" />}
      {level} urgency
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
      {type}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700",
    applied: "bg-blue-100 text-blue-700",
    saved: "bg-violet-100 text-violet-700",
    expired: "bg-slate-100 text-slate-500",
  };

  return (
    <Badge className={styles[status] || styles.open}>
      {status}
    </Badge>
  );
}

function ScorePill({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-700">{Math.round(score)}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-amber-100 text-amber-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-slate-100 text-slate-600",
  };

  return (
    <Badge variant="outline" className={`${styles[priority]} text-xs capitalize ml-auto flex-shrink-0`}>
      {priority}
    </Badge>
  );
}

function FitBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-20">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400"
          }`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-700 w-10 text-right">{score}%</span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
        <span className="text-violet-600">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
