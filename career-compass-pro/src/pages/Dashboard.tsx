import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Briefcase, Target, Trophy, TrendingUp, Clock, Loader2, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import { computeOverallReadiness } from "@/lib/readinessScore";

type Stat = {
  label: string;
  value: string;
  icon: typeof FileText;
  color: string;
  bg: string;
  change: string;
};

type ApplicationRow = {
  _id?: string;
  company: string;
  role: string;
  date: string;
  status: string;
  salary: string;
};

type ActivityItem = { action: string; time: string; icon: string; at: number };

interface ResumeDoc {
  fileName?: string;
  createdAt?: string;
  analysis?: { score?: number };
}

const emptyStats: Stat[] = [
  { label: "ATS Score", value: "—", icon: FileText, color: "text-primary", bg: "bg-primary-light", change: "No analysis yet" },
  { label: "Saved resumes", value: "0", icon: FileText, color: "text-secondary", bg: "bg-secondary/10", change: "Upload" },
  { label: "Applications", value: "0", icon: Target, color: "text-accent", bg: "bg-accent/10", change: "None tracked" },
  { label: "Readiness", value: "—", icon: Trophy, color: "text-primary", bg: "bg-primary-light", change: "Update profile" },
];

const Dashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>(emptyStats);
  const [recentApplications, setRecentApplications] = useState<ApplicationRow[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setFetchError(null);
    try {
      const [appsRes, resumesRes] = await Promise.all([
        fetch(apiUrl("/api/applications"), { headers: { "x-auth-token": token } }),
        fetch(apiUrl("/api/resumes"), { headers: { "x-auth-token": token } }),
      ]);

      const appsRaw = await appsRes.text();
      const resumesRaw = await resumesRes.text();

      let apps: ApplicationRow[] = [];
      try {
        if (appsRaw) {
          const parsed = JSON.parse(appsRaw);
          apps = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        apps = [];
      }

      let resumes: ResumeDoc[] = [];
      try {
        if (resumesRaw) {
          const parsed = JSON.parse(resumesRaw);
          resumes = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        resumes = [];
      }

      const loadErrs: string[] = [];
      if (!appsRes.ok) loadErrs.push("applications");
      if (!resumesRes.ok) loadErrs.push("resumes");
      if (loadErrs.length) {
        setFetchError(`Could not load ${loadErrs.join(" and ")}.`);
      } else {
        setFetchError(null);
      }

      const latest = resumes[0];
      const atsScore = Math.round(Number(latest?.analysis?.score ?? 0));
      const readiness = computeOverallReadiness(user, latest);

      const interviews = apps.filter((a) => a.status === "Interview").length;
      const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;

      const resumeCount = resumes.length;

      setStats([
        {
          label: "ATS Score",
          value: latest ? `${atsScore}/100` : "—",
          icon: FileText,
          color: "text-primary",
          bg: "bg-primary-light",
          change: latest?.fileName ? `Latest: ${latest.fileName}` : "Run analysis",
        },
        {
          label: "Saved resumes",
          value: String(resumeCount),
          icon: Briefcase,
          color: "text-secondary",
          bg: "bg-secondary/10",
          change: resumeCount ? "Analyses" : "Upload resume",
        },
        {
          label: "Applications",
          value: String(apps.length),
          icon: Target,
          color: "text-accent",
          bg: "bg-accent/10",
          change: `${interviews} interview${interviews === 1 ? "" : "s"} · ${shortlisted} shortlisted`,
        },
        {
          label: "Readiness",
          value: `${readiness}%`,
          icon: Trophy,
          color: "text-primary",
          bg: "bg-primary-light",
          change: "Profile + resume",
        },
      ]);

      const sortedApps = [...apps].sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      });

      setRecentApplications(
        sortedApps.slice(0, 6).map((a) => ({
          _id: a._id,
          company: a.company,
          role: a.role,
          date: a.date,
          status: a.status,
          salary: a.salary || "—",
        }))
      );

      const items: ActivityItem[] = [];

      if (latest?.createdAt && latest?.analysis?.score != null) {
        const d = new Date(latest.createdAt);
        const at = d.getTime();
        items.push({
          action: `Resume analyzed — ATS ${Math.round(Number(latest.analysis.score))}/100`,
          time: d.toLocaleString(),
          icon: "📄",
          at,
        });
      }

      for (const a of sortedApps.slice(0, 5)) {
        const d = new Date(a.date);
        items.push({
          action: `${a.status}: ${a.role} at ${a.company}`,
          time: d.toLocaleString(),
          icon: a.status === "Interview" ? "📅" : "✅",
          at: d.getTime(),
        });
      }

      items.sort((a, b) => b.at - a.at);
      setActivity(items.slice(0, 8));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setStats(emptyStats);
      setRecentApplications([]);
      setActivity([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData();
  }, [authLoading, token, fetchData]);

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${firstName}! Here's your placement overview.`}>
      {fetchError && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium text-right max-w-[55%] leading-tight">{s.change}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground">Recent applications</h2>
                <Link to="/application-tracker" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Open tracker <Link2 className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentApplications.length > 0 ? (
                  recentApplications.map((job) => (
                    <div
                      key={job._id || `${job.company}-${job.role}-${job.date}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{job.role}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {job.company} · {new Date(job.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-xs font-semibold text-primary">{job.status}</div>
                        <div className="text-xs text-muted-foreground">{job.salary}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No applications yet.{" "}
                    <Link to="/application-tracker" className="text-primary font-medium hover:underline">
                      Add one
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-card p-6">
                <h2 className="font-semibold text-foreground mb-4">Activity</h2>
                <div className="space-y-3">
                  {activity.length > 0 ? (
                    activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-lg shrink-0">{a.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs text-foreground font-medium leading-snug">{a.action}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" /> {a.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Upload a resume or add applications to see activity here.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
