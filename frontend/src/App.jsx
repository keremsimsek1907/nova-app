import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://nova-backend-06xe.onrender.com";

async function api(path, body, token) {
  const res = await fetch(API_BASE + path, {
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
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState("");
  const [me, setMe] = useState(null);

  const doLogin = async () => {
    setMsg("...");
    const { ok, data } = await api("/api/auth/login", {
      email,
      password,
    });

    if (!ok) return setMsg(data.error || "Login hatası");

    setToken(data.token);
    setMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setMsg("...");
    const { ok, data } = await api("/api/auth/register", {
      email,
      password,
    });

    if (!ok) return setMsg(data.error || "Register hatası");

    setMsg("Kayıt başarılı ✅ şimdi giriş yap");
    setMode("login");
  };

  const getMe = async () => {
    const res = await fetch(API_BASE + "/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setMe(data);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Giriş</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("login")}>Login</button>{" "}
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
        <button onClick={doLogin}>Login</button>
      ) : (
        <button onClick={doRegister}>Register</button>
      )}

      <p>{msg}</p>

      {token && (
        <>
          <p>
            <b>Token:</b> {token}
          </p>
          <button onClick={getMe}>/api/auth/me test</button>
        </>
      )}

      {me && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 10,
            marginTop: 20,
          }}
        >
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
    </div>
  );
}
