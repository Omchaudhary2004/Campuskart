import { Router } from "express";
import { query, pool } from "../db.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { isEduEmail } from "../utils/email.js";

const router = Router();
router.use(authMiddleware, requireRole("admin"));

router.get("/analytics", async (_req, res) => {
  const { rows: u } = await query(`SELECT COUNT(*)::int AS c FROM users`);
  const { rows: t } = await query(`SELECT COUNT(*)::int AS c FROM tasks`);
  const { rows: tr } = await query(`SELECT COUNT(*)::int AS c FROM wallet_ledger`);
  const { rows: open } = await query(`SELECT COUNT(*)::int AS c FROM tasks WHERE status = 'open'`);
  const { rows: prog } = await query(`SELECT COUNT(*)::int AS c FROM tasks WHERE status = 'in_progress'`);
  const { rows: done } = await query(`SELECT COUNT(*)::int AS c FROM tasks WHERE status = 'completed'`);
  const { rows: vol } = await query(
    `SELECT COALESCE(SUM(amount_inr),0)::numeric AS s FROM wallet_ledger WHERE type IN ('deposit','escrow_release')`
  );
  res.json({
    totalUsers: u[0].c,
    totalTasks: t[0].c,
    totalLedgerEvents: tr[0].c,
    tasksOpen: open[0].c,
    tasksInProgress: prog[0].c,
    tasksCompleted: done[0].c,
    approximateVolumeInr: Number(vol[0].s),
  });
});

router.get("/users", async (_req, res) => {
  const { rows } = await query(
    `SELECT id, email, role, name, blocked, created_at FROM users ORDER BY created_at DESC LIMIT 500`
  );
  res.json({ users: rows });
});

router.patch("/users/:id", async (req, res) => {
  const { blocked, role, name } = req.body;
  const fields = [];
  const vals = [];
  let i = 1;
  if (blocked !== undefined) {
    fields.push(`blocked = $${i++}`);
    vals.push(!!blocked);
  }
  if (role !== undefined) {
    if (!["client", "student", "admin"].includes(role)) return res.status(400).json({ error: "Bad role" });
    fields.push(`role = $${i++}`);
    vals.push(role);
  }
  if (name !== undefined) {
    fields.push(`name = $${i++}`);
    vals.push(name);
  }
  if (!fields.length) return res.status(400).json({ error: "Nothing to update" });
  vals.push(req.params.id);
  await query(`UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${i}`, vals);
  res.json({ ok: true });
});

router.delete("/users/:id", async (req, res) => {
  await query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

router.get("/tasks", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 500`);
  res.json({ tasks: rows });
});

router.patch("/tasks/:id", async (req, res) => {
  const { title, description, category, budget_inr, status, featured } = req.body;
  const fields = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries({
    title,
    description,
    category,
    budget_inr,
    status,
    featured,
  })) {
    if (v !== undefined) {
      fields.push(`${k} = $${i++}`);
      vals.push(v);
    }
  }
  if (!fields.length) return res.status(400).json({ error: "Nothing to update" });
  vals.push(req.params.id);
  await query(`UPDATE tasks SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${i}`, vals);
  res.json({ ok: true });
});

router.delete("/tasks/:id", async (req, res) => {
  await query(`DELETE FROM tasks WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

router.get("/bids", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM bids ORDER BY created_at DESC LIMIT 500`);
  res.json({ bids: rows });
});

router.delete("/bids/:id", async (req, res) => {
  await query(`DELETE FROM bids WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

router.get("/reports", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM reports ORDER BY created_at DESC`);
  res.json({ reports: rows });
});

router.post("/reports/:id/resolve", async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Bad status" });
  await query(`UPDATE reports SET status = $1 WHERE id = $2`, [status, req.params.id]);
  res.json({ ok: true });
});

router.get("/transactions", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM wallet_ledger ORDER BY created_at DESC LIMIT 500`);
  res.json({ entries: rows });
});

router.get("/withdrawals", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM withdrawals ORDER BY created_at DESC`);
  res.json({ withdrawals: rows });
});

router.patch("/withdrawals/:id", async (req, res) => {
  const { status } = req.body;
  if (!["pending", "processing", "completed", "failed"].includes(status)) {
    return res.status(400).json({ error: "Bad status" });
  }
  await query(`UPDATE withdrawals SET status = $1 WHERE id = $2`, [status, req.params.id]);
  res.json({ ok: true });
});

router.get("/disputes", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM disputes ORDER BY created_at DESC`);
  res.json({ disputes: rows });
});

router.post("/disputes/:id/resolve", async (req, res) => {
  const { status, resolution_notes } = req.body;
  if (!status) return res.status(400).json({ error: "Missing status" });
  await query(`UPDATE disputes SET status = $1, resolution_notes = $2 WHERE id = $3`, [
    status,
    resolution_notes || null,
    req.params.id,
  ]);
  res.json({ ok: true });
});

router.post("/promote-admin", async (req, res) => {
  const { email } = req.body;
  if (!email || !isEduEmail(email)) {
    return res.status(400).json({ error: "Admin promotions require .edu / .ac.in email" });
  }
  await query(`UPDATE users SET role = 'admin' WHERE email = $1`, [email.toLowerCase().trim()]);
  res.json({ ok: true });
});

export default router;
