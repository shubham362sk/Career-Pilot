import {
  scoreProjectsFromText,
  scoreExperienceFromText,
  scoreTechnicalFromSkills,
  scoreSoftFromBio,
} from "@/lib/placementMetrics";

interface UserLike {
  skills?: string;
  bio?: string;
}

interface LatestResume {
  extractedText?: string;
  analysis?: { score?: number; skills?: string[] };
}

/** Same overall readiness as Placement Readiness (average of five pillars). */
export function computeOverallReadiness(user: UserLike | null | undefined, latest: LatestResume | undefined): number {
  const resumeText = latest?.extractedText ?? "";
  const atsValue = Math.round(Number(latest?.analysis?.score ?? 0));
  const analysisSkills = latest?.analysis?.skills ?? [];
  const analysisSkillCount = Array.isArray(analysisSkills) ? analysisSkills.length : 0;

  const technicalValue = scoreTechnicalFromSkills(user?.skills, analysisSkillCount);
  const projectsValue = scoreProjectsFromText(resumeText);
  const experienceValue = scoreExperienceFromText(resumeText);
  const softValue = scoreSoftFromBio(user?.bio);
  const atsPillar = latest ? atsValue : 0;

  const parts = [technicalValue, projectsValue, experienceValue, softValue, atsPillar];
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
