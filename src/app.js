const express = require("express");
const sequelize = require("./db");
const auth = require("./routes/auth");
const doctors = require("./routes/doctors");
const appointments = require("./routes/appointments");

const app = express();
app.use(express.json());

app.use("/auth", auth);
app.use("/doctors", auth, doctors);
app.use("/appointments", auth, appointments);

sequelize.sync().then(() => {
  app.listen(3000, () => console.log("Сервер запущен"));
});
