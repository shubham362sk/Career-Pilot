import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Loader2, Sparkles, TrendingUp, Code, BookOpen, Briefcase, UserCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import {
  scoreProjectsFromText,
  scoreExperienceFromText,
  scoreTechnicalFromSkills,
  scoreSoftFromBio,
} from "@/lib/placementMetrics";
import { computeOverallReadiness } from "@/lib/readinessScore";

interface BreakdownItem {
  label: string;
  value: number;
  icon: typeof Code;
  color: string;
}

interface Suggestion {
  priority: "High" | "Medium" | "Low";
  category: string;
  desc: string;
}

interface ResumeDoc {
  extractedText?: string;
  analysis?: { score?: number; skills?: string[] };
}

const PlacementReadiness = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState(0);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [appsRes, resumesRes, rankRes] = await Promise.all([
        fetch(apiUrl("/api/applications"), { headers: { "x-auth-token": token } }),
        fetch(apiUrl("/api/resumes"), { headers: { "x-auth-token": token } }),
        fetch(apiUrl("/api/rankings"), { headers: { "x-auth-token": token } }),
      ]);

      const appsRaw = await appsRes.text();
      const resumesRaw = await resumesRes.text();
      const rankRaw = await rankRes.text();

      let apps: unknown[] = [];
      let resumes: ResumeDoc[] = [];
      try {
        if (appsRaw) {
          const parsed = JSON.parse(appsRaw);
          apps = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        apps = [];
      }
      try {
        if (resumesRaw) resumes = JSON.parse(resumesRaw);
      } catch {
        resumes = [];
      }

      let rankings: { userId: string }[] = [];
      if (rankRes.ok && rankRaw) {
        try {
          const parsed = JSON.parse(rankRaw);
          if (Array.isArray(parsed)) rankings = parsed;
        } catch {
          /* ignore */
        }
      }

      const latest = resumes[0] as ResumeDoc | undefined;
      const resumeText = latest?.extractedText ?? "";
      const atsValue = Math.round(Number(latest?.analysis?.score ?? 0));
      const analysisSkills = latest?.analysis?.skills ?? [];
      const analysisSkillCount = Array.isArray(analysisSkills) ? analysisSkills.length : 0;

      const technicalValue = scoreTechnicalFromSkills(user?.skills, analysisSkillCount);
      const projectsValue = scoreProjectsFromText(resumeText);
      const experienceValue = scoreExperienceFromText(resumeText);
      const softValue = scoreSoftFromBio(user?.bio);

      const newBreakdown: BreakdownItem[] = [
        { label: "Technical Skills", value: technicalValue, icon: Code, color: "bg-blue-600" },
        { label: "Projects Portfolio", value: projectsValue, icon: BookOpen, color: "bg-blue-500" },
        { label: "Work Experience", value: experienceValue, icon: Briefcase, color: "bg-orange-500" },
        { label: "Soft Skills", value: softValue, icon: UserCircle, color: "bg-green-500" },
        { label: "ATS Optimization", value: atsValue || (latest ? 0 : 0), icon: FileText, color: "bg-blue-600" },
      ];

      if (!latest) {
        newBreakdown[4].value = 0;
      }

      setBreakdown(newBreakdown);

      setReadiness(computeOverallReadiness(user, latest));

      const myIdx = rankings.findIndex((r) => String(r.userId) === String(user?.id));
      const rank = myIdx >= 0 ? myIdx + 1 : null;
      const total = rankings.length;
      const pct =
        rank !== null && total > 0 ? Math.round(((total - rank + 1) / total) * 100) : null;
      setMyRank(rank);
      setTotalStudents(total || null);
      setPercentile(pct);

      const newSuggestions: Suggestion[] = [];
      if (!latest) {
        newSuggestions.push({
          priority: "High",
          category: "Resume",
          desc: "Upload and analyze your resume against a job description to get a real ATS score and skill gaps.",
        });
      } else if (atsValue < 60) {
        newSuggestions.push({
          priority: "High",
          category: "Resume",
          desc: "Raise your ATS score by aligning keywords with your target JD (see Resume Analysis).",
        });
      }

      if (!user?.skills || user.skills.split(",").filter((s) => s.trim()).length < 4) {
        newSuggestions.push({
          priority: "High",
          category: "Profile",
          desc: "Add more technical skills on your Profile so readiness and job matching reflect your stack.",
        });
      }

      if (projectsValue < 60) {
        newSuggestions.push({
          priority: "Medium",
          category: "Projects",
          desc: "Describe 1–2 projects with tech stack, your role, and links (GitHub/live demo) on your resume.",
        });
      }

      if (experienceValue < 55) {
        newSuggestions.push({
          priority: "Medium",
          category: "Experience",
          desc: "Add internships, freelance, or academic work with dates and outcomes in your resume.",
        });
      }

      if (apps.length < 3) {
        newSuggestions.push({
          priority: "Medium",
          category: "Applications",
          desc: `You have ${apps.length} tracked application${apps.length === 1 ? "" : "s"} — aim for a steady pipeline.`,
        });
      }

      if (newSuggestions.length < 3) {
        newSuggestions.push({
          priority: "Low",
          category: "Ranking",
          desc: "Re-run resume analysis to update your leaderboard ATS score and placement metrics.",
        });
      }

      setSuggestions(newSuggestions.slice(0, 8));
    } catch (err) {
      console.error("Readiness fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.skills, user?.bio]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData();
  }, [authLoading, token, fetchData]);

  return (
    <DashboardLayout title="Placement Readiness" subtitle="Scores use your profile, latest saved resume, applications, and leaderboard data.">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-3xl border border-border shadow-card p-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="80" className="stroke-muted fill-none" strokeWidth="12" />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    className="stroke-primary fill-none transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeDasharray={502.4}
                    strokeDashoffset={502.4 - (502.4 * readiness) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-foreground">{readiness}</span>
                  <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Placement Readiness</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {readiness >= 70
                  ? "Strong overall — keep refining weak areas below."
                  : readiness >= 50
                    ? "Good foundation — focus on the suggestions to push higher."
                    : "Prioritize resume analysis, skills on your profile, and project evidence."}
              </p>
              <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Based on your latest saved data
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-card p-8">
              <h2 className="text-lg font-bold text-foreground mb-6">Score Breakdown</h2>
              <div className="space-y-6">
                {breakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-card p-8">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Improvement Suggestions
              </h2>
              <div className="space-y-4">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 border border-border/50 rounded-2xl p-4 transition-hover hover:border-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                          s.priority === "High"
                            ? "bg-red-100 text-red-600"
                            : s.priority === "Medium"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {s.priority}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.category}</span>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">{s.desc}</p>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Log in and save a resume to see personalized suggestions.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/20">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Your Rank:{" "}
                  {myRank != null && totalStudents != null && totalStudents > 0
                    ? `#${myRank} / ${totalStudents}`
                    : "—"}
                </h3>
                <p className="text-primary-foreground/80 text-sm font-medium">
                  {totalStudents != null && totalStudents > 0
                    ? "From your latest ATS score on the leaderboard (same as Resume Ranking)."
                    : "Complete a resume analysis while logged in to appear on the leaderboard."}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-4xl font-black text-white mb-1">
                {percentile != null ? `${percentile}th` : "—"}
              </div>
              <div className="text-xs text-primary-foreground/70 font-bold uppercase tracking-widest">Percentile</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlacementReadiness;
