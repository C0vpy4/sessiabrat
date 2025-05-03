const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { authenticate } = require("../utils/auth");
const { Op } = require("sequelize");

// Создание новой записи на прием (требуется аутентификация)
router.post("/", authenticate, async (req, res) => {
  try {
    const { doctorId, slot } = req.body;
    if (!doctorId || !slot) {
      return res
        .status(400)
        .json({ error: "ID доктора и слот времени обязательны" });
    }
    // Проверяем существование доктора
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Доктор не найден" });
    }
    // Проверяем, доступен ли слот
    if (!doctor.availableSlots.includes(slot)) {
      return res.status(400).json({ error: "Выбранный слот недоступен" });
    }

    // Проверяем, не занят ли слот другой записью
    const existingAppointment = await Appointment.findOne({
      where: {
        DoctorId: doctorId,

        slot: slot,
      },
    });
    if (existingAppointment) {
      return res.status(400).json({ error: "Выбранный слот уже занят" });
    }
    // Создаем запись на прием
    const appointment = await Appointment.create({
      UserId: req.user.userId,
      DoctorId: doctorId,
      slot: slot,
    });

    // Обновляем доступные слоты у доктора
    const updatedSlots = doctor.availableSlots.filter((s) => s !== slot);
    await doctor.update({ availableSlots: updatedSlots });
    res.status(201).json({
      message: "Запись на прием успешно создана",
      appointment: {
        id: appointment.id,
        doctorId: appointment.DoctorId,

        slot: appointment.slot,
      },
    });
  } catch (error) {
    console.error("Ошибка создания записи на прием:", error);
    res
      .status(500)
      .json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
});

// Получение списка записей текущего пользователя
router.get("/my", authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        UserId: req.user.userId,
      },
      include: [
        {
          model: Doctor,

          attributes: [
            "id",
            "firstName",
            "lastName",
            "middleName",
            "specialization",
          ],
        },
      ],
    });

    // Форматируем данные для ответа
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      slot: appointment.slot,
      doctor: {
        id: appointment.Doctor.id,

        fullName: `${appointment.Doctor.lastName} ${
          appointment.Doctor.firstName
        } ${appointment.Doctor.middleName || ""}`.trim(),
        specialization: appointment.Doctor.specialization,
      },
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error("Ошибка получения списка записей:", error);
    res
      .status(500)
      .json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
});

// Отмена записи на прием
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Находим запись
    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        UserId: req.user.userId,
      },
      include: [
        {
          model: Doctor,
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Запись не найдена или не принадлежит текущему пользователю",
      });
    }

    // Возвращаем слот в список доступных у доктора
    const doctor = appointment.Doctor;
    const updatedSlots = [...doctor.availableSlots, appointment.slot].sort();
    await doctor.update({ availableSlots: updatedSlots });

    // Удаляем запись
    await appointment.destroy();

    res.status(200).json({ message: "Запись успешно отменена" });
  } catch (error) {
    console.error("Ошибка отмены записи:", error);
    res
      .status(500)
      .json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
});

module.exports = router;
