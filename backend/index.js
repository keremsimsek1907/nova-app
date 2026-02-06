
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

mongoose.set("bufferCommands", false);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI yok");
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB bağlandı");

    app.get("/api", (req, res) => {
      res.json({ status: "API OK", mongoReady: true });
    });

    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/items", require("./routes/items"));

    app.listen(PORT, () => {
      console.log(`🚀 Server çalışıyor: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
    process.exit(1);
  }
}

start();
