import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://nova-backend-06xe.onrender.com";

async function api(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
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

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [token, setToken] = useState("");
  const [me, setMe] = useState(null);

  const doLogin = async () => {
    setBusy(true);
    setAuthMsg("");

    const { ok, data } = await api("/api/auth/login", {
      email,
      password,
    });

    setBusy(false);

    if (!ok) return setAuthMsg(data.error || "Login başarısız");

    setToken(data.token);
    setAuthMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setBusy(true);
    setAuthMsg("");

    const { ok, data } = await api("/api/auth/register", {
      email,
      password,
    });

    setBusy(false);

    if (!ok) return setAuthMsg(data.error || "Register başarısız");

    setAuthMsg("Kayıt başarılı ✅");
  };

  const testMe = async () => {
    const { ok, data } = await api("/api/auth/me", {}, token);
    if (!ok) return alert(data.error || "Token yok");
    setMe(data);
  };

  const logout = () => {
    setToken("");
    setMe(null);
    setAuthMsg("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Giriş</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("register")}>Register</button>
        <button onClick={logout}>Logout</button>
      </div>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
        autoComplete="username"
      />

      <br />
      <br />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
        autoComplete={
          mode === "login" ? "current-password" : "new-password"
        }
      />

      <br />
      <br />

      {mode === "login" ? (
        <button onClick={doLogin} disabled={busy}>
          Login
        </button>
      ) : (
        <button onClick={doRegister} disabled={busy}>
          Register
        </button>
      )}

      <p>{authMsg}</p>

      {token && (
        <>
          <p>Oturum açık ✅</p>
          <button onClick={testMe}>/api/auth/me test</button>
        </>
      )}

      {me && (
        <>
          <h3>Me</h3>
          <pre>{JSON.stringify(me, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
