const sequelize = require("./db");
const Doctor = require("./models/Doctor");

(async () => {
  await sequelize.sync({ force: true });

  const generateSlots = () => {
    const slots = [];
    for (let h = 10; h < 20; h++) {
      slots.push(`${h}:00`, `${h}:30`);
    }
    return slots;
  };

  await Doctor.bulkCreate([
    {
      firstName: "Иван",
      lastName: "Иванов",
      middleName: "Иванович",
      specialization: "Терапевт",
      availableSlots: generateSlots(),
    },
    {
      firstName: "Мария",
      lastName: "Петрова",
      specialization: "Кардиолог",
      availableSlots: generateSlots(),
    },
  ]);

  console.log("Доктора добавлены");
})();
