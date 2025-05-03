const sequelize = require("./db");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
// Функция для генерации временных слотов с 10:00 до 20:00 с интервалом 30 минут
function generateTimeSlots() {
  const slots = [];
  for (let hour = 10; hour < 20; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    slots.push(`${formattedHour}:00-${formattedHour}:30`);
    slots.push(
      `${formattedHour}:30-${(hour + 1).toString().padStart(2, "0")}:00`
    );
  }
  return slots;
}

async function seedDatabase() {
  try {
    // Синхронизируем модели с базой данных
    await sequelize.sync({ force: true }); // Осторожно: удаляет существующие таблицы!

    console.log("База данных синхронизирована");

    // Создаем тестовых пользователей

    const users = await User.bulkCreate([
      {
        email: "user1@example.com",
        password: "123456",
        name: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
      },
      {
        email: "user2@example.com",
        password: "123456",
        name: "Петр Петров",
        phone: "+7 (999) 765-43-21",
      },
    ]);
    console.log(`Создано ${users.length} пользователей`);

    // Создаем тестовых докторов

    const doctors = await Doctor.bulkCreate([
      {
        firstName: "Александр",
        lastName: "Смирнов",
        middleName: "Иванович",
        specialization: "Терапевт",
        availableSlots: generateTimeSlots(),
      },

      {
        firstName: "Елена",
        lastName: "Кузнецова",
        middleName: "Петровна",
        specialization: "Кардиолог",
        availableSlots: generateTimeSlots(),
      },

      {
        firstName: "Дмитрий",
        lastName: "Соколов",
        middleName: "",
        specialization: "Невролог",

        availableSlots: generateTimeSlots(),
      },
    ]);
    console.log(`Создано ${doctors.length} докторов`);

    // Создаем тестовые записи на прием
    const appointments = await Appointment.bulkCreate([
      { UserId: 1, DoctorId: 1, slot: "10:00-10:30" },
      { UserId: 2, DoctorId: 2, slot: "14:00-14:30" },
    ]);
    console.log(`Создано ${appointments.length} записей на прием`);

    // Обновляем доступные слоты у докторов
    const doctor1 = await Doctor.findByPk(1);
    doctor1.availableSlots = doctor1.availableSlots.filter(
      (slot) => slot !== "10:00-10:30"
    );
    await doctor1.save();

    const doctor2 = await Doctor.findByPk(2);
    doctor2.availableSlots = doctor2.availableSlots.filter(
      (slot) => slot !== "14:00-14:30"
    );
    await doctor2.save();

    console.log("Заполнение базы данных завершено успешно");
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
  }
}
// Запускаем заполнение базы данных
seedDatabase();
