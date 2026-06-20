import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import JobMatching from "./pages/JobMatching";
import ApplicationTracker from "./pages/ApplicationTracker";
import PlacementReadiness from "./pages/PlacementReadiness";
import ResumeRanking from "./pages/ResumeRanking";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AnalysisProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume-upload" element={<ResumeUpload />} />
              <Route path="/resume-analysis" element={<ResumeAnalysis />} />
              <Route path="/job-matching" element={<JobMatching />} />
              <Route path="/application-tracker" element={<ApplicationTracker />} />
              <Route path="/placement-readiness" element={<PlacementReadiness />} />
              <Route path="/resume-ranking" element={<ResumeRanking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AnalysisProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
