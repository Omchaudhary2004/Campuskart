// backend/src/services/chat.js

import fetch from 'node-fetch';
import { ensureCometUser } from './cometchat.js';

/**
 * Ensure a CometChat user exists and retrieve an auth token.
 * @param {string|number} uid - User identifier.
 * @param {string} name - Display name.
 * @param {string} avatar - Avatar URL (optional).
 * @returns {Promise<string>} auth token
 */
export async function getAuthToken(uid, name = 'User', avatar) {
  const { authToken } = await ensureCometUser(uid, name, avatar);
  return authToken;
}

/**
 * Create a one‑to‑one conversation between two users.
 * Returns the conversationId (e.g., "uid1_user_uid2").
 * If the conversation already exists, the API returns the existing one.
 * @param {string|number} uid1
 * @param {string|number} uid2
 */
export async function ensureConversation(uid1, uid2) {
  const appId = process.env.COMETCHAT_APP_ID;
  const region = process.env.COMETCHAT_REGION || 'us';
  const apiKey = process.env.COMETCHAT_REST_API_KEY;
  if (!appId || !apiKey) throw new Error('CometChat not configured');

  const base = `https://${appId}.api-${region}.cometchat.io/v3`;
  const headers = {
    apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Conversation ID format used by CometChat for 1‑to‑1 chats
  const conversationId = `${uid1}_user_${uid2}`;

  // Attempt to create the conversation; if it exists, the API returns 409.
  const res = await fetch(`${base}/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversationId,
      type: 'user',
      participants: [String(uid1), String(uid2)],
    }),
  });

  if (!res.ok && res.status !== 409) {
    const txt = await res.text();
    throw new Error(`Create conversation failed: ${res.status} ${txt}`);
  }
  return conversationId;
}
