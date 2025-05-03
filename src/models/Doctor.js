const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Doctor = sequelize.define("Doctor", {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  middleName: DataTypes.STRING,
  specialization: DataTypes.STRING,
  availableSlots: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Doctor;
