const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API çalışıyor 🚀",
    time: new Date(),
  });
});

module.exports = router;
