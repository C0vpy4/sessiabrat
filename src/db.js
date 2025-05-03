const { Sequelize } = require("sequelize");

const config = require("./config");
const path = require("path");

// Создаем экземпляр Sequelize с настройками из конфигурации
let sequelize;

if (config.database.dialect === "sqlite") {
  const storagePath = path.resolve(config.database.storage);
  console.log(`Используется SQLite. Путь к файлу: ${storagePath}`);

  sequelize = new Sequelize({
    dialect: config.database.dialect,
    storage: storagePath,
    logging: config.database.logging,
  });
} else {
  sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: config.database.dialect,
      logging: config.database.logging,
    }
  );
}

// Проверяем подключение
sequelize
  .authenticate()
  .then(() => {
    console.log("Соединение с базой данных установлено успешно.");
  })
  .catch((err) => {
    console.error("Ошибка подключения к базе данных:", err);
  });

module.exports = sequelize;
