import { useState } from "react";

const ACCESS = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

export default function Contact() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!ACCESS) {
      setStatus("Set VITE_WEB3FORMS_ACCESS_KEY and route submissions to campuskartindia@gmail.com in Web3Forms.");
      return;
    }
    setPending(true);
    setStatus("");
    const fd = new FormData(e.target);
    fd.append("access_key", ACCESS);
    fd.append("subject", "CampusKart contact form");
    fd.append("from_name", fd.get("name"));
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) setStatus("Thanks — we’ll reply at campuskartindia@gmail.com.");
      else setStatus(data.message || "Could not send.");
    } catch {
      setStatus("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-start">
      <div>
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=900&h=700&fit=crop"
          alt="Contact"
          className="rounded-3xl border border-slate-200 shadow-md"
        />
        <p className="mt-6 text-sm text-slate-600">
          Direct email:{" "}
          <a className="font-semibold text-ck-orange" href="mailto:campuskartindia@gmail.com">
            campuskartindia@gmail.com
          </a>
        </p>
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold text-ck-blue">Contact</h1>
        <p className="text-slate-600">Partnerships, press, or campus programs — we read every message.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="redirect" value="false" />
          <div>
            <label className="text-xs font-semibold text-slate-500">Name</label>
            <input name="name" required className="ck-input mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input type="email" name="email" required className="ck-input mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Message</label>
            <textarea name="message" required className="ck-input mt-1 min-h-[140px]" />
          </div>
          <button type="submit" disabled={pending} className="ck-btn-primary w-full">
            {pending ? "Sending…" : "Send via Web3Forms"}
          </button>
          {status && <p className="text-sm text-ck-purple">{status}</p>}
          {!ACCESS && (
            <p className="text-xs text-amber-700">
              Add your Web3Forms access key to <code className="rounded bg-slate-100 px-1">frontend/.env</code> and set the
              destination inbox to campuskartindia@gmail.com in the Web3Forms dashboard.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
