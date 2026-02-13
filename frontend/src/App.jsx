import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function api(path, { method = "GET", body } = {}, token) {
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // token varsa ME çek (GET)
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMe(null);
        return;
      }
      setBusy(true);
      const { ok, data } = await api("/api/auth/me", { method: "GET" }, token);
      setBusy(false);

      if (!ok) {
        setMsg(data?.error || "Me isteği başarısız");
        // token invalid ise temizle
        if (
          String(data?.error || "")
            .toLowerCase()
            .includes("token")
        ) {
          setToken("");
          setMe(null);
        }
        return;
      }

      setMe(data);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const doLogin = async () => {
    setBusy(true);
    setMsg("");
    setMe(null);

    const { ok, data } = await api(
      "/api/auth/login",
      { method: "POST", body: { email, password } },
      null
    );

    setBusy(false);

    if (!ok) return setMsg(data?.error || "Giriş başarısız");
    setToken(data.token || "");
    setPassword("");
    setMsg("Giriş başarılı ✅");
  };

  const doRegister = async () => {
    setBusy(true);
    setMsg("");
    setMe(null);

    const { ok, data } = await api(
      "/api/auth/register",
      { method: "POST", body: { email, password } },
      null
    );

    setBusy(false);

    if (!ok) return setMsg(data?.error || "Kayıt başarısız");
    setToken(data.token || "");
    setPassword("");
    setMsg("Kayıt başarılı ✅");
  };

  const doLogout = () => {
    setToken("");
    setMe(null);
    setMsg("Çıkış yapıldı.");
    setMode("login");
  };

  const Card = ({ children }) => (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        border: "1px solid #3a3a3a",
        borderRadius: 10,
        maxWidth: 420,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {children}
    </div>
  );

  const Btn = (props) => (
    <button
      {...props}
      type={props.type || "button"} // <-- KRİTİK: submit olmasın
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #444",
        background: "rgba(255,255,255,0.04)",
        color: "inherit",
        cursor: "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...props.style,
      }}
    />
  );

  const Input = (props) => (
    <input
      {...props}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #444",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        outline: "none",
      }}
    />
  );

  const onSubmit = (e) => {
    e.preventDefault(); // <-- KRİTİK: her enter/harfte submit olmasın
    if (busy) return;
    if (mode === "login") doLogin();
    else doRegister();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "#eee",
        background: "#111",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 48 }}>Giriş</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        {!loggedIn ? (
          <>
            <Btn
              onClick={() => setMode("login")}
              disabled={busy}
              style={{ borderColor: mode === "login" ? "#777" : "#444" }}
            >
              Login
            </Btn>
            <Btn
              onClick={() => setMode("register")}
              disabled={busy}
              style={{ borderColor: mode === "register" ? "#777" : "#444" }}
            >
              Register
            </Btn>
          </>
        ) : (
          <Btn onClick={doLogout} disabled={busy}>
            Logout
          </Btn>
        )}
      </div>

      {!loggedIn && (
        <Card>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <Input
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />

            {mode === "login" ? (
              <Btn onClick={doLogin} disabled={busy}>
                {busy ? "Bekle..." : "Login"}
              </Btn>
            ) : (
              <Btn onClick={doRegister} disabled={busy}>
                {busy ? "Bekle..." : "Register"}
              </Btn>
            )}
          </form>
        </Card>
      )}

      <div style={{ marginTop: 14 }}>
        <b>Oturum:</b> {loggedIn ? "açık ✅" : "kapalı ❌"}
        {msg ? <div style={{ marginTop: 8 }}>{msg}</div> : null}
      </div>

      {me && (
        <Card>
          <h3 style={{ margin: 0, marginBottom: 10 }}>Me</h3>
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              <b>ID:</b> {me.id || me._id || "-"}
            </div>
            <div>
              <b>Email:</b> {me.email || "-"}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
