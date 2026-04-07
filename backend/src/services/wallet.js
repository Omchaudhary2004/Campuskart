import { query } from "../db.js";

export async function ensureBalance(client, userId) {
  const { rows } = await client.query(
    `INSERT INTO user_balances (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING RETURNING *`,
    [userId]
  );
  if (!rows.length) {
    const r = await client.query(`SELECT * FROM user_balances WHERE user_id = $1`, [userId]);
    return r.rows[0];
  }
  return rows[0];
}

export async function getBalance(client, userId) {
  await ensureBalance(client, userId);
  const { rows } = await client.query(`SELECT * FROM user_balances WHERE user_id = $1`, [userId]);
  return rows[0];
}

export async function ledger(
  client,
  userId,
  { amount_inr = 0, amount_cc = 0, type, reference_type = null, reference_id = null, note = null }
) {
  const bal = await getBalance(client, userId);
  const nextInr = Number(bal.balance_inr) + Number(amount_inr);
  const nextCc = Number(bal.balance_cc) + Number(amount_cc);
  await client.query(
    `UPDATE user_balances SET balance_inr = $2, balance_cc = $3 WHERE user_id = $1`,
    [userId, nextInr, nextCc]
  );
  await client.query(
    `INSERT INTO wallet_ledger (user_id, amount_inr, amount_cc, type, reference_type, reference_id, balance_after_inr, balance_after_cc, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [userId, amount_inr, amount_cc, type, reference_type, reference_id, nextInr, nextCc, note]
  );
}

export async function adjustPendingEarnings(client, userId, delta) {
  await client.query(
    `UPDATE user_balances SET pending_earnings_inr = pending_earnings_inr + $2 WHERE user_id = $1`,
    [userId, delta]
  );
}
