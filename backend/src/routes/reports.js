import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  const { entity_type, entity_id, reason } = req.body;
  if (!entity_type || !entity_id || !reason) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const { rows } = await query(
    `INSERT INTO reports (reporter_id, entity_type, entity_id, reason) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, entity_type, entity_id, reason]
  );
  res.status(201).json({ report: rows[0] });
});

export default router;
