require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// =======================
// MONGODB CONNECTION
// =======================
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI bulunamadı. Render ENV kontrol et!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB bağlandı ✅"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası ❌:", err.message);
    process.exit(1);
  });

// =======================
// API ROUTES
// =======================
app.get("/api", (req, res) => {
  res.json({ status: "API OK" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));

// =======================
// FRONTEND (PRODUCTION)
// =======================
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: ${PORT}`);
});
