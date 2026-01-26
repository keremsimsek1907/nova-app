require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlandı ✅"))
  .catch((err) => console.error("MongoDB hata:", err));

// API routes
app.get("/api", (req, res) => {
  res.json({ status: "API OK" });
});

const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);

const itemsRoute = require("./routes/items");
app.use("/api/items", itemsRoute);

// --- FRONTEND BUILD SERVE (PROD) ---
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

// React Router vb için her şeyi index.html'e yönlendir
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
