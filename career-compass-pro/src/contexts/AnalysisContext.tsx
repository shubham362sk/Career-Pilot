import { createContext, useContext, useState, ReactNode } from "react";
import type { AnalysisResult } from "@/lib/resumeAnalyzer";

interface AnalysisContextType {
  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;
  resumeName: string;
  setResumeName: (n: string) => void;
  jdName: string;
  setJdName: (n: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [jdName, setJdName] = useState("");

  return (
    <AnalysisContext.Provider value={{ result, setResult, resumeName, setResumeName, jdName, setJdName }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
