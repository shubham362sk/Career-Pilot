// ─── ATS Resume Analyzer — TypeScript port ──────────────────────────────────

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","was","are","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "shall","can","that","this","these","those","it","its","i","you","we",
  "they","he","she","our","your","their","my","his","her","as","if","than",
  "then","when","where","which","who","whom","what","how","all","any","both",
  "each","few","more","most","other","some","such","no","not","only","same",
  "so","very","just","also","into","about","up","out","over","after","before",
  "between","through","during","including","without","within","along","across",
  "behind","beyond","plus","except","down","off","above","below",
  "new","use","used","using","work","working","worked","year","years",
  "experience","strong","good","excellent","ability","responsible","seeking",
  "required","preferred","must","including","etc","eg","ie","role","position",
  "join","team","company","looking","candidate","person","individual","provide",
  "support","help","ensure","maintain","develop","manage","build","create",
  "design","implement","duties","tasks","day","basis","assist","per",
  "knowledge","understanding","familiarity","proficiency","proficient",
  "minimum","least","bonus","nice","ideally","following","least","one",
  "two","three","four","five","six","ability","commitment","willingness",
  "adaptability","motivation","mindset","integrity","ethical","verbal","written",
  "growth","player","self","latest","updated","monitor","document","perform",
  "execute","identify","prioritize","review","collaborate","collaborating",
  "participating","phases","lifecycle","transition","undergoing","completion",
  "comprehensive","program","trainee","training","journey","mandatory","path",
  "provided","prior","begin","successful","upon","responsible","developing",
  "automate","scripting","appropriate","tools","clean","efficient","code",
  "debug","validation","verification","testing","internal","stakeholders",
  "improve","products","systems","software","solutions","high","quality",
  "architecture","tasks","throughout","development",
  "time","full","skills","learning","deep","written","verbal","fast","paced",
  "apply","applications","application","service","services","based","level",
  "related","general","specific","current","multiple","key","core","set",
  "list","type","types","ways","way","due","date","end","start",
  "large","small","part","parts","whole","real","true","false","open","close",
  "epam","hyderabad","chennai","coimbatore","inr","lpa","salary","benefits",
  "insurance","maternity","paternity","bereavement","retirement","vpf","nps",
  "hobby","clubs","events","social","joining","location","office","candidates",
]);

export const TECH_SKILLS = new Set([
  "python","java","javascript","typescript","c","c++","c#","ruby","golang","go",
  "rust","kotlin","swift","php","scala","perl","r","matlab","bash","shell",
  "react","angular","vue","django","flask","fastapi","spring","express","nodejs",
  "node","nextjs","nuxt","laravel","rails","jquery","bootstrap","tailwind","html","css",
  "sql","mysql","postgresql","mongodb","redis","elasticsearch","sqlite","oracle",
  "cassandra","dynamodb","firebase","neo4j","nosql","dbms",
  "aws","azure","gcp","docker","kubernetes","jenkins","terraform","ansible",
  "git","github","gitlab","linux","nginx","apache","devops","heroku","cicd",
  "machine learning","deep learning","nlp","tensorflow","pytorch","keras",
  "scikit-learn","pandas","numpy","spark","hadoop","tableau","power bi",
  "data science","artificial intelligence","opencv","matplotlib","scikit",
  "selenium","pytest","unittest","jest","cypress","junit","postman",
  "oop","oops","mvc","rest","restful","api","json","xml","oauth","jwt",
  "microservices","agile","scrum","dsa","algorithms","data structures",
  "object oriented","version control","object-oriented",
  "figma","photoshop","android","ios","flutter","vscode","linux",
]);

export const SOFT_SKILLS = new Set([
  "communication","teamwork","leadership","problem solving","problem-solving",
  "agile","scrum","project management","collaboration","critical thinking",
  "time management","multitasking","adaptability","creativity","analytical",
]);

export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Programming Languages": [
    "python","java","javascript","typescript","c++","c#","ruby","golang",
    "rust","kotlin","swift","php","scala","perl","r","matlab","bash","shell","c",
  ],
  "Web Frameworks": [
    "react","angular","vue","django","flask","fastapi","spring","express",
    "nextjs","nuxt","laravel","rails","jquery","bootstrap","tailwind","nodejs",
  ],
  "Databases": [
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","sqlite",
    "oracle","cassandra","dynamodb","firebase","nosql","dbms",
  ],
  "Cloud & DevOps": [
    "aws","azure","gcp","docker","kubernetes","jenkins","terraform",
    "ansible","git","github","gitlab","linux","nginx","devops","heroku",
  ],
  "Data & AI/ML": [
    "machine learning","deep learning","nlp","tensorflow","pytorch","keras",
    "scikit-learn","pandas","numpy","spark","hadoop","tableau","power bi",
    "data science","artificial intelligence","opencv","matplotlib",
  ],
  "CS Concepts": [
    "oop","oops","dsa","data structures","algorithms","dbms","version control",
    "rest","api","microservices","mvc","object oriented",
  ],
  "Soft Skills": [
    "communication","teamwork","leadership","problem solving","agile","scrum",
    "project management","collaboration","critical thinking","time management",
  ],
};

