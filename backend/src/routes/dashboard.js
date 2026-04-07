import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/stats", authMiddleware, async (req, res) => {
  const uid = req.user.id;
  const { rows: active } = await query(
    `SELECT COUNT(*)::int AS c FROM tasks WHERE status = 'in_progress' AND (client_id = $1 OR assigned_student_id = $1)`,
    [uid]
  );
  const { rows: completed } = await query(
    `SELECT COUNT(*)::int AS c FROM tasks WHERE status = 'completed' AND (client_id = $1 OR assigned_student_id = $1)`,
    [uid]
  );
  const { rows: earn } = await query(
    `SELECT COALESCE(SUM(amount_inr),0)::numeric AS s FROM wallet_ledger WHERE user_id = $1 AND type = 'escrow_release'`,
    [uid]
  );
  res.json({
    activeTasks: active[0].c,
    completedTasks: completed[0].c,
    earningsInr: Number(earn[0].s),
  });
});

export default router;
