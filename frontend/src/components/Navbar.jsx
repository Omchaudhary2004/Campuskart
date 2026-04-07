import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { api } from "../api.js";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-ck-blue text-white" : "text-slate-700 hover:bg-slate-100"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api("/api/notifications");
        const n = data.notifications?.filter((x) => !x.read).length || 0;
        if (!cancelled) setUnread(n);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ck-blue">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ck-blue text-sm font-bold text-white">
            CK
          </span>
          CampusKart
        </Link>
        <nav className="hidden flex-wrap items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/activity" className={linkClass}>
                Activity
              </NavLink>
              <NavLink to="/wallet" className={linkClass}>
                Wallet
              </NavLink>
            </>
          )}
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          {user && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/dashboard"
              className="relative hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-block"
            >
              Alerts
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ck-orange px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <button type="button" onClick={logout} className="ck-btn-secondary !py-2 !text-xs">
              Log out
            </button>
          ) : (
            <Link to="/auth" className="ck-btn-primary !py-2 !text-xs">
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-2 md:hidden">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        {user && (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/activity" className={linkClass}>
              Activity
            </NavLink>
            <NavLink to="/wallet" className={linkClass}>
              Wallet
            </NavLink>
          </>
        )}
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
        {user && <NavLink to="/profile" className={linkClass}>Profile</NavLink>}
      </div>
    </header>
  );
}
