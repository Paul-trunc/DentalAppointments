const express = require("express");
const db = require("../db");
const router = express.Router();

// Get all dentists
router.get("/", (req, res) => {
  db.query("SELECT * FROM dentists", (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching dentists." });
    res.json(results);
  });
});

// Get available time slots for a dentist and date
router.get("/:id/slots", (req, res) => {
  const dentistId = req.params.id;
  const { date } = req.query;

  const query = `
    SELECT time_slot FROM appointments 
    WHERE dentist_id = ? AND date = ?`;

  db.query(query, [dentistId, date], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching slots." });

    const bookedSlots = results.map((r) => r.time_slot);
    const allSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );
    res.json(availableSlots);
  });
});

module.exports = router;
