import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { query } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/public/:id", async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, avatar_url, bio, role, created_at FROM users WHERE id = $1 AND blocked = FALSE`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json({ user: rows[0] });
});

router.patch("/me", authMiddleware, async (req, res) => {
  const { name, phone, bio, avatar_url, social_links } = req.body;
  const fields = [];
  const vals = [];
  let i = 1;
  if (name !== undefined) {
    fields.push(`name = $${i++}`);
    vals.push(name);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${i++}`);
    vals.push(phone);
  }
  if (bio !== undefined) {
    fields.push(`bio = $${i++}`);
    vals.push(bio);
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${i++}`);
    vals.push(avatar_url);
  }
  if (social_links !== undefined) {
    fields.push(`social_links = $${i++}::jsonb`);
    vals.push(JSON.stringify(social_links));
  }
  if (!fields.length) return res.status(400).json({ error: "No updates" });
  fields.push(`updated_at = NOW()`);
  vals.push(req.user.id);
  const { rows } = await query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING id, email, role, name, avatar_url, phone, bio, social_links`,
    vals
  );
  res.json({ user: rows[0] });
});

router.post("/me/avatar", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/uploads/${req.file.filename}`;
  const { rows } = await query(`UPDATE users SET avatar_url = $2 WHERE id = $1 RETURNING avatar_url`, [
    req.user.id,
    url,
  ]);
  res.json({ avatar_url: rows[0].avatar_url });
});

router.get("/me/resume", authMiddleware, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM resume_items WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  const { rows: u } = await query(`SELECT bio, social_links, name FROM users WHERE id = $1`, [
    req.user.id,
  ]);
  res.json({ items: rows, profile: u[0] });
});

export default router;
