import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Briefcase, MapPin, ExternalLink, Search, Loader2, AlertCircle } from "lucide-react";
import { searchJobs, type JSearchJob } from "@/lib/jobSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { deriveJobSearchQuery, getStoredJobQuery, normalizeJobQueryToSingle } from "@/lib/jobSearchQuery";

const JobMatching = () => {
  const { user } = useAuth();
  const { result } = useAnalysis();

  const derivedQuery = useMemo(() => {
    if (result) {
      const fromJd = deriveJobSearchQuery(result, user);
      if (fromJd.trim()) return fromJd.trim();
    }
    const stored = getStoredJobQuery();
    if (stored?.trim()) return normalizeJobQueryToSingle(stored);
    return deriveJobSearchQuery(null, user);
  }, [result, user]);

  const [query, setQuery] = useState(derivedQuery);
  const [location, setLocation] = useState("India");
  const [jobs, setJobs] = useState<JSearchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setQuery(derivedQuery);
  }, [derivedQuery]);

  const runSearch = useCallback(async (q: string, loc: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    const resultSearch = await searchJobs(q, loc);
    if (resultSearch.error) setError(resultSearch.error);
    setJobs(resultSearch.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    runSearch(derivedQuery, location);
    // Intentionally re-search when JD-derived query changes, not on every location keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedQuery, runSearch]);

  const handleSearch = () => {
    runSearch(query, location);
  };

  return (
    <DashboardLayout
      title="Job Matching"
      subtitle="Jobs are matched to your last resume-vs-JD analysis (JD skills). Run an analysis on Resume Upload to refresh."
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Job title, skills, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:w-48"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            {error.includes("CORS") || error.includes("Failed to fetch")
              ? "Unable to reach the job search API from the browser. This may be a CORS restriction — the API works best via a backend proxy."
              : error}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && jobs.length === 0 && !error && (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No jobs found. Try different keywords.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.job_id}
            className="bg-card rounded-2xl border border-border shadow-card p-5 hover:border-primary/30 hover:shadow-primary transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              {job.employer_logo ? (
                <img
                  src={job.employer_logo}
                  alt={job.employer_name}
                  className="w-11 h-11 rounded-xl object-contain bg-muted p-1"
                />
              ) : (
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{job.job_title}</h3>
                <p className="text-xs text-muted-foreground">{job.employer_name}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              {(job.job_city || job.job_state || job.job_country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ")}
                </span>
              )}
              {job.job_employment_type && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{job.job_employment_type}</span>
              )}
              {job.job_min_salary && job.job_max_salary && (
                <span>
                  {job.job_salary_currency || "$"}
                  {job.job_min_salary.toLocaleString()}–{job.job_max_salary.toLocaleString()}
                </span>
              )}
            </div>

            {job.job_required_skills && job.job_required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.job_required_skills.slice(0, 5).map((s) => (
                  <span key={s} className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {job.job_description && (
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{job.job_description.slice(0, 150)}...</p>
            )}

            <a
              href={job.job_apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-primary-foreground py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Apply Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default JobMatching;
