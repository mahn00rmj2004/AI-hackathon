import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { demoEmails, defaultProfile } from "@/data/demoEmails";
import type { EmailInput, StudentProfileForm } from "@/types";
import {
  Mail,
  User,
  Zap,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  FileText,
  GraduationCap,
  Code2,
  Heart,
  Briefcase,
  Award,
  BookOpen,
  Sparkle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<EmailInput[]>([{ subject: "", body: "" }]);
  const [profile, setProfile] = useState<StudentProfileForm>({
    fullName: "",
    email: "",
    degreeProgram: "",
    semester: "",
    cgpa: "",
    skills: "",
    interests: "",
    preferredOpportunityTypes: "",
    financialNeed: "no",
    locationPreference: "",
    pastExperience: "",
    languages: "",
  });
  const [activeTab, setActiveTab] = useState<"emails" | "profile">("emails");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = trpc.process.analyze.useMutation({
    onSuccess: (data) => {
      toast.success(`Found ${data.opportunitiesFound} opportunities!`);
      navigate("/dashboard", { state: { profileId: data.profileId } });
    },
    onError: (error) => {
      toast.error("Analysis failed: " + error.message);
      setIsAnalyzing(false);
    },
  });

  const addEmail = () => {
    if (emails.length < 15) {
      setEmails([...emails, { subject: "", body: "" }]);
    }
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, field: "subject" | "body", value: string) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], [field]: value };
    setEmails(updated);
  };

  const loadDemoData = () => {
    setEmails(demoEmails.map(e => ({ subject: e.subject, body: e.body, sender: e.sender })));
    setProfile(defaultProfile);
    toast.success("Demo data loaded!");
  };

  const clearAll = () => {
    setEmails([{ subject: "", body: "" }]);
    setProfile({
      fullName: "",
      email: "",
      degreeProgram: "",
      semester: "",
      cgpa: "",
      skills: "",
      interests: "",
      preferredOpportunityTypes: "",
      financialNeed: "no",
      locationPreference: "",
      pastExperience: "",
      languages: "",
    });
  };

  const handleAnalyze = async () => {
    const validEmails = emails.filter(e => e.subject.trim() && e.body.trim());
    if (validEmails.length === 0) {
      toast.error("Please add at least one email with subject and body");
      return;
    }
    if (!profile.fullName || !profile.email || !profile.degreeProgram || !profile.semester) {
      toast.error("Please fill in required profile fields (Name, Email, Degree, Semester)");
      setActiveTab("profile");
      return;
    }

    setIsAnalyzing(true);
    analyzeMutation.mutate({
      emails: validEmails,
      profile: {
        ...profile,
        cgpa: profile.cgpa || null,
        skills: profile.skills || null,
        interests: profile.interests || null,
        preferredOpportunityTypes: profile.preferredOpportunityTypes || null,
        locationPreference: profile.locationPreference || null,
        pastExperience: profile.pastExperience || null,
        languages: profile.languages || null,
      },
    });
  };

  const validEmailCount = emails.filter(e => e.subject.trim() && e.body.trim()).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
          <Sparkle className="w-4 h-4" />
          AI-Powered Opportunity Scanner
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          Never Miss a{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Great Opportunity
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Paste your emails, fill your profile, and let AI identify, extract, and rank the best
          scholarships, internships, and opportunities for you.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={loadDemoData}
            variant="outline"
            className="gap-2 border-violet-200 hover:bg-violet-50"
          >
            <Zap className="w-4 h-4 text-violet-600" />
            Load Demo Data
          </Button>
          <Button
            onClick={clearAll}
            variant="ghost"
            className="gap-2 text-slate-500 hover:text-slate-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setActiveTab("emails")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
            activeTab === "emails"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
              : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300"
          }`}
        >
          <Mail className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-semibold">Step 1</div>
            <div className="text-xs opacity-80">Add Emails</div>
          </div>
          {validEmailCount > 0 && (
            <Badge variant={activeTab === "emails" ? "secondary" : "default"} className="ml-2">
              {validEmailCount}
            </Badge>
          )}
        </button>
        <ChevronRight className="w-5 h-5 text-slate-300" />
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
            activeTab === "profile"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
              : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300"
          }`}
        >
          <User className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-semibold">Step 2</div>
            <div className="text-xs opacity-80">Your Profile</div>
          </div>
        </button>
        <ChevronRight className="w-5 h-5 text-slate-300" />
        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-400 border border-slate-200">
          <Sparkles className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-semibold">Step 3</div>
            <div className="text-xs opacity-80">Get Results</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "emails" ? (
        <Card className="border-slate-200 shadow-lg shadow-slate-100">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Opportunity Emails</CardTitle>
                  <p className="text-sm text-slate-500">
                    Paste emails you want analyzed (supports 5-15 emails)
                  </p>
                </div>
              </div>
              <Button
                onClick={addEmail}
                disabled={emails.length >= 15}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Email
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {emails.map((email, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-violet-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    {email.subject && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        Has content
                      </Badge>
                    )}
                  </div>
                  {emails.length > 1 && (
                    <Button
                      onClick={() => removeEmail(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Email subject line..."
                    value={email.subject}
                    onChange={(e) => updateEmail(index, "subject", e.target.value)}
                    className="border-slate-200 focus:border-violet-400 focus:ring-violet-200"
                  />
                  <Textarea
                    placeholder="Paste the full email body here..."
                    value={email.body}
                    onChange={(e) => updateEmail(index, "body", e.target.value)}
                    rows={6}
                    className="border-slate-200 focus:border-violet-400 focus:ring-violet-200 resize-y"
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-500">
                {validEmailCount} of {emails.length} emails ready for analysis
              </p>
              <Button
                onClick={() => setActiveTab("profile")}
                disabled={validEmailCount === 0}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                Continue to Profile
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-lg shadow-slate-100">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student Profile</CardTitle>
                  <p className="text-sm text-slate-500">
                    Tell us about yourself for personalized ranking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setActiveTab("emails")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Back to Emails
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  Academic Information
                </div>
                <div className="space-y-2">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="e.g., Alex Johnson"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="e.g., alex@university.edu"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Degree Program <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profile.degreeProgram}
                    onChange={(e) => setProfile({ ...profile, degreeProgram: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Current Semester <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profile.semester}
                    onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                    placeholder="e.g., 5th Semester (Junior Year)"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CGPA</Label>
                  <Input
                    value={profile.cgpa}
                    onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                    placeholder="e.g., 3.7"
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
                  <Code2 className="w-5 h-5 text-violet-600" />
                  Skills & Experience
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Textarea
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    placeholder="e.g., Python, Machine Learning, Data Analysis, JavaScript"
                    rows={2}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <Textarea
                    value={profile.interests}
                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                    placeholder="e.g., AI Research, Web Development, Data Science"
                    rows={2}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Opportunity Types</Label>
                  <Input
                    value={profile.preferredOpportunityTypes}
                    onChange={(e) => setProfile({ ...profile, preferredOpportunityTypes: e.target.value })}
                    placeholder="e.g., Internship, Scholarship, Research"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <Input
                    value={profile.languages}
                    onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                    placeholder="e.g., English (fluent), Spanish (basic)"
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
                  <Heart className="w-5 h-5 text-violet-600" />
                  Preferences
                </div>
                <div className="space-y-2">
                  <Label>Financial Need</Label>
                  <Select
                    value={profile.financialNeed}
                    onValueChange={(value: "yes" | "no" | "partial") =>
                      setProfile({ ...profile, financialNeed: value })
                    }
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Select financial need" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Need funding support</SelectItem>
                      <SelectItem value="no">No - Self-funded</SelectItem>
                      <SelectItem value="partial">Partial - Some support needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location Preference</Label>
                  <Input
                    value={profile.locationPreference}
                    onChange={(e) => setProfile({ ...profile, locationPreference: e.target.value })}
                    placeholder="e.g., Any (Remote Preferred), New York, Bay Area"
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
                  <Briefcase className="w-5 h-5 text-violet-600" />
                  Experience
                </div>
                <div className="space-y-2">
                  <Label>Past Experience</Label>
                  <Textarea
                    value={profile.pastExperience}
                    onChange={(e) => setProfile({ ...profile, pastExperience: e.target.value })}
                    placeholder="e.g., Teaching Assistant, Research Assistant, Previous Internships"
                    rows={4}
                    className="border-slate-200"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Submit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="w-4 h-4" />
                Required fields marked with *
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing {validEmailCount} emails...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze & Rank Opportunities
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Smart Classification</h3>
          <p className="text-sm text-slate-600">
            AI automatically identifies real opportunities and filters out spam, promotions, and irrelevant emails.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Priority Ranking</h3>
          <p className="text-sm text-slate-600">
            Opportunities are scored by relevance, urgency, and completeness to show you what matters most.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Action Checklist</h3>
          <p className="text-sm text-slate-600">
            Get step-by-step action items with deadlines to ensure you never miss an application.
          </p>
        </div>
      </div>
    </div>
  );
}
