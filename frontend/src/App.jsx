import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000";

const TOKEN_KEY = "nova_token";

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

export default function App() {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [me, setMe] = useState(null);

  // Token değişince localStorage'a yaz + token yoksa me sıfırla
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (!token) setMe(null);
  }, [token]);

  // Sayfa açılınca token varsa /auth/me çek
  useEffect(() => {
    (async () => {
      if (!token) return;
      const r = await api("/api/auth/me", { token });
      if (r.ok) {
        setMe(r.data);
        setMsg("Oturum açık ✅");
      } else {
        // token bozuk/expire ise temizle
        setToken("");
        setMe(null);
        setMsg("Token geçersiz/expired. Tekrar giriş yap.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async () => {
    setBusy(true);
    setMsg("");
    const r = await api("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setBusy(false);

    if (!r.ok) {
      setMsg(r.data?.error || "Login başarısız");
      return;
    }

    const t = r.data?.token;
    if (!t) {
      setMsg("Login oldu ama token dönmedi.");
      return;
    }

    setToken(t);
    setMsg("Giriş başarılı ✅");

    // login sonrası me çek
    const m = await api("/api/auth/me", { token: t });
    if (m.ok) setMe(m.data);
  };

  const doRegister = async () => {
    setBusy(true);
    setMsg("");
    const r = await api("/api/auth/register", {
      method: "POST",
      body: { email, password },
    });
    setBusy(false);

    if (!r.ok) {
      setMsg(r.data?.error || "Register başarısız");
      return;
    }

    // bazı backend'ler register sonrası token döndürür, bazıları döndürmez
    const t = r.data?.token;
    if (t) {
      setToken(t);
      setMsg("Kayıt + giriş başarılı ✅");
      const m = await api("/api/auth/me", { token: t });
      if (m.ok) setMe(m.data);
    } else {
      setMsg("Kayıt başarılı ✅ Şimdi giriş yap.");
      setMode("login");
    }
  };

  const doLogout = () => {
    setToken("");
    setMe(null);
    setMsg("Çıkış yapıldı 👋");
  };

  const testMe = async () => {
    if (!token) {
      alert("Token yok. Önce giriş yap.");
      return;
    }
    const r = await api("/api/auth/me", { token });
    if (r.ok) alert(JSON.stringify(r.data, null, 2));
    else alert(r.data?.error || `Hata: ${r.status}`);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Giriş</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode("login")} disabled={busy}>
          Login
        </button>{" "}
        <button onClick={() => setMode("register")} disabled={busy}>
          Register
        </button>{" "}
        {token && (
          <button onClick={doLogout} disabled={busy}>
            Logout
          </button>
        )}
      </div>

      <div style={{ maxWidth: 360, display: "grid", gap: 8 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          disabled={busy}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
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

      {msg && (
        <p style={{ marginTop: 12 }}>
          <b>{msg}</b>
        </p>
      )}

      {/* Token'ı artık ekranda yazmıyoruz */}
      {token && (
        <div style={{ marginTop: 16 }}>
          <button onClick={testMe} disabled={busy}>
            /api/auth/me test
          </button>
        </div>
      )}

      {me && (
        <div style={{ marginTop: 16 }}>
          <h3>Me</h3>
          <pre
            style={{
              background: "#111",
              color: "#ddd",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
            }}
          >
            {JSON.stringify(me, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
