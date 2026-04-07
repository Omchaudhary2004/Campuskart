import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { task_id, to_user_id, rating, comment } = req.body;
    if (!task_id || !to_user_id || !rating) return res.status(400).json({ error: "Missing fields" });
    const r = Number(rating);
    if (r < 1 || r > 5) return res.status(400).json({ error: "Invalid rating" });
    const { rows: tr } = await query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
    if (!tr.length || tr[0].status !== "completed") {
      return res.status(400).json({ error: "Task not completed" });
    }
    const t = tr[0];
    const allowed =
      (t.client_id === req.user.id && t.assigned_student_id === to_user_id) ||
      (t.assigned_student_id === req.user.id && t.client_id === to_user_id);
    if (!allowed) return res.status(403).json({ error: "Invalid review target" });
    const { rows } = await query(
      `INSERT INTO reviews (task_id, from_user_id, to_user_id, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [task_id, req.user.id, to_user_id, r, comment || null]
    );
    res.status(201).json({ review: rows[0] });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Already reviewed" });
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, u.name AS from_name FROM reviews r JOIN users u ON u.id = r.from_user_id WHERE r.to_user_id = $1 ORDER BY r.created_at DESC`,
    [req.params.userId]
  );
  res.json({ reviews: rows });
});

export default router;
