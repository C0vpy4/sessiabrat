const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();
const sessions = {};

router.post("/login", async (req, res) => {
  const { email, password, name, phone } = req.body;
  let user = await User.findOne({ where: { email } });

  if (!user) {
    if (!password || !name || !phone)
      return res
        .status(400)
        .json({ error: "Новый пользователь: требуется пароль, имя и телефон" });
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hash, name, phone });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Неверный пароль" });

  const token = Date.now() + "-" + Math.random();
  sessions[token] = user.id;
  res.json({ token });
});

router.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token])
    return res.status(401).json({ error: "Не авторизован" });
  req.userId = sessions[token];
  next();
});

module.exports = router;
