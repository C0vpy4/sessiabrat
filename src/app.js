const express = require("express");
const path = require("path");
const bodyParser = require("body-parser"); // Убедитесь, что body-parser установлен
const sequelize = require("./db");
const config = require("./config");

const app = express();

// Добавляем raw parser для обработки всех запросов как JSON
app.use((req, res, next) => {
  if (
    req.method === "POST" &&
    !req.is("application/json") &&
    req.headers["content-length"]
  ) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(data);
        console.log("Принудительно обработан JSON:", req.body);
        next();
      } catch (e) {
        console.error("Ошибка парсинга JSON:", e);
        next();
      }
    });
  } else {
    next();
  }
});

// Стандартные парсеры
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Добавляем middleware для CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middleware для отладки
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Подключаем маршруты
const authRouter = require("./routes/auth");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");

app.use("/auth", authRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);

// Маршрут для корневого URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error("Ошибка:", err);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
    message: err.message,
  });
});

// В конце файла app.js
const PORT = config.app.port;

// Импортируем все модели для уверенности, что они загружены
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");

// Синхронизируем модели с базой данных
sequelize
  .sync({ force: false }) // force: true удалит и пересоздаст таблицы (осторожно!)
  .then(() => {
    console.log("Модели синхронизированы с базой данных");

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })

  .catch((err) => {
    console.error("Ошибка синхронизации моделей с базой данных:", err);
  });

module.exports = app;
