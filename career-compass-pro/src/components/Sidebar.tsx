import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  Briefcase,
  Target,
  Trophy,
  User,
  LogOut,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Resume Upload", path: "/resume-upload" },
  { icon: FileSearch, label: "Resume Analysis", path: "/resume-analysis" },
  { icon: Briefcase, label: "Job Matching", path: "/job-matching" },
  { icon: Target, label: "Application Tracker", path: "/application-tracker" },
  { icon: Trophy, label: "Placement Readiness", path: "/placement-readiness" },
  { icon: Award, label: "Resume Ranking", path: "/resume-ranking" },
  { icon: User, label: "Profile", path: "/profile" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="w-9 h-9 rounded-lg shrink-0" width={36} height={36} />
          <span className="font-bold text-foreground text-sm leading-tight">Career-Pilot</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
