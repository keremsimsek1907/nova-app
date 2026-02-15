import { useState, useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://nova-backend-06xe.onrender.com";

async function api(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const doLogin = async () => {
    setMsg("");
    const { ok, data } = await api("/api/auth/login", { email, password });
    if (!ok) return setMsg(data.error || "Login hatası");

    setToken(data.token);
    setMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setMsg("");
    const { ok, data } = await api("/api/auth/register", { email, password });
    if (!ok) return setMsg(data.error || "Register hatası");

    setMsg("Kayıt başarılı ✅");
    setMode("login");
  };

  const getMe = async () => {
    if (!token) return alert("Token yok");

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setMe(data);
  };

  const logout = () => {
    setToken("");
    setMe(null);
    setMsg("Çıkış yapıldı");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Giriş</h1>

      <button onClick={() => setMode("login")}>Login</button>
      <button onClick={() => setMode("register")}>Register</button>
      <button onClick={logout}>Logout</button>

      <br /><br />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <br /><br />

      {mode === "login" ? (
        <button onClick={doLogin}>Login</button>
      ) : (
        <button onClick={doRegister}>Register</button>
      )}

      <br /><br />
      {msg && <div>{msg}</div>}

      {token && (
        <>
          <p>Oturum açık ✅</p>
          <button onClick={getMe}>/api/auth/me test</button>
        </>
      )}

      {me && (
        <pre>{JSON.stringify(me, null, 2)}</pre>
      )}
    </div>
  );
}
