const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, authenticate, sessions } = require("../utils/auth");
const bcrypt = require("bcrypt");
const getRawBody = require("raw-body");

// Регистрация/вход пользователя
router.post("/login", async (req, res) => {
  try {
    console.log("Начало обработки запроса на вход/регистрацию");

    // Проверяем, что req.body существует
    if (!req.body) {
      console.log("req.body отсутствует");
      return res.status(400).json({ error: "Отсутствует тело запроса" });
    }

    console.log("Тело запроса:", req.body);

    // Безопасно извлекаем данные
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;

    if (!email || !password) {
      console.log("Отсутствует email или пароль");
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    console.log(`Попытка входа для пользователя: ${email}`);

    // Ищем пользователя
    let user = await User.findOne({ where: { email } });
    // Если пользователя нет, создаем нового
    if (!user) {
      console.log(`Пользователь ${email} не найден, создаем нового`);

      try {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Пароль успешно хеширован");

        // Создаем пользователя с явным await
        user = await User.create({
          email,
          password: hashedPassword,
          name: name || "",
          phone: phone || "",
        });

        console.log(`Создан новый пользователь: ${email}, ID: ${user.id}`);

        // Проверяем, что пользователь действительно создан
        const checkUser = await User.findOne({ where: { email } });
        if (checkUser) {
          console.log(`Проверка: пользователь ${email} найден в базе`);
        } else {
          console.log(
            `Проверка: пользователь ${email} НЕ найден в базе после создания!`
          );
        }
      } catch (createError) {
        console.error("Ошибка при создании пользователя:", createError);
        return res.status(500).json({
          error: "Ошибка при создании пользователя",
          details: createError.message,
        });
      }
    } else {
      console.log(`Пользователь ${email} найден, проверяем пароль`);

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log(`Неверный пароль для пользователя ${email}`);
        return res.status(401).json({ error: "Неверный пароль" });
      }

      console.log(`Пароль для пользователя ${email} верный`);

      // Обновляем имя и телефон, если они предоставлены
      if (name || phone) {
        console.log(`Обновляем данные пользователя ${email}`);
        await user.update({
          name: name || user.name,
          phone: phone || user.phone,
        });
      }
    }

    // Генерируем токен
    const token = generateToken(user);
    console.log(`Токен сгенерирован для пользователя ${email}`);

    res.status(200).json({
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        phone: user.phone,
      },
    });

    console.log(`Успешный вход для пользователя ${email}`);
  } catch (error) {
    console.error("Ошибка входа:", error);

    res
      .status(500)
      .json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
});

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

module.exports = router;
