import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minB, setMinB] = useState("");
  const [maxB, setMaxB] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  useEffect(() => {
    api("/api/tasks/categories")
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minB) params.set("minBudget", minB);
    if (maxB) params.set("maxBudget", maxB);
    if (featuredOnly) params.set("featured", "true");
    api(`/api/tasks?${params}`)
      .then((d) => {
        setTasks(d.tasks || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, q, category, minB, maxB, featuredOnly]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <section className="relative overflow-hidden bg-ck-blue text-white">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=600&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-ck-orangeSoft">Made for Indian campuses</p>
            <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              Hire students. Ship projects. Pay with confidence.
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Browse 120+ live tasks, compare bids, chat after acceptance, and release escrow when work is done.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
          <div className="min-w-[200px] flex-1">
            <label className="text-xs font-semibold text-slate-500">Search</label>
            <input
              className="ck-input mt-1"
              placeholder="Title, tag, or keyword"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-semibold text-slate-500">Category</label>
            <select
              className="ck-input mt-1"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs font-semibold text-slate-500">Min ₹</label>
            <input
              type="number"
              className="ck-input mt-1"
              value={minB}
              onChange={(e) => {
                setPage(1);
                setMinB(e.target.value);
              }}
            />
          </div>
          <div className="w-28">
            <label className="text-xs font-semibold text-slate-500">Max ₹</label>
            <input
              type="number"
              className="ck-input mt-1"
              value={maxB}
              onChange={(e) => {
                setPage(1);
                setMaxB(e.target.value);
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => {
                setPage(1);
                setFeaturedOnly(e.target.checked);
              }}
            />
            Featured only
          </label>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-slate-500">Loading marketplace…</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <Link key={t.id} to={`/tasks/${t.id}`} className="ck-card group block">
                <div className="relative h-44 overflow-hidden">
                  <img src={t.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                  {t.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-ck-orange px-2 py-0.5 text-xs font-bold text-white">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase text-ck-purple">{t.category}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-ck-ink line-clamp-2">{t.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{t.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(t.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-lg font-bold text-ck-blue">₹{Number(t.budget_inr).toLocaleString("en-IN")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="ck-btn-secondary disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            className="ck-btn-secondary disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
