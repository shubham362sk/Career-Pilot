import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, TrendingUp, Award, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";

interface RankItem {
  userId: string;
  name: string;
  college: string;
  score: number;
  rank: number;
  isMe?: boolean;
}

const ResumeRanking = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [rankings, setRankings] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    myRank: 0,
    percentile: 0,
    total: 0
  });

  const fetchRankings = async () => {
    setFetchError(null);
    try {
      const res = await fetch(apiUrl("/api/rankings"), {
        headers: { "x-auth-token": token || "" }
      });
      const raw = await res.text();
      let data: unknown = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        setFetchError(
          "Could not reach the API (invalid response). Start the backend: open a terminal in the server folder and run npm start (port 5000), then refresh."
        );
        setRankings([]);
        setStats({ myRank: 0, percentile: 0, total: 0 });
        return;
      }

      if (!res.ok) {
        const msg = typeof (data as { msg?: string })?.msg === "string" ? (data as { msg: string }).msg : null;
        setFetchError(
          msg ||
            (res.status === 401
              ? "Session expired — log in again."
              : `Request failed (${res.status}). If the backend is not running, use: cd server && npm start`)
        );
        setRankings([]);
        setStats({ myRank: 0, percentile: 0, total: 0 });
        return;
      }
      if (!Array.isArray(data)) {
        setFetchError("Invalid response from server.");
        setRankings([]);
        return;
      }

      const processed = data.map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
        isMe: String(item.userId) === String(user?.id)
      }));

      setRankings(processed);

      const myIdx = processed.findIndex((r: any) => r.isMe);
      const myRank = myIdx !== -1 ? myIdx + 1 : 0;
      const total = processed.length;
      const percentile = total > 0 && myRank > 0
        ? Math.round(((total - myRank + 1) / total) * 100)
        : 0;

      setStats({ myRank, percentile, total });
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
      setFetchError(
        "Could not connect to the API. Start MongoDB if needed, then in the server folder run: npm start (listens on port 5000). Keep this dev server running too."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      setRankings([]);
      setStats({ myRank: 0, percentile: 0, total: 0 });
      return;
    }
    setLoading(true);
    fetchRankings();
  }, [token, user, authLoading]);

  const rankColors: Record<number, string> = {
    1: "text-accent",
    2: "text-muted-foreground",
    3: "text-accent/70",
  };

  const displayRankings = rankings;

  return (
    <DashboardLayout title="Resume Ranking" subtitle="See how your resume compares to other students">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {fetchError && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {fetchError}
            </div>
          )}
          {/* Your stats banner */}
          <div className="gradient-dark rounded-2xl p-6 mb-6 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-primary-foreground">
                #{stats.myRank || "—"}
              </div>
              <div className="text-xs text-primary-foreground/70 mt-1">Your Rank</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary-foreground">
                {stats.percentile ? `${stats.percentile}th` : "—"}
              </div>
              <div className="text-xs text-primary-foreground/70 mt-1">Percentile</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary-foreground">
                {stats.total > 0 ? stats.total : "—"}
              </div>
              <div className="text-xs text-primary-foreground/70 mt-1">Total Students</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <h2 className="font-semibold text-foreground">Global Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">College</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">ATS Score</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRankings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                        No rankings yet. Run a resume analysis (resume + job description) while logged in to appear on the leaderboard.
                      </td>
                    </tr>
                  ) : (
                  displayRankings.map((r) => (
                    <tr
                      key={String(r.userId)}
                      className={`border-b border-border last:border-0 transition-colors ${
                        r.isMe ? "bg-primary-light border-primary/20" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className={`font-bold text-sm flex items-center gap-1 ${rankColors[r.rank] || (r.isMe ? "text-primary" : "text-muted-foreground")}`}>
                          {r.rank <= 3 && <Award className="w-3.5 h-3.5" />}
                          #{r.rank}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${r.isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {r.name.charAt(0)}
                          </div>
                          <span className={`text-sm font-medium ${r.isMe ? "text-primary" : "text-foreground"}`}>
                            {r.name} {r.isMe && "(You)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.college}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${r.score >= 90 ? "text-secondary" : r.score >= 80 ? "text-primary" : "text-accent"}`}>
                          {r.score}/100
                        </span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tips to climb */}
      <div className="mt-6 bg-card rounded-2xl border border-border shadow-card p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> How to Climb the Ranks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Improve ATS Score", desc: "Add missing keywords and skills to your resume to push past 80/100", points: "+50 ranks" },
            { title: "Complete Projects", desc: "Add 2+ projects to your portfolio with clear descriptions", points: "+80 ranks" },
            { title: "Get Experience", desc: "Internships and freelance work significantly boost readiness score", points: "+120 ranks" },
          ].map((t) => (
            <div key={t.title} className="bg-background rounded-xl border border-border p-4">
              <div className="text-secondary text-xs font-bold mb-1">{t.points}</div>
              <div className="font-medium text-foreground text-sm mb-1">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeRanking;
