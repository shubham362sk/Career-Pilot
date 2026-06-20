import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { User, Mail, GraduationCap, Code, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, token, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    year: "2025",
    skills: "",
    linkedin: "",
    github: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/login");
      return;
    }
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        degree: user.degree || "",
        year: user.year || "2025",
        skills: user.skills || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        bio: user.bio || "",
      });
    }
  }, [user, token, authLoading, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        setSaved(true);
        toast.success("Profile updated successfully!");
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error(data.msg || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Profile Settings" subtitle="Manage your personal information">
      <div className="max-w-2xl">
        {/* Avatar Section */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {form.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">{form.name}</h2>
            <p className="text-muted-foreground text-sm">{form.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{form.college} · {form.degree} · Class of {form.year}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> College
                </label>
                <input
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">Graduation Year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {["2024", "2025", "2026", "2027"].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase flex items-center gap-1">
                <Code className="w-3 h-3" /> Skills (comma separated)
              </label>
              <input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">LinkedIn</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">GitHub</label>
                <input
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-primary disabled:opacity-70 ${
                saved ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
