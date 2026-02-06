require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Mongoose buffering kapat
mongoose.set("bufferCommands", false);

let mongoReady = false;

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI yok (Render Environment'a ekle)");
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    mongoReady = true;
    console.log("✅ MongoDB bağlandı");

    // API health
    app.get("/api", (req, res) => {
      res.json({ status: "API OK", mongoReady });
    });

    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/items", require("./routes/items"));

    // Frontend (prod)
    const frontendDist = path.join(__dirname, "..", "frontend", "dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server çalışıyor: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err?.message || err);
    process.exit(1);
  }
}

start();
