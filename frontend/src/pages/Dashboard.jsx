import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api, assetUrl } from "../api.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [resume, setResume] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    api("/api/dashboard/stats").then(setStats).catch(() => {});
    api("/api/users/me/resume")
      .then(setResume)
      .catch(() => {});
    api("/api/notifications")
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-600">Sign in to view your dashboard.</p>
        <Link to="/auth" className="mt-4 inline-block ck-btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ck-blue">Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user.name}</p>
        </div>
        <img
          src={
            user.avatar_url?.startsWith("http")
              ? user.avatar_url
              : assetUrl(user.avatar_url) || `https://i.pravatar.cc/120?u=${user.email}`
          }
          alt=""
          className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Active tasks", value: stats?.activeTasks ?? "—", color: "bg-ck-blue" },
          { label: "Completed", value: stats?.completedTasks ?? "—", color: "bg-ck-purple" },
          { label: "Earnings (released)", value: stats ? `₹${Number(stats.earningsInr).toFixed(2)}` : "—", color: "bg-ck-orange" },
        ].map((s) => (
          <div key={s.label} className="ck-card flex items-center gap-4 p-5">
            <div className={`h-12 w-1 rounded-full ${s.color}`} />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{s.label}</p>
              <p className="font-display text-2xl font-bold text-ck-ink">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="ck-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ck-purple">Virtual resume</h2>
            <Link to="/profile" className="text-sm font-semibold text-ck-orange hover:underline">
              Edit profile & links
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Auto-updated when you complete tasks—skills and project blurbs are appended from delivered work.
          </p>
          <div className="mt-4 rounded-xl bg-ck-cream p-4">
            <p className="text-sm font-semibold text-ck-blue">Summary</p>
            <p className="mt-1 text-sm text-slate-700">{resume?.profile?.bio || "Add a short bio from Profile."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {(() => {
                let s = resume?.profile?.social_links;
                if (typeof s === "string") {
                  try {
                    s = JSON.parse(s);
                  } catch {
                    s = null;
                  }
                }
                return s && typeof s === "object"
                  ? Object.entries(s).map(([k, v]) =>
                      v ? (
                        <a key={k} href={String(v)} className="rounded-full bg-white px-2 py-1 text-ck-blue ring-1 ring-slate-200">
                          {k}
                        </a>
                      ) : null
                    )
                  : null;
              })()}
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {(resume?.items || []).slice(0, 12).map((it) => (
              <li key={it.id} className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                <span className="font-semibold text-ck-ink">{it.title}</span>
                <span className="text-xs text-ck-purple"> · {it.item_type}</span>
                {it.proficiency && <span className="text-xs text-slate-500"> · {it.proficiency}</span>}
                <p className="mt-1 text-slate-600 line-clamp-3">{it.description}</p>
              </li>
            ))}
            {!resume?.items?.length && <li className="text-sm text-slate-500">Complete a task to populate your resume.</li>}
          </ul>
        </section>

        <section className="ck-card p-6">
          <h2 className="font-display text-xl font-bold text-ck-orange">Notifications</h2>
          <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border px-3 py-2 text-sm ${n.read ? "border-slate-100 bg-white" : "border-ck-orange/40 bg-orange-50"}`}
              >
                <p className="font-semibold text-ck-ink">{n.title}</p>
                <p className="text-slate-600">{n.body}</p>
                <p className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
              </li>
            ))}
            {!notifications.length && <li className="text-slate-500">No notifications yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
