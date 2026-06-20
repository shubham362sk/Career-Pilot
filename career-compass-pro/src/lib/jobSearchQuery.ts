import type { AnalysisResult } from "@/lib/resumeAnalyzer";

const STORAGE_KEY = "careerpilot_jd_job_query";

/** Pick a single primary keyword for JSearch (one skill / role term). */
export function deriveJobSearchQuery(
  analysis: AnalysisResult | null,
  user: { skills?: string } | null
): string {
  if (analysis) {
    const jdFlat = [...new Set(Object.values(analysis.jdSkills).flat().filter(Boolean))];
    if (jdFlat.length) return jdFlat[0].trim();
    if (analysis.matched?.length) return analysis.matched[0].trim();
  }
  if (user?.skills?.trim()) {
    const first = user.skills.split(",")[0]?.trim();
    if (first) return first;
  }
  return "software developer";
}

/** Legacy saves may contain multiple keywords — keep one term for the API. */
export function normalizeJobQueryToSingle(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.includes(",")) return t.split(",")[0].trim();
  const words = t.split(/\s+/);
  if (words.length <= 2) return t;
  return words[0];
}

export function getStoredJobQuery(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistJobQueryFromAnalysis(analysis: AnalysisResult): void {
  try {
    const q = deriveJobSearchQuery(analysis, null);
    if (q) localStorage.setItem(STORAGE_KEY, q);
  } catch {
    /* ignore */
  }
}
