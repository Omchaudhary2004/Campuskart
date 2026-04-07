import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api, assetUrl } from "../api.js";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", bio: "", linkedin: "", github: "", portfolio: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    let s = user.social_links || {};
    if (typeof s === "string") {
      try {
        s = JSON.parse(s);
      } catch {
        s = {};
      }
    }
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      bio: user.bio || "",
      linkedin: s.linkedin || "",
      github: s.github || "",
      portfolio: s.portfolio || "",
    });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api("/api/users/me", {
        method: "PATCH",
        body: {
          name: form.name,
          phone: form.phone,
          bio: form.bio,
          social_links: {
            linkedin: form.linkedin,
            github: form.github,
            portfolio: form.portfolio,
          },
        },
      });
      await refresh();
      setMsg("Profile updated.");
    } catch (err) {
      setMsg(err.data?.error || err.message);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const token = localStorage.getItem("ck_token");
    const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/users/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Upload failed");
      return;
    }
    await refresh();
    setMsg("Avatar updated.");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Link to="/auth" className="ck-btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ck-blue">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <img
          src={
            user.avatar_url?.startsWith("http")
              ? user.avatar_url
              : assetUrl(user.avatar_url) || `https://i.pravatar.cc/120?u=${user.email}`
          }
          alt=""
          className="h-24 w-24 rounded-2xl border object-cover"
        />
        <div>
          <label className="ck-btn-secondary cursor-pointer text-xs">
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </label>
          <p className="mt-2 text-xs text-slate-500">{user.email}</p>
          <p className="text-xs font-semibold uppercase text-ck-purple">{user.role}</p>
        </div>
      </div>
      <form onSubmit={save} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-500">Display name</label>
          <input className="ck-input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Phone</label>
          <input className="ck-input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Bio (resume summary)</label>
          <textarea className="ck-input mt-1 min-h-[100px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">LinkedIn</label>
          <input className="ck-input mt-1" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">GitHub</label>
          <input className="ck-input mt-1" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Portfolio</label>
          <input className="ck-input mt-1" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
        </div>
        {msg && <p className="text-sm text-ck-purple">{msg}</p>}
        <button type="submit" className="ck-btn-primary w-full">
          Save profile
        </button>
      </form>
    </div>
  );
}
