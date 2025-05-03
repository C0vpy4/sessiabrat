const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { authenticate } = require("./auth");

// Получение списка всех докторов
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "middleName",
        "specialization",
        "availableSlots",
      ],
    });

    // Форматируем данные для ответа
    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      fullName: `${doctor.lastName} ${doctor.firstName} ${
        doctor.middleName || ""
      }`.trim(),
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots,
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error("Ошибка получения списка докторов:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Получение информации о конкретном докторе
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: "Доктор не найден" });
    }

    // Форматируем данные для ответа
    const formattedDoctor = {
      id: doctor.id,
      fullName: `${doctor.lastName} ${doctor.firstName} ${
        doctor.middleName || ""
      }`.trim(),
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      middleName: doctor.middleName,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots,
    };

    res.status(200).json(formattedDoctor);
  } catch (error) {
    console.error("Ошибка получения информации о докторе:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

module.exports = router;
