import { query } from "../db.js";

export async function notify(userId, type, title, body, meta = {}) {
  await query(
    `INSERT INTO notifications (user_id, type, title, body, meta) VALUES ($1,$2,$3,$4,$5)`,
    [userId, type, title, body, JSON.stringify(meta)]
  );
}
