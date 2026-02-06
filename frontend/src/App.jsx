
import { useState } from "react";

const API_BASE = "https://nova-backend-06xe.onrender.com";
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function api(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [token, setToken] = useState("");

  const doLogin = async () => {
    setBusy(true);
    setAuthMsg("");
    const { ok, data } = await api("/api/auth/login", {
      email,
      password,
    });
    setBusy(false);

    if (!ok) return setAuthMsg(data?.error || "Login başarısız");
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

    if (!ok) return setAuthMsg(data?.error || "Kayıt başarısız");

    setAuthMsg("Kayıt başarılı, giriş yapılıyor...");
    await doLogin();
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>{mode === "login" ? "Giriş" : "Kayıt Ol"}</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          disabled={mode === "register"}
          style={{ marginLeft: 10 }}
        >
          Register
        </button>
      </div>

      <div style={{ maxWidth: 300 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button
          onClick={mode === "login" ? doLogin : doRegister}
          disabled={busy}
          style={{ width: "100%" }}
        >
          {busy ? "Bekle..." : mode === "login" ? "Login" : "Register"}
        </button>

        {authMsg && (
          <p style={{ marginTop: 10, color: authMsg.includes("başarılı") ? "green" : "red" }}>
            {authMsg}
          </p>
        )}

        {token && (
          <div style={{ marginTop: 20 }}>
            <b>Token:</b>
            <pre style={{ wordBreak: "break-all" }}>{token}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