const SECTION_HEADERS = [
  "education","experience","skills","projects","certifications","summary",
  "objective","achievements","work history","internship","languages",
  "publications","awards","volunteer","profile","about","career",
];

const SYNONYMS: [RegExp, string][] = [
  [/\bnode\.js\b/g, "nodejs"],
  [/\bnode\b/g, "nodejs"],
  [/\breact\.js\b/g, "react"],
  [/\bvue\.js\b/g, "vue"],
  [/\bnext\.js\b/g, "nextjs"],
  [/\bpostgres\b/g, "postgresql"],
  [/\bmongo\b/g, "mongodb"],
  [/\bk8s\b/g, "kubernetes"],
  [/\bscikit\b/g, "scikit-learn"],
  [/\bsklearn\b/g, "scikit-learn"],
  [/\bci\/cd\b/g, "cicd"],
  [/\brest api\b/g, "rest"],
  [/\brestful\b/g, "rest"],
  [/\bpowerbi\b/g, "power bi"],
  [/\bhtml5\b/g, "html"],
  [/\bcss3\b/g, "css"],
  [/\bgolang\b/g, "golang"],
  [/\bspring boot\b/g, "spring"],
  [/\boops\b/g, "oop"],
  [/\bobject.oriented\b/g, "oop"],
  [/\bdata structure\b/g, "data structures"],
  [/\bversion control system\b/g, "version control"],
  [/\bvcs\b/g, "version control"],
  [/\bcore java\b/g, "java"],
  [/\bcore python\b/g, "python"],
  [/\bds\b/g, "data structures"],
  [/\balgo\b/g, "algorithms"],
  [/\bdsa\b/g, "dsa"],
];

const BOILERPLATE_PATTERNS = [
  /about us/i, /about epam/i, /who we are/i, /benefits?/i, /perks?/i,
  /what we offer/i, /compensation/i, /salary/i, /our mission/i,
  /our values/i, /equal opportunity/i, /diversity/i,
];

function normalize(text: string): string {
  let t = text.toLowerCase();
  for (const [pattern, replacement] of SYNONYMS) {
    t = t.replace(pattern, replacement);
  }
  return t;
}

