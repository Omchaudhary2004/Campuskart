import { Router } from "express";
import crypto from "crypto";
import { query, pool } from "../db.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { getBalance, ledger } from "../services/wallet.js";

const router = Router();
const MIN_WITHDRAW = 100;

router.get("/summary", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const bal = await getBalance(client, req.user.id);
    const { rows: pend } = await client.query(
      `SELECT COALESCE(SUM(amount_inr),0)::numeric AS s FROM escrow_holds WHERE client_id = $1 AND status = 'held'`,
      [req.user.id]
    );
    res.json({
      balance_inr: Number(bal.balance_inr),
      balance_cc: Number(bal.balance_cc),
      pending_earnings_inr: Number(bal.pending_earnings_inr),
      escrow_locked_inr: Number(pend[0].s),
    });
  } finally {
    client.release();
  }
});

router.get("/ledger", authMiddleware, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM wallet_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [req.user.id]
  );
  res.json({ entries: rows });
});

router.get("/withdrawals", authMiddleware, async (req, res) => {
  const { rows } = await query(`SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`, [
    req.user.id,
  ]);
  res.json({ withdrawals: rows });
});

/** Simulated Paytm top-up for development; replace body with real Paytm checksum flow in production */
router.post("/paytm/initiate", authMiddleware, requireRole("client", "student", "admin"), async (req, res) => {
  const { amount_inr } = req.body;
  const amt = Number(amount_inr);
  if (!amt || amt < 1) return res.status(400).json({ error: "Invalid amount" });
  const orderId = `CK${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
  const env = process.env.PAYTM_ENVIRONMENT || "staging";
  if (process.env.PAYTM_MERCHANT_ID && process.env.PAYTM_MERCHANT_KEY) {
    return res.json({
      mode: "paytm",
      message: "Integrate Paytm JS Checkout or server-side transaction API with checksum.",
      orderId,
      amount: amt,
      merchantId: process.env.PAYTM_MERCHANT_ID,
      environment: env,
      callbackUrl: process.env.PAYTM_CALLBACK_URL,
    });
  }
  res.json({
    mode: "simulated",
    orderId,
    amount: amt,
    confirmUrl: `/api/wallet/paytm/simulate-confirm`,
    note: "Set PAYTM_MERCHANT_ID and PAYTM_MERCHANT_KEY for live Paytm. Use simulate-confirm in dev.",
  });
});

router.post("/paytm/simulate-confirm", authMiddleware, async (req, res) => {
  const { orderId, amount_inr } = req.body;
  const amt = Number(amount_inr);
  if (!amt) return res.status(400).json({ error: "Invalid amount" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await ledger(client, req.user.id, {
      amount_inr: amt,
      type: "deposit",
      reference_type: "paytm_order",
      reference_id: null,
      note: `Paytm deposit ${orderId || "sim"}`,
    });
    await client.query("COMMIT");
    const bal = await getBalance(client, req.user.id);
    res.json({ ok: true, balance_inr: Number(bal.balance_inr) });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Deposit failed" });
  } finally {
    client.release();
  }
});

router.post("/convert-cc", authMiddleware, async (req, res) => {
  const { campus_coins } = req.body;
  const cc = Number(campus_coins);
  if (!cc || cc < 10) return res.status(400).json({ error: "Minimum 10 CC to convert (10 CC = ₹1)" });
  if (cc % 10 !== 0) return res.status(400).json({ error: "CC must be in multiples of 10" });
  const inr = cc / 10;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bal = await getBalance(client, req.user.id);
    if (Number(bal.balance_cc) < cc) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient CampusCoin" });
    }
    await ledger(client, req.user.id, {
      amount_inr: inr,
      amount_cc: -cc,
      type: "cc_convert",
      note: `Converted ${cc} CC to ₹${inr}`,
    });
    await client.query("COMMIT");
    res.json({ ok: true, converted_inr: inr });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Convert failed" });
  } finally {
    client.release();
  }
});

router.post("/withdraw", authMiddleware, async (req, res) => {
  const { amount_inr, method, destination } = req.body;
  const amt = Number(amount_inr);
  if (!amt || amt < MIN_WITHDRAW) {
    return res.status(400).json({ error: `Minimum withdrawal is ₹${MIN_WITHDRAW}` });
  }
  if (!["upi", "qr"].includes(method) || !destination) {
    return res.status(400).json({ error: "Invalid withdrawal details" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bal = await getBalance(client, req.user.id);
    if (Number(bal.balance_inr) < amt) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient balance" });
    }
    await ledger(client, req.user.id, {
      amount_inr: -amt,
      type: "withdrawal",
      note: `Withdrawal ${method} ${destination}`,
    });
    const { rows } = await client.query(
      `INSERT INTO withdrawals (user_id, amount_inr, method, destination, status) VALUES ($1,$2,$3,$4,'processing') RETURNING *`,
      [req.user.id, amt, method, destination]
    );
    await client.query("COMMIT");
    res.json({ ok: true, withdrawal: rows[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Withdrawal failed" });
  } finally {
    client.release();
  }
});

export default router;
