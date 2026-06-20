import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, CheckCircle, AlertCircle, TrendingUp, Tag, ArrowLeft, Lightbulb } from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const { result, resumeName, jdName } = useAnalysis();

  if (!result) {
    return (
      <DashboardLayout title="Resume Analysis" subtitle="Upload your resume and JD to see analysis">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Analysis Yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Upload your resume and a job description to get a detailed ATS compatibility analysis.
          </p>
          <button onClick={() => navigate("/resume-upload")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity">
            Go to Upload
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const circumference = 2 * Math.PI * 45;
  const progress = (result.score / 100) * circumference;
  const jdMatch = result.jdTotal > 0 ? Math.round((result.matchedCount / result.jdTotal) * 100) : 0;

  const scoreLabel = result.score >= 75 ? "Strong" : result.score >= 60 ? "Good" : result.score >= 40 ? "Fair" : "Needs Work";

  return (
    <DashboardLayout title="Resume Analysis" subtitle={`Comparing ${resumeName} against ${jdName}`}>
      <button onClick={() => navigate("/resume-upload")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Upload New Files
      </button>

      {/* ATS Score + Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-6">
        <div className="sm:col-span-1 bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col items-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-foreground">{result.score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground">ATS Score</div>
          <div className="text-xs text-muted-foreground mt-0.5">{scoreLabel}</div>
        </div>

        {[
          { label: "JD Match", value: `${jdMatch}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
          { label: "Skills Matched", value: result.matchedCount, icon: CheckCircle, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Skills Missing", value: result.missingCount, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-secondary" /> Matched Keywords ({result.matched.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {result.matched.map((s) => (
              <span key={s} className="bg-secondary/10 text-secondary text-xs font-medium px-3 py-1 rounded-full">✓ {s}</span>
            ))}
            {result.matched.length === 0 && <p className="text-sm text-muted-foreground">No matching keywords found.</p>}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" /> Missing Keywords ({result.missing.length})
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.missing.map((s) => (
              <span key={s} className="bg-destructive/10 text-destructive text-xs font-medium px-3 py-1 rounded-full">✗ {s}</span>
            ))}
          </div>
          {result.missing.length > 0 && (
            <p className="text-xs text-muted-foreground">Adding these skills could significantly improve your ATS score.</p>
          )}
        </div>

        {/* Skills by Category */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Skills by Category
          </h2>
          <div className="space-y-4">
            {Object.entries(result.resumeSkills).map(([cat, skills]) => (
              <div key={cat}>
                <div className="text-xs font-medium text-muted-foreground uppercase mb-2">{cat}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => {
                    const isInJd = Object.values(result.jdSkills).flat().includes(s);
                    return (
                      <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isInJd ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                      }`}>
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            {Object.keys(result.resumeSkills).length === 0 && (
              <p className="text-sm text-muted-foreground">No categorized skills detected.</p>
            )}
          </div>
        </div>

        {/* JD Required Skills */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> JD Required Skills
          </h2>
          <div className="space-y-4">
            {Object.entries(result.jdSkills).map(([cat, skills]) => (
              <div key={cat}>
                <div className="text-xs font-medium text-muted-foreground uppercase mb-2">{cat}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => {
                    const hasIt = Object.values(result.resumeSkills).flat().includes(s);
                    return (
                      <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        hasIt ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                      }`}>
                        {hasIt ? "✓" : "✗"} {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Sections */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Resume Sections Detected
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {["education", "experience", "skills", "projects", "certifications", "summary", "achievements", "internship"].map((s) => (
              <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                result.sections.includes(s) ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
              }`}>
                {result.sections.includes(s) ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span>Resume length: <strong className="text-foreground">{result.resumeLength} words</strong></span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-secondary" /> Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["Email", result.contact.email],
              ["Phone", result.contact.phone],
              ["LinkedIn", result.contact.linkedin],
              ["GitHub", result.contact.github],
            ] as [string, boolean][]).map(([label, found]) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                found ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
              }`}>
                {found ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="mt-6 bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" /> AI Suggestions ({result.suggestions.length})
          </h2>
          <div className="space-y-3">
            {result.suggestions.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                s.priority === "high" ? "bg-destructive/5 border border-destructive/20" :
                s.priority === "medium" ? "bg-accent/5 border border-accent/20" :
                "bg-muted border border-border"
              }`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                  s.priority === "high" ? "bg-destructive/10 text-destructive" :
                  s.priority === "medium" ? "bg-accent/10 text-accent" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {s.priority.toUpperCase()}
                </span>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-0.5">{s.category}</div>
                  <p className="text-sm text-foreground">{s.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format Issues */}
      {result.formatIssues.length > 0 && (
        <div className="mt-6 bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent" /> Format Issues
          </h2>
          <div className="space-y-2">
            {result.formatIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className={issue.type === "warning" ? "text-accent" : "text-primary"}>⚠</span>
                {issue.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResumeAnalysis;
