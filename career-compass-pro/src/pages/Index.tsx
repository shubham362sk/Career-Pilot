import { Link } from "react-router-dom";
import { Upload, Search, Briefcase, Zap, ArrowRight, Github, Linkedin, Twitter, Facebook, ChevronRight } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.svg" alt="" className="w-9 h-9 rounded-lg" width={36} height={36} />
        <span className="font-bold text-foreground text-base">Career-Pilot</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">About</a>
        <a href="#how-it-works" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Contact</a>
        <a href="https://github.com" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Github</a>
      </div>
      <Link
        to="/login"
        className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-primary"
      >
        Login/Sign Up
      </Link>
    </div>
  </nav>
);

const features = [
  {
    icon: Upload,
    title: "Resume Upload & Parsing",
    desc: "Upload & analyze your resume instantly with AI-powered parsing.",
  },
  {
    icon: Search,
    title: "Skill Gap Analysis",
    desc: "Identify missing skills for your target role and get actionable insights.",
  },
  {
    icon: Briefcase,
    title: "Application Tracker",
    desc: "Identify and track all your job applications with real-time status updates.",
  },
  {
    icon: Zap,
    title: "Smart Job Matching",
    desc: "Find jobs best tailored to your profile. Gauge your job preferences.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient min-h-screen pt-24 pb-0 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/8 blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 py-16">
          <div className="flex-1 max-w-xl animate-fade-up">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-5">
              Boost Your<br />
              <span className="text-primary">Placement</span><br />
              Success with AI
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Analyze Resume, Improve ATS Score, Match Jobs, Track Readiness
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-primary flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="bg-card text-foreground border border-border px-7 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
              >
                View Demo
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end animate-float">
            <img
              src={heroIllustration}
              alt="AI Resume Analysis"
              className="w-full max-w-md lg:max-w-lg object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-20">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="hsl(210 20% 98%)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-10">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-primary hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <f.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 gradient-dark">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary-foreground mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* CTA Card */}
            <div className="bg-card/10 backdrop-blur rounded-2xl p-8 border border-primary-foreground/10">
              <h3 className="text-xl font-bold text-primary-foreground mb-4 leading-snug">
                Start Your Placement<br />Journey Today
              </h3>
              <Link
                to="/register"
                className="inline-block bg-card text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-light transition-colors"
              >
                Create Free Account
              </Link>
            </div>

            {/* Arrow + Stats */}
            <div className="hidden md:flex items-center justify-center">
              <ChevronRight className="w-10 h-10 text-primary-foreground/40" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/10 rounded-2xl p-6 border border-primary-foreground/10 text-center">
                <div className="text-4xl font-extrabold text-primary-foreground mb-1">2000+</div>
                <div className="text-xs text-primary-foreground/70">Students Jobs Analyzed</div>
                <div className="flex justify-center gap-4 mt-3 text-primary-foreground/50">
                  <span>🎓</span>
                  <span>💼</span>
                </div>
              </div>
              <div className="bg-card/10 rounded-2xl p-6 border border-primary-foreground/10 text-center">
                <div className="text-4xl font-extrabold text-primary-foreground mb-1">85%</div>
                <div className="text-xs text-primary-foreground/70">Average ATS Score Improvement</div>
                <div className="mt-3 bg-primary-foreground/20 rounded-full h-1.5">
                  <div className="bg-primary-foreground rounded-full h-1.5" style={{ width: '85%' }} />
                </div>
                <div className="text-xs text-primary-foreground/50 mt-1">85/100 score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">About</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Contact</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Project Team</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Github Link</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
