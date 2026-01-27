
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Render'da ENV'den gelsin. Yoksa bile devde çalışsın diye fallback bıraktım.
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// POST /api/auth/register  { email, password }
router.post("/register", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email ve password gerekli" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "password en az 6 karakter" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "bu email zaten kayıtlı" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    return res.status(201).json({ id: user._id.toString(), email: user.email });
  } catch (err) {
    // Render loglarında gerçek hatayı görmemiz için:
    console.error("REGISTER ERROR 👉", err);

    return res.status(500).json({
      error: err?.message || "server hata",
      name: err?.name,
    });
  }
});

// POST /api/auth/login { email, password }
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email ve password gerekli" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "hatalı giriş" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "hatalı giriş" });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);

    return res.status(500).json({
      error: err?.message || "server hata",
      name: err?.name,
    });
  }
});

module.exports = router;
