import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000";

async function api(path, body = null, token = "") {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : "{}",
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
  const [me, setMe] = useState(null);

  const doLogin = async () => {
    setBusy(true);
    setAuthMsg("");
    const { ok, data } = await api("/api/auth/login", { email, password });
    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Login başarısız");
      return;
    }

    setToken(data?.token || "");
    setAuthMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setBusy(true);
    setAuthMsg("");
    const { ok, data } = await api("/api/auth/register", { email, password });
    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Kayıt başarısız");
      return;
    }

    // backend register sonrası token dönüyorsa al
    if (data?.token) setToken(data.token);
    setAuthMsg("Kayıt başarılı ✅");
  };

  const doLogout = () => {
    setToken("");
    setMe(null);
    setAuthMsg("Çıkış yapıldı");
  };

  const doMe = async () => {
    if (!token) {
      setAuthMsg("Token yok");
      return;
    }

    setBusy(true);
    setAuthMsg("");
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    setBusy(false);

    if (!res.ok) {
      setAuthMsg(data?.error || "Me alınamadı");
      setMe(null);
      return;
    }

    setMe(data);
    setAuthMsg("Me başarılı ✅");
  };

  // Token değişince otomatik Me çek
  useEffect(() => {
    if (token) doMe();
    else setMe(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Giriş</h1>

<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
  {!token ? (
    <>
      <button
        onClick={() => setMode("login")}
        disabled={busy}
        style={{ opacity: mode === "login" ? 1 : 0.7 }}
      >
        Login
      </button>
      <button
        onClick={() => setMode("register")}
        disabled={busy}
        style={{ opacity: mode === "register" ? 1 : 0.7 }}
      >
        Register
      </button>
    </>
  ) : (
    <button onClick={doLogout} disabled={busy}>
      Logout
    </button>
  )}
</div>


      {!token && (
        <>
          <div style={{ maxWidth: 320, display: "grid", gap: 8 }}>
            <input
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />

            {mode === "login" ? (
              <button onClick={doLogin} disabled={busy}>
                {busy ? "Bekle..." : "Login"}
              </button>
            ) : (
              <button onClick={doRegister} disabled={busy}>
                {busy ? "Bekle..." : "Register"}
              </button>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: 12 }}>
        {token ? (
          <div>
            <b>Oturum açık</b> ✅
          </div>
        ) : (
          <div>
            <b>Oturum kapalı</b>
          </div>
        )}
      </div>

      {authMsg && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #444" }}>
          {authMsg}
        </div>
      )}

      {/* DEV ortamında test butonu görünsün */}


      {me && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #444" }}>
          <h3 style={{ marginTop: 0 }}>Me</h3>
          <div>
            <b>ID:</b> {me.id || me._id || "-"}
          </div>
          <div>
            <b>Email:</b> {me.email || "-"}
          </div>
        </div>
      )}
    </div>
  );
}
