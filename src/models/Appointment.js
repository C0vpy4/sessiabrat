const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");
const Doctor = require("./Doctor");

const Appointment = sequelize.define("Appointment", {
  slot: DataTypes.STRING,
});

User.hasMany(Appointment);
Appointment.belongsTo(User);
Doctor.hasMany(Appointment);
Appointment.belongsTo(Doctor);

module.exports = Appointment;
