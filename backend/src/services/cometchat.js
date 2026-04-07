/**
 * CometChat REST: create user + auth token.
 * Docs: https://www.cometchat.com/docs/sdk/restful-api
 */
export async function ensureCometUser(uid, name, avatar) {
  const appId = process.env.COMETCHAT_APP_ID;
  const region = process.env.COMETCHAT_REGION || "us";
  const apiKey = process.env.COMETCHAT_REST_API_KEY;
  if (!appId || !apiKey) {
    return { configured: false };
  }
  const base = `https://${appId}.api-${region}.cometchat.io/v3`;
  const headers = {
    apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const createRes = await fetch(`${base}/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      uid: String(uid).replace(/-/g, ""),
      name: name || "User",
      avatar: avatar || undefined,
    }),
  });
  if (!createRes.ok) {
    const t = await createRes.text();
    // If the UID already exists (status 400 or 409), ignore and continue
    const alreadyExists = (createRes.status === 400 || createRes.status === 409) && t.includes('already exists');
    if (alreadyExists) {
      // ignore error, user already exists
    } else {
      throw new Error(`CometChat user: ${createRes.status} ${t}`);
    }
  }
  // Fetch auth token for the user
  const tokenRes = await fetch(`${base}/users/${String(uid).replace(/-/g, "")}/auth_tokens`, {
    method: "POST",
    headers,
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    throw new Error(`CometChat token: ${tokenRes.status} ${t}`);
  }
  const data = await tokenRes.json();
  return {
    configured: true,
    authToken: data.data?.authToken || data.authToken,
    appId,
    region,
    uid: String(uid).replace(/-/g, ""),
  };
}
