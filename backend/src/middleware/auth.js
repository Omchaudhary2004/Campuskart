import jwt from "jsonwebtoken";
import { query } from "../db.js";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = verifyToken(token);
    const { rows } = await query(
      `SELECT id, email, role, name, avatar_url, blocked FROM users WHERE id = $1`,
      [decoded.sub]
    );
    if (!rows.length || rows[0].blocked) {
      return res.status(403).json({ error: "Account inactive or blocked" });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
