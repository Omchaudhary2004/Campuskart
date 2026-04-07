import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { query } from "../db.js";
import { ensureCometUser } from "../services/cometchat.js";

const router = Router();

router.get("/token", authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(`SELECT name, avatar_url FROM users WHERE id = $1`, [req.user.id]);
    const u = rows[0];
    const result = await ensureCometUser(req.user.id, u.name, u.avatar_url);
    if (!result.configured) {
      return res.status(503).json({
        error: "CometChat not configured",
        hint: "Set COMETCHAT_APP_ID, COMETCHAT_REGION, COMETCHAT_REST_API_KEY",
      });
    }
    res.json({
      authToken: result.authToken,
      appId: result.appId,
      region: result.region,
      uid: result.uid,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Chat token failed" });
  }
});

export default router;
