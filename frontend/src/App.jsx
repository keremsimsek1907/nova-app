import { useState } from "react";

/* ================================
   API BASE
================================ */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://nova-backend-06xe.onrender.com";

/* ================================
   API HELPER
================================ */
async function api(path, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_BASE + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { ok: res.ok, data };
}

/* ================================
   APP
================================ */
export default function App() {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  /* ================================
     LOGIN
  ================================ */
  const doLogin = async () => {
    setBusy(true);
    setAuthMsg("");

    const { ok, data } = await api("/api/auth/login", {
      email,
      password,
    });

    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Login başarısız");
      return;
    }

    setToken(data.token);
    localStorage.setItem("token", data.token);
    setAuthMsg("Giriş başarılı ✅");
  };

  /* ================================
     REGISTER
  ================================ */
  const doRegister = async () => {
    setBusy(true);
    setAuthMsg("");

    const { ok, data } = await api("/api/auth/register", {
      email,
      password,
    });

    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Register başarısız");
      return;
    }

    setAuthMsg("Kayıt başarılı, giriş yapabilirsin ✅");
    setMode("login");
  };

  /* ================================
     AUTH / ME TEST
  ================================ */
  const getMe = async () => {
    const { ok, data } = await api("/api/auth/me");
    alert(ok ? JSON.stringify(data, null, 2) : "TOKEN GEÇERSİZ ❌");
  };

  /* ================================
     UI
  ================================ */
  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Giriş</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("register")}>Register</button>
      </div>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      {mode === "login" ? (
        <button disabled={busy} onClick={doLogin}>
          Login
        </button>
      ) : (
        <button disabled={busy} onClick={doRegister}>
          Register
        </button>
      )}

      <p>{authMsg}</p>

      {token && (
        <>
          <p><b>Token:</b></p>
          <small style={{ wordBreak: "break-all" }}>{token}</small>
          <br /><br />
          <button onClick={getMe}>/api/auth/me test</button>
        </>
      )}
    </div>
  );
}

