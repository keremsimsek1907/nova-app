import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // auth UI
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("a@a.com");
  const [password, setPassword] = useState("123456");
  const [authMsg, setAuthMsg] = useState("");

  // CRUD UI
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const api = async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
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

    return { ok: res.ok, status: res.status, data };
  };

  const doLogin = async () => {
    setAuthMsg("");
    const { ok, data } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!ok) return setAuthMsg(data?.error || "Login başarısız");

    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const doRegister = async () => {
    setAuthMsg("");

    if (!email.trim() || !password.trim()) return setAuthMsg("Email ve şifre gerekli");
    if (password.length < 6) return setAuthMsg("Şifre en az 6 karakter olmalı");

    const { ok, data } = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!ok) return setAuthMsg(data?.error || "Kayıt başarısız");

    // kayıt oldu -> otomatik login
    await doLogin();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setItems([]);
    setAuthMsg("");
    setMode("login");
  };

  const loadItems = async () => {
    const { ok, status, data } = await api("/api/items");
    if (!ok) {
      if (status === 401) {
        logout();
        return;
      }
      return;
    }
    if (Array.isArray(data)) setItems(data);
  };

  useEffect(() => {
    if (token) loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    const { ok, data } = await api("/api/items", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setBusy(false);

    if (!ok) return alert(data?.error || "Eklenemedi");

    setName("");
    loadItems();
  };

  const deleteItem = async (id) => {
    await api(`/api/items/${id}`, { method: "DELETE" });
    loadItems();
  };

  // --- AUTH SCREEN ---
  if (!token) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>{mode === "login" ? "Giriş" : "Kayıt Ol"}</h1>

        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => {
              setMode("login");
              setAuthMsg("");
            }}
            disabled={mode === "login"}
            style={{ marginRight: 8 }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode("register");
              setAuthMsg("");
            }}
            disabled={mode === "register"}
          >
            Register
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            style={{ padding: 8, width: 320 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            style={{ padding: 8, width: 320 }}
          />
        </div>

        <button
          onClick={async () => {
            setBusy(true);
            if (mode === "login") await doLogin();
            else await doRegister();
            setBusy(false);
          }}
          style={{ padding: "8px 16px" }}
          disabled={busy}
        >
          {busy ? "Bekle..." : mode === "login" ? "Login" : "Register"}
        </button>

        {authMsg && (
          <div style={{ marginTop: 12, color: "crimson" }}>
            {authMsg}
          </div>
        )}

        <p style={{ marginTop: 14, opacity: 0.7 }}>
          Demo: a@a.com / 123456
        </p>
      </div>
    );
  }

  // --- APP SCREEN ---
  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>CRUD (Auth + MongoDB) ✅</h1>
        <button onClick={logout}>Çıkış</button>
      </div>

      <form onSubmit={addItem} style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni ürün"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button disabled={busy}>{busy ? "Ekleniyor..." : "Ekle"}</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            {item.name}
            <button onClick={() => deleteItem(item.id)} style={{ marginLeft: 10 }}>
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
