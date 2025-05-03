const express = require("express");
const Doctor = require("../models/Doctor");

const router = express.Router();

router.get("/", async (req, res) => {
  const doctors = await Doctor.findAll();
  const result = doctors.map((doc) => ({
    id: doc.id,
    name: `${doc.lastName} ${doc.firstName} ${doc.middleName || ""}`.trim(),
    specialization: doc.specialization,
    availableSlots: doc.availableSlots,
  }));
  res.json(result);
});

module.exports = router;
