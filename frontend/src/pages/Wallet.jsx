import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export default function Wallet() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [depositAmt, setDepositAmt] = useState(1000);
  const [ccAmt, setCcAmt] = useState(100);
  const [wAmt, setWAmt] = useState(100);
  const [wMethod, setWMethod] = useState("upi");
  const [wDest, setWDest] = useState("user@upi");
  const [note, setNote] = useState("");

  const refresh = () => {
    if (!user) return;
    api("/api/wallet/summary").then(setSummary).catch(() => {});
    api("/api/wallet/ledger").then((d) => setLedger(d.entries || [])).catch(() => {});
    api("/api/wallet/withdrawals").then((d) => setWithdrawals(d.withdrawals || [])).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const simulateDeposit = async () => {
    setNote("");
    try {
      const init = await api("/api/wallet/paytm/initiate", { method: "POST", body: { amount_inr: Number(depositAmt) } });
      if (init.mode === "simulated") {
        await api("/api/wallet/paytm/simulate-confirm", {
          method: "POST",
          body: { orderId: init.orderId, amount_inr: Number(depositAmt) },
        });
        setNote("Simulated Paytm top-up applied (dev). Configure Paytm keys for live checkout.");
      } else {
        setNote("Paytm configured: complete checkout on Paytm per your integration (see API_REQUIREMENTS.md).");
      }
      refresh();
    } catch (e) {
      setNote(e.data?.error || e.message);
    }
  };

  const convertCc = async () => {
    setNote("");
    try {
      await api("/api/wallet/convert-cc", { method: "POST", body: { campus_coins: Number(ccAmt) } });
      setNote("Converted CampusCoin to INR.");
      refresh();
    } catch (e) {
      setNote(e.data?.error || e.message);
    }
  };

  const withdraw = async () => {
    setNote("");
    try {
      await api("/api/wallet/withdraw", {
        method: "POST",
        body: { amount_inr: Number(wAmt), method: wMethod, destination: wDest },
      });
      setNote("Withdrawal submitted (processing).");
      refresh();
    } catch (e) {
      setNote(e.data?.error || e.message);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-600">Sign in for wallet & escrow.</p>
        <Link to="/auth" className="mt-4 inline-block ck-btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-bold text-ck-blue">Wallet</h1>
          <p className="text-slate-600">
            Escrow holds client funds until tasks complete. <span className="font-semibold text-ck-purple">10 CC = ₹1</span>{" "}
            when converting CampusCoin.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="ck-card p-5">
              <p className="text-xs font-semibold uppercase text-slate-500">Balance (INR)</p>
              <p className="mt-1 font-display text-3xl font-bold text-ck-blue">
                ₹{summary ? Number(summary.balance_inr).toFixed(2) : "—"}
              </p>
            </div>
            <div className="ck-card p-5">
              <p className="text-xs font-semibold uppercase text-slate-500">CampusCoin</p>
              <p className="mt-1 font-display text-3xl font-bold text-ck-purple">
                {summary ? Number(summary.balance_cc).toFixed(0) : "—"} CC
              </p>
            </div>
            <div className="ck-card p-5">
              <p className="text-xs font-semibold uppercase text-slate-500">Pending earnings</p>
              <p className="mt-1 font-display text-2xl font-bold text-ck-orange">
                ₹{summary ? Number(summary.pending_earnings_inr).toFixed(2) : "—"}
              </p>
            </div>
            <div className="ck-card p-5">
              <p className="text-xs font-semibold uppercase text-slate-500">Your escrow locked (as client)</p>
              <p className="mt-1 font-display text-2xl font-bold text-ck-ink">
                ₹{summary ? Number(summary.escrow_locked_inr).toFixed(2) : "—"}
              </p>
            </div>
          </div>

          <section className="mt-8 ck-card p-6">
            <h2 className="font-display text-lg font-bold text-ck-orange">Paytm top-up (escrow funding)</h2>
            <p className="text-sm text-slate-600">
              Live flow uses Paytm transaction APIs + checksum. Dev uses one-click simulation.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-slate-500">Amount ₹</label>
                <input type="number" className="ck-input mt-1 w-32" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} />
              </div>
              <button type="button" className="ck-btn-primary" onClick={simulateDeposit}>
                Add funds
              </button>
            </div>
          </section>

          <section className="mt-6 ck-card p-6">
            <h2 className="font-display text-lg font-bold text-ck-purple">Convert CampusCoin → INR</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-slate-500">CC (multiples of 10)</label>
                <input type="number" className="ck-input mt-1 w-32" value={ccAmt} onChange={(e) => setCcAmt(e.target.value)} />
              </div>
              <button type="button" className="ck-btn-secondary" onClick={convertCc}>
                Convert
              </button>
            </div>
          </section>

          <section className="mt-6 ck-card p-6">
            <h2 className="font-display text-lg font-bold text-ck-blue">Withdraw (min ₹100)</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">Amount ₹</label>
                <input type="number" className="ck-input mt-1" value={wAmt} onChange={(e) => setWAmt(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Method</label>
                <select className="ck-input mt-1" value={wMethod} onChange={(e) => setWMethod(e.target.value)}>
                  <option value="upi">UPI ID</option>
                  <option value="qr">QR / reference</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">UPI or QR reference</label>
                <input className="ck-input mt-1" value={wDest} onChange={(e) => setWDest(e.target.value)} />
              </div>
            </div>
            <button type="button" className="ck-btn-primary mt-4" onClick={withdraw}>
              Request withdrawal
            </button>
          </section>

          {note && <p className="mt-4 text-sm font-medium text-ck-purple">{note}</p>}
        </div>

        <div>
          <section className="ck-card p-4">
            <h3 className="font-display font-bold text-ck-blue">Transaction history</h3>
            <ul className="mt-3 max-h-[320px] space-y-2 overflow-y-auto text-xs">
              {ledger.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-100 px-2 py-2">
                  <span className="font-semibold text-ck-ink">{e.type}</span>
                  <span className="text-slate-500"> · {new Date(e.created_at).toLocaleString()}</span>
                  <div className="text-slate-600">
                    ₹{Number(e.amount_inr).toFixed(2)} · CC {Number(e.amount_cc).toFixed(0)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="ck-card mt-4 p-4">
            <h3 className="font-display font-bold text-ck-orange">Withdrawals</h3>
            <ul className="mt-3 max-h-[220px] space-y-2 overflow-y-auto text-xs">
              {withdrawals.map((w) => (
                <li key={w.id} className="rounded-lg border border-slate-100 px-2 py-2">
                  ₹{Number(w.amount_inr).toFixed(2)} · {w.method} · {w.status}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
