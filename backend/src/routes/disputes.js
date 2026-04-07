import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  const { task_id, notes } = req.body;
  if (!task_id) return res.status(400).json({ error: "task_id required" });
  const { rows: tr } = await query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
  if (!tr.length) return res.status(404).json({ error: "Task not found" });
  const t = tr[0];
  if (t.client_id !== req.user.id && t.assigned_student_id !== req.user.id) {
    return res.status(403).json({ error: "Not a party on this task" });
  }
  const { rows } = await query(
    `INSERT INTO disputes (task_id, opened_by, notes) VALUES ($1,$2,$3) RETURNING *`,
    [task_id, req.user.id, notes || null]
  );
  res.status(201).json({ dispute: rows[0] });
});

export default router;
