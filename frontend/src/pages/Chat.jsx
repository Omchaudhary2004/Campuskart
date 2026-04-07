import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

/* ─────────────────────────────────────────────────────────────
   Singleton helpers – init & login happen ONCE per browser tab
   ───────────────────────────────────────────────────────────── */
let _initPromise = null;   // resolves when UIKit is initialised
let _loggedInUid = null;   // UID currently logged into CometChat

function toUid(uuid) {
  return String(uuid || "").replace(/-/g, "");
}

async function getUIKit() {
  return (await import("@cometchat/chat-uikit-react")).CometChatUIKit;
}

async function ensureInit() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const appId  = import.meta.env.VITE_COMETCHAT_APP_ID;
    const region = import.meta.env.VITE_COMETCHAT_REGION || "us";
    if (!appId) throw new Error("VITE_COMETCHAT_APP_ID is not set in frontend/.env");
    const [CometChatUIKit, { UIKitSettingsBuilder }] = await Promise.all([
      getUIKit(),
      import("@cometchat/uikit-shared"),
    ]);
    const settings = new UIKitSettingsBuilder()
      .setAppId(appId)
      .setRegion(region)
      .subscribePresenceForAllUsers()
      .build();
    await CometChatUIKit.init(settings);
  })();
  return _initPromise;
}

async function ensureLogin(userId) {
  await ensureInit();
  const uid = toUid(userId);
  if (_loggedInUid === uid) return;          // already good

  const CometChatUIKit = await getUIKit();

  // Logout previous session if needed
  if (_loggedInUid) {
    try { await CometChatUIKit.logout(); } catch { /* ignore */ }
    _loggedInUid = null;
  }

  const { authToken } = await api("/api/chat/token");
  try {
    await CometChatUIKit.login({ authToken });
  } catch (e) {
    const msg = e?.message || e?.data?.error || JSON.stringify(e);
    // Ignore "already logged in" errors from CometChat
    if (!/already.?logged.?in/i.test(msg) && !/ERR_ALREADY/i.test(msg)) throw e;
  }
  _loggedInUid = uid;
}

/* ─────────────────────────────────────────────────────────────
   Main Chat page
   ───────────────────────────────────────────────────────────── */
export default function Chat() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const peer      = params.get("peer") || "";
  const peerUid   = toUid(peer);

  const [status, setStatus] = useState("idle");   // idle | loading | ready | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!user || !peer) return;
    let cancelled = false;
    (async () => {
      setStatus("loading");
      setErrMsg("");
      try {
        await ensureLogin(user.id);
        if (!cancelled) setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          const msg =
            typeof e?.data?.error === "string" ? e.data.error :
            typeof e?.message     === "string" ? e.message :
            JSON.stringify(e?.data || e);
          setErrMsg(msg);
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, peer]);            // only re-runs when user or peer actually changes

  /* ── Not signed in ── */
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div style={{fontSize:"3rem"}}>💬</div>
        <h1 style={{fontSize:"1.5rem",fontWeight:700,marginTop:"1rem",color:"#1e3a5f"}}>
          Sign in to chat
        </h1>
        <p style={{color:"#64748b",marginTop:".5rem"}}>
          Chat is only available to signed-in users.
        </p>
        <Link
          to="/auth"
          style={{
            display:"inline-block",marginTop:"1.5rem",padding:".6rem 2rem",
            background:"#1e3a5f",color:"#fff",borderRadius:"9999px",fontWeight:600,textDecoration:"none"
          }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  /* ── No peer in URL ── */
  if (!peer) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div style={{fontSize:"3rem"}}>💬</div>
        <h1 style={{fontSize:"1.5rem",fontWeight:700,marginTop:"1rem",color:"#1e3a5f"}}>
          No conversation selected
        </h1>
        <p style={{color:"#64748b",marginTop:".5rem"}}>
          Open a chat from an accepted task to start messaging.
        </p>
        <Link
          to="/activity"
          style={{
            display:"inline-block",marginTop:"1.5rem",padding:".6rem 2rem",
            background:"#1e3a5f",color:"#fff",borderRadius:"9999px",fontWeight:600,textDecoration:"none"
          }}
        >
          Go to My Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.25rem"}}>
        <Link
          to="/activity"
          style={{
            display:"inline-flex",alignItems:"center",gap:".4rem",fontSize:".85rem",
            color:"#64748b",textDecoration:"none",background:"#f1f5f9",
            padding:".35rem .9rem",borderRadius:"9999px",fontWeight:600
          }}
        >
          ← Back to tasks
        </Link>
        <h1 style={{fontWeight:800,fontSize:"1.4rem",color:"#1e3a5f"}}>💬 Chat</h1>
      </div>

      {/* States */}
      {status === "loading" && (
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"center",
          height:"520px",flexDirection:"column",gap:"1rem",
          background:"#f8fafc",borderRadius:"1.5rem",border:"1px solid #e2e8f0"
        }}>
          <div style={{
            width:"40px",height:"40px",border:"4px solid #e2e8f0",
            borderTop:"4px solid #1e3a5f",borderRadius:"50%",
            animation:"spin 0.8s linear infinite"
          }} />
          <p style={{color:"#64748b",fontWeight:500}}>Connecting to CometChat…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {status === "error" && (
        <div style={{
          background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:"1.25rem",
          padding:"1.5rem",color:"#9a3412"
        }}>
          <p style={{fontWeight:700,marginBottom:".5rem"}}>⚠️ Chat connection failed</p>
          <p style={{fontSize:".9rem",wordBreak:"break-all"}}>{errMsg}</p>
          <p style={{fontSize:".8rem",marginTop:".75rem",color:"#c2410c"}}>
            Make sure <code>COMETCHAT_*</code> keys are set in <code>backend/.env</code> and
            the REST API key has permission to mint auth tokens.
          </p>
          <button
            onClick={() => { setStatus("idle"); setTimeout(() => setStatus("loading"), 50); }}
            style={{
              marginTop:"1rem",padding:".5rem 1.25rem",background:"#c2410c",
              color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:600
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "ready" && <ChatWindow peerUid={peerUid} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ChatWindow – lazy-loads CometChatMessages + fetches peer user
   ───────────────────────────────────────────────────────────── */
function ChatWindow({ peerUid }) {
  const [state, setState] = useState({ Messages: null, peerUser: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ CometChatMessages }, { CometChat }] = await Promise.all([
        import("@cometchat/chat-uikit-react"),
        import("@cometchat/chat-sdk-javascript"),
      ]);

      // Fetch the real peer user object from CometChat (has name, avatar etc.)
      let peerUser;
      try {
        peerUser = await CometChat.getUser(peerUid);
      } catch {
        peerUser = new CometChat.User(peerUid);
        peerUser.setName("User");
      }

      if (alive) setState({ Messages: CometChatMessages, peerUser });
    })();
    return () => { alive = false; };
  }, [peerUid]);

  if (!state.Messages || !state.peerUser) {
    return (
      <div style={{
        display:"flex",alignItems:"center",justifyContent:"center",
        height:"520px",background:"#f8fafc",borderRadius:"1.5rem",
        border:"1px solid #e2e8f0",color:"#64748b"
      }}>
        Loading conversation…
      </div>
    );
  }

  const { Messages, peerUser } = state;

  return (
    <div style={{
      height:"600px",borderRadius:"1.5rem",overflow:"hidden",
      border:"1px solid #e2e8f0",boxShadow:"0 4px 24px rgba(0,0,0,.07)"
    }}>
      <Messages user={peerUser} />
    </div>
  );
}
