const path = require("path");

// Конфигурация приложения, которую можно легко изменить под требования билета
module.exports = {
  // Настройки базы данных
  database: {
    dialect: process.env.DB_DIALECT || "sqlite",
    storage:
      process.env.DB_STORAGE || path.join(__dirname, "..", "database.sqlite"),
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5433,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "appointment_service",
    logging: console.log,
  },

  // Настройки приложения
  app: {
    port: process.env.PORT || 3000,
    timeSlotInterval: 30, // Интервал слотов в минутах
    workingHours: {
      start: 10, // Начало рабочего дня (часы)
      end: 20, // Конец рабочего дня (часы)
    },
  },
};
