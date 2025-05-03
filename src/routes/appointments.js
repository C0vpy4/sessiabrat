const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  const { doctorId, slot } = req.body;
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor || !doctor.availableSlots.includes(slot)) {
    return res.status(400).json({ error: "Неверный слот или доктор" });
  }

  const existing = await Appointment.findOne({ where: { doctorId, slot } });
  if (existing) return res.status(400).json({ error: "Слот уже занят" });

  await Appointment.create({ doctorId, userId: req.userId, slot });
  doctor.availableSlots = doctor.availableSlots.filter((s) => s !== slot);
  await doctor.save();

  res.json({ success: true });
});

router.get("/", async (req, res) => {
  const appointments = await Appointment.findAll({
    where: { userId: req.userId },
    include: Doctor,
  });

  const result = appointments.map((appt) => ({
    slot: appt.slot,
    doctor: `${appt.Doctor.lastName} ${appt.Doctor.firstName} ${
      appt.Doctor.middleName || ""
    }`.trim(),
    specialization: appt.Doctor.specialization,
  }));

  res.json(result);
});

module.exports = router;