function tokenize(text: string): string[] {
  const t = normalize(text).replace(/[^a-z0-9\s+#]/g, " ");
  return t.split(/\s+/).filter(tok => tok.length > 1 && !STOPWORDS.has(tok));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const JD_START_PATTERNS = [
  /(?:^|\n)\s*(?:requirements?|qualifications?|what\s+you(?:'|')?ll\s+need|what\s+we(?:'|')?re\s+looking\s+for|must\s+have|technical\s+skills?|key\s+responsibilities|skills?\s*(?:&|and)?\s*experience|required\s+skills?|education\s*(?:&|and|\+)?\s*experience)/i,
];

const JD_END_PATTERNS = [
  /(?:^|\n)\s*(?:about\s+us|benefits?|perks?|compensation|salary|equal\s+opportunity|diversity|apply\s+now|what\s+we\s+offer|privacy\s+policy|contact\s+us)/i,
];

/** Prefer requirement / qualifications slice; exclude benefits & company fluff. */
function extractJdRequirementText(jdText: string): string {
  const t = jdText.replace(/\r\n/g, "\n").trim();
  if (!t) return "";
  let startIdx = -1;
  for (const re of JD_START_PATTERNS) {
    const m = re.exec(t);
    if (m && (startIdx === -1 || m.index < startIdx)) startIdx = m.index;
  }
  let slice = startIdx >= 0 ? t.slice(startIdx) : t;
  let end = slice.length;
  for (const re of JD_END_PATTERNS) {
    const m = re.exec(slice.slice(200));
    if (m) end = Math.min(end, m.index + 200);
  }
  slice = slice.slice(0, end);
  const lines = slice.split("\n").filter((line) => {
    const l = line.trim();
    if (!l) return false;
    if (BOILERPLATE_PATTERNS.some((p) => p.test(l) && l.length < 120)) return false;
    return true;
  });
  const joined = lines.join("\n").trim();
  return joined.length >= 30 ? joined : t;
}

/** Only known tech/soft skills from vocabulary — no generic JD tokens. */
function extractSkillsFromVocabularyText(text: string): Set<string> {
  const lower = normalize(text);
  const found = new Set<string>();
  const phraseSkills = [...TECH_SKILLS, ...SOFT_SKILLS].filter((s) => s.includes(" "));
  phraseSkills.sort((a, b) => b.length - a.length);
  for (const skill of phraseSkills) {
    if (new RegExp(`\\b${escapeRegex(skill)}\\b`).test(lower)) found.add(skill);
  }
  for (const skill of [...TECH_SKILLS, ...SOFT_SKILLS]) {
    if (!skill.includes(" ") && new RegExp(`\\b${escapeRegex(skill)}\\b`).test(lower)) {
      found.add(skill);
    }
  }
  for (const skills of Object.values(SKILL_CATEGORIES)) {
    for (const s of skills) {
      if (new RegExp(`\\b${escapeRegex(s)}\\b`).test(lower)) found.add(s);
    }
  }
  return found;
}

/** JD skills = vocabulary hits in requirement text first; full JD only if none found. */
function getJdRequirementContext(jdText: string): { reqText: string; skills: Set<string> } {
  const reqText = extractJdRequirementText(jdText);
  let skills = extractSkillsFromVocabularyText(reqText);
  if (skills.size === 0) skills = extractSkillsFromVocabularyText(jdText);
  return { reqText, skills };
}

function resumeHasSkill(resumeText: string, skill: string): boolean {
  const lower = normalize(resumeText);
  return new RegExp(`\\b${escapeRegex(skill)}\\b`).test(lower);
}

function detectSections(text: string): string[] {
  const lower = text.toLowerCase();
  return SECTION_HEADERS.filter(h => lower.includes(h));
}

export function detectSkillsByCategory(text: string): Record<string, string[]> {
  const lower = normalize(text);
  const found: Record<string, string[]> = {};
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    const matched = skills.filter(s => new RegExp(`\\b${escapeRegex(s)}\\b`).test(lower));
    if (matched.length) found[category] = matched;
  }
  return found;
}

function detectContactInfo(text: string) {
  return {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
    phone: /(\+?\d[\d\s\-()]{7,})/.test(text),
    linkedin: text.toLowerCase().includes("linkedin"),
    github: text.toLowerCase().includes("github"),
  };
}

function checkResumeFormat(text: string) {
  const issues: { type: string; msg: string }[] = [];
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 150)
    issues.push({ type: "warning", msg: "Resume is too short (under 150 words). Add more detail." });
  else if (wordCount > 1200)
    issues.push({ type: "warning", msg: `Resume is long (${wordCount} words). ATS works best with 400–800 words.` });

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const bulletLines = lines.filter(l => /^[-•*·▪]/.test(l)).length;
  if (bulletLines < 3 && wordCount > 200)
    issues.push({ type: "info", msg: "Use bullet points — ATS parsers extract them more reliably." });

  if (!/\b(20\d{2}|19\d{2})\b/.test(text))
    issues.push({ type: "info", msg: "No years detected — add graduation year and employment dates." });

  return issues;
}

function generateSuggestions(
  score: number,
  missing: string[],
  sections: string[],
  contact: ReturnType<typeof detectContactInfo>,
  resumeSkills: Record<string, string[]>,
  jdSkills: Record<string, string[]>,
  formatIssues: { type: string; msg: string }[]
) {
  const suggestions: { priority: string; category: string; msg: string }[] = [];

  if (score < 40) suggestions.push({ priority: "high", category: "ATS Score", msg: `Score ${score}% — most ATS filters reject below 60%. Tailor your resume to match this JD.` });
  else if (score < 60) suggestions.push({ priority: "high", category: "ATS Score", msg: `Score ${score}% — borderline. Add missing keywords to get above 60%.` });
  else if (score < 75) suggestions.push({ priority: "medium", category: "ATS Score", msg: `Score ${score}% — good match! A few more keywords will push you higher.` });
  else suggestions.push({ priority: "low", category: "ATS Score", msg: `Score ${score}% — strong alignment. Well done!` });

  if (missing.length) suggestions.push({ priority: "high", category: "Missing Keywords", msg: `Add these to your resume: ${missing.slice(0, 8).join(", ")}.` });

  for (const s of ["skills", "experience", "education"]) {
    if (!sections.includes(s)) suggestions.push({ priority: "high", category: "Resume Sections", msg: `Add a clear '${s.charAt(0).toUpperCase() + s.slice(1)}' section heading.` });
  }

  if (!["summary", "objective", "profile", "about"].some(s => sections.includes(s)))
    suggestions.push({ priority: "medium", category: "Resume Sections", msg: "Add a 'Professional Summary' tailored with JD keywords." });

  if (!sections.includes("projects")) suggestions.push({ priority: "medium", category: "Resume Sections", msg: "Add a 'Projects' section — important for early-career candidates." });
  if (!sections.includes("certifications")) suggestions.push({ priority: "low", category: "Resume Sections", msg: "Add a 'Certifications' section if applicable." });

  if (!contact.email) suggestions.push({ priority: "high", category: "Contact Info", msg: "No email detected — include a professional email." });
  if (!contact.phone) suggestions.push({ priority: "high", category: "Contact Info", msg: "No phone number detected." });
  if (!contact.linkedin) suggestions.push({ priority: "medium", category: "Contact Info", msg: "Add your LinkedIn profile URL." });
  if (!contact.github) suggestions.push({ priority: "low", category: "Contact Info", msg: "Add a GitHub link to show coding activity." });

  for (const [cat, jdList] of Object.entries(jdSkills)) {
    const gap = jdList.filter(s => !(resumeSkills[cat] || []).includes(s));
    if (gap.length) suggestions.push({ priority: "medium", category: `Skill Gap — ${cat}`, msg: `JD expects: ${gap.slice(0, 5).join(", ")}. Add if you have them.` });
  }

  for (const issue of formatIssues) {
    suggestions.push({ priority: issue.type === "warning" ? "medium" : "low", category: "Resume Format", msg: issue.msg });
  }

  return suggestions;
}

export interface AnalysisResult {
  score: number;
  matchedCount: number;
  missingCount: number;
  jdTotal: number;
  matched: string[];
  missing: string[];
  sections: string[];
  contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean };
  resumeSkills: Record<string, string[]>;
  jdSkills: Record<string, string[]>;
  formatIssues: { type: string; msg: string }[];
  suggestions: { priority: string; category: string; msg: string }[];
  resumeLength: number;
}

