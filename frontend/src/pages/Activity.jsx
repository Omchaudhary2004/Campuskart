import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export default function Activity() {
  const { user } = useAuth();
  const [tab, setTab] = useState("posted");
  const [posted, setPosted] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Programming",
    budget_inr: 2000,
    tags: "react, campus",
    image_url: "https://picsum.photos/seed/post/800/500",
  });
  const [msg, setMsg] = useState("");

  const load = () => {
    if (!user) return;
    api("/api/tasks/mine/posted").then((d) => setPosted(d.tasks || [])).catch(() => {});
    api("/api/tasks/mine/assigned").then((d) => setAssigned(d.tasks || [])).catch(() => {});
    api("/api/tasks/mine/completed").then((d) => setCompleted(d.tasks || [])).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [user]);

  const postTask = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await api("/api/tasks", {
        method: "POST",
        body: {
          title: form.title,
          description: form.description,
          category: form.category,
          budget_inr: Number(form.budget_inr),
          tags,
          image_url: form.image_url,
        },
      });
      setMsg("Task posted successfully.");
      setForm((f) => ({ ...f, title: "", description: "" }));
      load();
    } catch (err) {
      setMsg(err.data?.error || err.message);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-600">Sign in to manage activity.</p>
        <Link to="/auth" className="mt-4 inline-block ck-btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "posted", label: "Posted tasks" },
    { id: "accepted", label: "Accepted / in progress" },
    { id: "completed", label: "Completed" },
    { id: "post", label: "Post task" },
  ];

  const list =
    tab === "posted" ? posted : tab === "accepted" ? assigned : tab === "completed" ? completed : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ck-blue">Activity</h1>
      <p className="text-slate-600">Everything you&apos;re running on CampusKart.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id ? "bg-ck-blue text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "post" && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className="ck-card flex gap-4 p-4">
              <img src={t.image_url} alt="" className="h-24 w-32 shrink-0 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-semibold uppercase text-ck-purple">{t.status}</p>
                <p className="font-semibold text-ck-ink line-clamp-2">{t.title}</p>
                <p className="text-sm text-ck-blue">₹{Number(t.budget_inr).toLocaleString("en-IN")}</p>
              </div>
            </Link>
          ))}
          {!list.length && <p className="text-slate-500">Nothing here yet.</p>}
        </div>
      )}

      {tab === "post" && (
        <form onSubmit={postTask} className="mx-auto mt-8 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-ck-orange">Post a new task</h2>
          {user.role === "student" && (
            <p className="text-sm text-amber-700">
              Students typically bid on tasks. Switch to a client account to post, or ask an admin to elevate your role for
              testing.
            </p>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500">Title</label>
            <input className="ck-input mt-1" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Description</label>
            <textarea
              className="ck-input mt-1 min-h-[100px]"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Category</label>
              <input className="ck-input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Budget (INR)</label>
              <input
                type="number"
                className="ck-input mt-1"
                required
                min={100}
                value={form.budget_inr}
                onChange={(e) => setForm({ ...form, budget_inr: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Tags (comma separated)</label>
            <input className="ck-input mt-1" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Cover image URL</label>
            <input className="ck-input mt-1" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          {msg && <p className="text-sm text-ck-purple">{msg}</p>}
          <button type="submit" className="ck-btn-primary w-full" disabled={user.role === "student"}>
            Publish task
          </button>
        </form>
      )}
    </div>
  );
}
