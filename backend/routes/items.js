
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const auth = require("../middlewares/auth");

// GET /api/items  (sadece kendi)
router.get("/", auth, async (req, res) => {
  const items = await Item.find({ owner: req.user.sub }).sort({ createdAt: -1 });
  res.json(items.map((x) => ({ id: x._id.toString(), name: x.name })));
});

// POST /api/items  { "name": "abc" } (kendi adına ekler)
router.post("/", auth, async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name gerekli" });

  const doc = await Item.create({ name, owner: req.user.sub });
  res.status(201).json({ id: doc._id.toString(), name: doc.name });
});

// DELETE /api/items/:id  (sadece kendi itemını silebilir)
router.delete("/:id", auth, async (req, res) => {
  await Item.deleteOne({ _id: req.params.id, owner: req.user.sub });
  res.json({ ok: true });
});

module.exports = router;