export function analyzeResume(resumeText: string, jdText: string): AnalysisResult {
  const { reqText: jdReqText, skills: jdReqs } = getJdRequirementContext(jdText);

  const matchedKw = new Set([...jdReqs].filter((k) => resumeHasSkill(resumeText, k)));
  const missingKw = new Set([...jdReqs].filter((k) => !resumeHasSkill(resumeText, k)));

  const overlapScore = jdReqs.size ? (matchedKw.size / jdReqs.size) * 100 : 0;

  const sections = detectSections(resumeText);
  const coreSecs = ["experience", "education", "skills"];
  const sectionScore = (coreSecs.filter((s) => sections.includes(s)).length / coreSecs.length) * 100;

  let finalScore: number;
  if (jdReqs.size > 0) {
    finalScore = overlapScore * 0.85 + sectionScore * 0.15;
  } else {
    finalScore = sectionScore * 0.55;
  }
  finalScore = Math.round(Math.min(Math.max(finalScore, 0), 100) * 10) / 10;

  const jdTokens = tokenize(jdReqText.length >= 30 ? jdReqText : jdText);
  const jdFreq: Record<string, number> = {};
  for (const t of jdTokens) {
    if (jdReqs.has(t)) jdFreq[t] = (jdFreq[t] || 0) + 1;
  }
  for (const s of jdReqs) {
    if (s.includes(" ")) jdFreq[s] = (jdFreq[s] || 0) + 2;
  }

  const rankByJd = (a: string, b: string) => (jdFreq[b] || 0) - (jdFreq[a] || 0) || a.localeCompare(b);
  const topMatched = [...matchedKw].sort(rankByJd).slice(0, 25);
  const topMissing = [...missingKw].sort(rankByJd).slice(0, 25);

  const contact = detectContactInfo(resumeText);
  const resumeSkills = detectSkillsByCategory(resumeText);
  const jdSkills = detectSkillsByCategory(jdReqText.length >= 30 ? jdReqText : jdText);
  const formatIssues = checkResumeFormat(resumeText);
  let suggestions = generateSuggestions(finalScore, topMissing, sections, contact, resumeSkills, jdSkills, formatIssues);
  if (jdReqs.size === 0) {
    suggestions = [
      {
        priority: "medium",
        category: "Job Description",
        msg: "No skills from the technical catalog matched this JD. Try clearer text or ensure requirements list tools and technologies.",
      },
      ...suggestions,
    ];
  }

  return {
    score: finalScore,
    matchedCount: matchedKw.size,
    missingCount: missingKw.size,
    jdTotal: jdReqs.size,
    matched: topMatched,
    missing: topMissing,
    sections,
    contact,
    resumeSkills,
    jdSkills,
    formatIssues,
    suggestions,
    resumeLength: resumeText.split(/\s+/).length,
  };
}
