import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// küçük yardımcı
async function api(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
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

  // ✅ token kalıcı
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);

  const [busy, setBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState("");

  // token değişince localStorage güncelle
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // ✅ token varsa otomatik /api/auth/me çek
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMe(null);
        return;
      }
      setBusy(true);
      const { ok, data } = await api("/api/auth/me", {}, token);
      setBusy(false);

      if (!ok) {
        // token bozuk/expired ise temizle
        setToken("");
        setMe(null);
        setAuthMsg(data?.error || "Oturum süresi dolmuş olabilir.");
        return;
      }

      setMe(data);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const doLogin = async () => {
    setBusy(true);
    setAuthMsg("");
    setMe(null);

    const { ok, data } = await api("/api/auth/login", { email, password });
    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Login başarısız");
      return;
    }

    setToken(data.token || "");
    setAuthMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setBusy(true);
    setAuthMsg("");
    setMe(null);

    const { ok, data } = await api("/api/auth/register", { email, password });
    setBusy(false);

    if (!ok) {
      setAuthMsg(data?.error || "Kayıt başarısız");
      return;
    }

    setToken(data.token || "");
    setAuthMsg("Kayıt başarılı ✅");
  };

  const doLogout = () => {
    setToken("");
    setMe(null);
    setAuthMsg("Çıkış yapıldı.");
    setMode("login");
  };

  const loggedIn = useMemo(() => !!token, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ marginTop: 0 }}>Giriş</h1>

      {/* ✅ Login/Register/Logout doğru görünüm */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {!loggedIn ? (
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

      {/* ✅ Form: sadece login değilken göster */}
      {!loggedIn && (
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
              Login
            </button>
          ) : (
            <button onClick={doRegister} disabled={busy}>
              Register
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div>
          <b>Oturum:</b> {loggedIn ? "açık ✅" : "kapalı ❌"}
        </div>
        {authMsg ? <div style={{ marginTop: 6 }}>{authMsg}</div> : null}
      </div>

      {/* ✅ Me bilgisi */}
      {me && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #444", maxWidth: 420 }}>
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
