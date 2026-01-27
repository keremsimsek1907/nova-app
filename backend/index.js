require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// --- Mongo bağlantısı (uygulamayı KİLİTLEMEZ) ---
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";

async function connectMongo() {
  if (!MONGO_URI) {
    console.log("⚠️ MONGO_URI yok. MongoDB bağlanmadan devam ediyorum.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // 8sn sonra vazgeç
    });
    console.log("✅ MongoDB bağlandı");
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err?.message || err);
  }
}
connectMongo();

// --- API health ---
app.get("/api", (req, res) => {
  res.json({
    status: "API OK",
    mongoReady: mongoose.connection.readyState === 1,
  });
});

const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);

const itemsRoute = require("./routes/items");
app.use("/api/items", itemsRoute);

// --- FRONTEND serve (varsa) ---
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

app.get("*", (req, res) => {
  // dist yoksa bile API çalışsın diye hata vermeyelim
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) res.status(404).send("Frontend build bulunamadı.");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: ${PORT}`);
});
