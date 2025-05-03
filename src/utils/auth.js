const crypto = require("crypto");

// Хранилище сессий в памяти
const sessions = {};

// Генерация токена
function generateToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions[token] = {
    userId: user.id,
    email: user.email,
    createdAt: new Date(),
  };
  return token;
}

// Middleware для проверки аутентификации
function authenticate(req, res, next) {
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
}

module.exports = {
  generateToken,
  authenticate,
  sessions,
};
