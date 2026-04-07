import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") await login(email, password);
      else await register({ email, password, name, role });
    } catch (er) {
      setErr(er.data?.error || er.message);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
      <div>
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&h=800&fit=crop"
          alt=""
          className="rounded-3xl border border-slate-200 shadow-lg"
        />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-ck-blue">{mode === "login" ? "Welcome back" : "Join CampusKart"}</h1>
        <p className="text-sm text-slate-600">
          Clients may use any email. Students and admins need an institutional email (.ac.in, .edu.in, .edu, etc.).
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${mode === "login" ? "bg-ck-blue text-white" : "bg-slate-100"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${mode === "register" ? "bg-ck-blue text-white" : "bg-slate-100"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500">Name</label>
                <input className="ck-input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Role</label>
                <select className="ck-input mt-1" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="client">Client</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin (edu only)</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input type="email" className="ck-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <input type="password" className="ck-input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button type="submit" className="ck-btn-primary w-full">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Demo: client@gmail.com / student@university.ac.in / admin@university.ac.in — password <code>demo1234</code> after seed.
        </p>
      </div>
    </div>
  );
}
