const express = require("express");
const path = require("path");
const app = express();
const sequelize = require("./db");

// Middleware для обработки JSON - добавляем явные настройки
app.use(
  express.json({
    limit: "10mb",
    strict: false, // Менее строгая проверка JSON
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
// Middleware для логирования запросов с подробной информацией
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);

  console.log("Заголовки:", JSON.stringify(req.headers));

  if (req.body) {
    console.log("Тело запроса:", JSON.stringify(req.body));
  }

  // Добавляем обработчик для логирования ответа
  const originalSend = res.send;
  res.send = function (body) {
    console.log("Ответ:", body);
    return originalSend.call(this, body);
  };

  next();
});

// Обслуживание статических файлов из директории public
app.use(express.static(path.join(__dirname, "public")));

// Подключаем маршруты
const { router: authRouter } = require("./routes/auth");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");

app.use("/auth", authRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);

// Маршрут для корневого URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Обработка ошибок парсинга JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Ошибка парсинга JSON:", err);
    return res.status(400).json({
      error: "Некорректный JSON в запросе",
      details: err.message,
    });
  }
  next(err);
});

// Общая обработка ошибок
app.use((err, req, res, next) => {
  console.error("Ошибка:", err);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
    message: err.message,
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Ошибка подключения к базе данных:", err);
  });

module.exports = app;
