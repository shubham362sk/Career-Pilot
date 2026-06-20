import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Briefcase, Clock, CheckCircle, XCircle, Star, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";

type Status = "Applied" | "Shortlisted" | "Interview" | "Rejected";

interface Application {
  _id?: string;
  company: string;
  role: string;
  date: string;
  status: Status;
  salary: string;
}

const ApplicationTracker = () => {
  const { token } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState<Omit<Application, "_id">>({
    company: "",
    role: "",
    date: new Date().toISOString().split("T")[0],
    status: "Applied",
    salary: "",
  });

  const fetchApps = async () => {
    try {
      const res = await fetch(apiUrl("/api/applications"), {
        headers: { "x-auth-token": token || "" },
      });
      const data = await res.json();
      if (res.ok) {
        setApps(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApps();
    } else {
      setApps([]);
      setLoading(false);
    }
  }, [token]);

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl("/api/applications"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify(newApp),
      });
      const data = await res.json();
      if (res.ok) {
        setApps([data, ...apps]);
        setShowForm(false);
        setNewApp({
          company: "",
          role: "",
          date: new Date().toISOString().split("T")[0],
          status: "Applied",
          salary: "",
        });
        toast.success("Application added!");
      }
    } catch (err) {
      toast.error("Failed to add application");
    }
  };

  const handleUpdateStatus = async (id: string, status: Status) => {
    try {
      const res = await fetch(apiUrl(`/api/applications/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setApps(apps.map((a) => (a._id === id ? data : a)));
        toast.success("Status updated!");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statusConfig: Record<Status, { color: string; bg: string; icon: React.ElementType }> = {
    Applied: { color: "text-primary", bg: "bg-primary-light", icon: Clock },
    Shortlisted: { color: "text-accent", bg: "bg-accent/10", icon: Star },
    Interview: { color: "text-secondary", bg: "bg-secondary/10", icon: CheckCircle },
    Rejected: { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
  };

  return (
    <DashboardLayout title="Application Tracker" subtitle="Manage and track your job applications">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">My Applications ({apps.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-card rounded-2xl border border-border p-6 shadow-card animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddApp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">Company</label>
              <input
                required
                value={newApp.company}
                onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Google, Microsoft..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">Role</label>
              <input
                required
                value={newApp.role}
                onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Software Engineer..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">Salary</label>
              <input
                value={newApp.salary}
                onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="$100k, 8LPA..."
              />
            </div>
            <div className="lg:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Save Application
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No applications found. Add your first application above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div key={app._id} className="bg-card rounded-2xl border border-border shadow-card p-5 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{app.company}</h3>
                    <p className="text-xs text-muted-foreground">{app.role}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusConfig[app.status].bg} ${statusConfig[app.status].color}`}>
                  {(() => {
                    const Icon = statusConfig[app.status].icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {app.status}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(app.date).toLocaleDateString()}
                </span>
                <span>{app.salary}</span>
              </div>

              <div className="pt-4 border-t border-border flex gap-2 overflow-x-auto">
                {(["Applied", "Shortlisted", "Interview", "Rejected"] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(app._id!, s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors whitespace-nowrap ${
                      app.status === s ? statusConfig[s].bg + " " + statusConfig[s].color : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApplicationTracker;
