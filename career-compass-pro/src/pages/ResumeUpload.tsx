import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileText, CheckCircle, AlertCircle, X, Briefcase, Loader2 } from "lucide-react";
import { extractTextFromFile } from "@/lib/textExtractor";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import { persistJobQueryFromAnalysis } from "@/lib/jobSearchQuery";

interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

const FilePreview = ({ uploaded, onRemove }: { uploaded: UploadedFile; onRemove: () => void }) => (
  <div className="mt-3 bg-card border border-border rounded-xl p-3 flex items-center gap-3">
    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
      <FileText className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{uploaded.name}</p>
      <p className="text-xs text-muted-foreground">{(uploaded.size / 1024).toFixed(1)} KB</p>
    </div>
    <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const UploadZone = ({
  type, icon: Icon, title, draggingTitle, dragging, setDrag, inputId, onFile,
}: {
  type: "resume" | "jd"; icon: React.ElementType; title: string; draggingTitle: string;
  dragging: boolean; setDrag: (v: boolean) => void; inputId: string;
  onFile: (f: File, type: "resume" | "jd") => void;
}) => (
  <div
    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
    onDragLeave={() => setDrag(false)}
    onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f, type); }}
    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
      dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
    }`}
    onClick={() => document.getElementById(inputId)?.click()}
  >
    <input id={inputId} type="file" accept=".pdf,.doc,.docx" className="hidden"
      onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0], type)} />
    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{dragging ? draggingTitle : title}</h3>
    <p className="text-muted-foreground text-xs mb-2">Drag & drop or click to browse</p>
    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX · Max 5MB</p>
  </div>
);

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { setResult, setResumeName, setJdName } = useAnalysis();
  const { token } = useAuth();
  const [resumeDragging, setResumeDragging] = useState(false);
  const [jdDragging, setJdDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [jdFile, setJdFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File, type: "resume" | "jd") => {
    if (f.size > 5 * 1024 * 1024) { alert("File too large. Max size is 5MB."); return; }
    const uploaded = { file: f, name: f.name, size: f.size };
    if (type === "resume") setResumeFile(uploaded);
    else setJdFile(uploaded);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jdFile) return;
    setUploading(true);
    setError(null);

    try {
      const [resumeText, jdText] = await Promise.all([
        extractTextFromFile(resumeFile.file),
        extractTextFromFile(jdFile.file),
      ]);

      if (!resumeText.trim()) {
        throw new Error(
          "Could not extract text from the resume. Try PDF, or a .docx saved from Word (not a scan-only image PDF)."
        );
      }
      if (!jdText.trim()) {
        throw new Error(
          "Could not extract text from the job description. Try re-saving the .docx from Word, export as PDF, or paste the JD text into a new .docx file."
        );
      }

      const analysisResult = analyzeResume(resumeText, jdText);
      setResult(analysisResult);
      persistJobQueryFromAnalysis(analysisResult);
      setResumeName(resumeFile.name);
      setJdName(jdFile.name);

      // Save to backend if logged in
      if (token) {
        try {
          const resumeRes = await fetch(apiUrl("/api/resumes"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token
            },
            body: JSON.stringify({
              fileName: resumeFile.name,
              extractedText: resumeText,
              analysis: {
                score: analysisResult.score,
                skills: analysisResult.matched,
                recommendations: analysisResult.missing,
                gaps: analysisResult.missing
              }
            })
          });
          if (!resumeRes.ok) {
            const err = await resumeRes.json().catch(() => ({}));
            console.error("Failed to save resume:", err);
          }
          const rankRes = await fetch(apiUrl("/api/rankings"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token
            },
            body: JSON.stringify({
              resumeName: resumeFile.name,
              jdName: jdFile.name,
              score: analysisResult.score
            })
          });
          if (!rankRes.ok) {
            const err = await rankRes.json().catch(() => ({}));
            console.error("Failed to save ranking (leaderboard):", err?.msg || rankRes.status, err);
          }
        } catch (saveErr) {
          console.error("Failed to save analysis to history:", saveErr);
        }
      }

      navigate("/resume-analysis");
    } catch (e: any) {
      console.error("Analysis error:", e);
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Resume Upload" subtitle="Upload your resume and job description for AI-powered comparative analysis">
      <div className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Your Resume</span>
              {resumeFile && <CheckCircle className="w-4 h-4 text-secondary ml-auto" />}
            </div>
            <UploadZone type="resume" icon={Upload} title="Upload Resume" draggingTitle="Drop resume here"
              dragging={resumeDragging} setDrag={setResumeDragging} inputId="resume-input" onFile={handleFile} />
            {resumeFile && <FilePreview uploaded={resumeFile} onRemove={() => setResumeFile(null)} />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Job Description</span>
              {jdFile && <CheckCircle className="w-4 h-4 text-secondary ml-auto" />}
            </div>
            <UploadZone type="jd" icon={Briefcase} title="Upload Job Description" draggingTitle="Drop JD here"
              dragging={jdDragging} setDrag={setJdDragging} inputId="jd-input" onFile={handleFile} />
            {jdFile && <FilePreview uploaded={jdFile} onRemove={() => setJdFile(null)} />}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {resumeFile && jdFile && (
          <button onClick={handleAnalyze} disabled={uploading}
            className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Resume vs Job Description...
              </span>
            ) : "Analyze Resume Against Job Description"}
          </button>
        )}

        {resumeFile && !jdFile && <p className="mt-4 text-sm text-muted-foreground text-center">↑ Upload a job description to compare against your resume</p>}
        {!resumeFile && jdFile && <p className="mt-4 text-sm text-muted-foreground text-center">↑ Upload your resume to compare against the job description</p>}

        <div className="mt-8 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent" /> How It Works
          </h3>
          <ul className="space-y-2">
            {[
              "Upload your resume (PDF/DOC/DOCX) — we extract skills, experience & keywords",
              "Upload the target job description — we parse required skills & qualifications",
              "Our AI compares both documents and calculates your ATS compatibility score",
              "Get a detailed gap analysis showing matched vs missing skills",
              "Receive actionable suggestions to tailor your resume for the specific role",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-secondary mt-0.5">✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeUpload;
