const express = require("express");
const router = express.Router();

const User = require("../models/User");
const crypto = require("crypto");
// Хранение сессий в памяти
const sessions = {};

// Регистрация/вход пользователя
router.post("/login", async (req, res) => {
  try {
    console.log("Обработка запроса на вход. Тело запроса:", req.body);

    // Проверяем наличие тела запроса

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "Отсутствует тело запроса",
        receivedBody: req.body,
        bodyType: typeof req.body,
      });
    }

    const { email, password, name, phone } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({
        error: "Email и пароль обязательны",
        receivedFields: Object.keys(req.body),
      });
    }

    // Ищем пользователя
    let user = await User.findOne({ where: { email } });
    // Если пользователя нет, создаем нового
    if (!user) {
      user = await User.create({
        email,
        password, // В реальном приложении пароль нужно хешировать
        name: name || "",
        phone: phone || "",
      });
      console.log(`Создан новый пользователь: ${email}`);
    } else {
      // Проверяем пароль (в реальном приложении нужно сравнивать хеши)
      if (password !== user.password) {
        return res.status(401).json({ error: "Неверный пароль" });
      }

      // Обновляем имя и телефон, если они предоставлены
      if (name || phone) {
        await user.update({
          name: name || user.name,
          phone: phone || user.phone,
        });
      }
    }

    // Генерируем токен сессии
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Сохраняем сессию
    sessions[sessionToken] = {
      userId: user.id,
      email: user.email,
      createdAt: new Date(),
    };

    res.status(200).json({
      message: "Вход выполнен успешно",
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res
      .status(500)
      .json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
});

// Middleware для проверки аутентификации
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Недействительный токен" });
  }

  req.user = sessions[token];
  next();
};

// Получение текущего пользователя

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Выход из системы
router.post("/logout", authenticate, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  if (sessions[token]) {
    delete sessions[token];
  }

  res.status(200).json({ message: "Выход выполнен успешно" });
});
module.exports = { router, authenticate, sessions };
