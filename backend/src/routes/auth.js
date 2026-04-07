import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { signToken, authMiddleware } from "../middleware/auth.js";
import { isEduEmail } from "../utils/email.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (!["client", "student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if ((role === "student" || role === "admin") && !isEduEmail(email)) {
      return res.status(400).json({
        error: "Students and admins must register with an institutional (.ac.in / .edu.in / .edu) email.",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4)
       RETURNING id, email, role, name, avatar_url, created_at`,
      [email.toLowerCase().trim(), hash, name.trim(), role]
    );
    await query(`INSERT INTO user_balances (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [
      rows[0].id,
    ]);
    const token = signToken({ sub: rows[0].id, role: rows[0].role });
    res.json({ user: rows[0], token });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Email already registered" });
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
    const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const u = rows[0];
    if (u.blocked) return res.status(403).json({ error: "Account blocked" });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken({ sub: u.id, role: u.role });
    delete u.password_hash;
    res.json({
      user: u,
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const { rows } = await query(
    `SELECT id, email, role, name, avatar_url, phone, bio, social_links, blocked, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json({ user: rows[0] });
});

export default router;
