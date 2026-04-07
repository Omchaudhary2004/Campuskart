import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [req.user.id]
  );
  res.json({ notifications: rows });
});

router.post("/:id/read", authMiddleware, async (req, res) => {
  await query(`UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`, [
    req.params.id,
    req.user.id,
  ]);
  res.json({ ok: true });
});

router.post("/read-all", authMiddleware, async (req, res) => {
  await query(`UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`, [req.user.id]);
  res.json({ ok: true });
});

export default router;
