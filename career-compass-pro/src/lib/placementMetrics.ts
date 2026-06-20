/** Heuristics from resume plain text (no ML). */
export function scoreProjectsFromText(text: string): number {
  if (!text?.trim()) return 0;
  const lower = text.toLowerCase();
  let s = 35;
  if (/project|portfolio|github\.com|gitlab|demo|deployed|live link/i.test(lower)) s += 28;
  if (/\b(build|built|developed|designed|created)\b[\s\S]{0,40}\b(project|application|app|website|system)\b/i.test(lower)) s += 22;
  if ((lower.match(/project|portfolio/g) || []).length >= 2) s += 10;
  return Math.min(100, s);
}

export function scoreExperienceFromText(text: string): number {
  if (!text?.trim()) return 0;
  const lower = text.toLowerCase();
  let s = 30;
  if (/intern(ship)?|full[\s-]?time|part[\s-]?time|experience|employed|worked at|company|fresher/i.test(lower)) s += 32;
  if (/\b(20\d{2})\b.*\b(20\d{2}|present|current|till|–|-)/i.test(lower)) s += 18;
  if (/year|month|duration|tenure/i.test(lower)) s += 12;
  return Math.min(100, s);
}

export function scoreTechnicalFromSkills(skills: string | undefined, analysisSkillCount: number): number {
  const list = skills
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const n = Math.max(list?.length ?? 0, analysisSkillCount);
  return Math.min(100, 25 + n * 9);
}

export function scoreSoftFromBio(bio: string | undefined): number {
  const t = bio?.trim() ?? "";
  if (!t) return 45;
  return Math.min(100, 50 + Math.min(30, Math.floor(t.length / 40)));
}
