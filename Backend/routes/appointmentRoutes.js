const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/emailService");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
router.use(rateLimiter);

// Function to send confirmation email (reusable for both authenticated and unauthenticated users)
const sendConfirmationEmail = (user_id, date, time_slot) => {
  db.query(
    "SELECT email FROM users WHERE id = ?",
    [user_id],
    (err, userResult) => {
      if (err || userResult.length === 0) {
        console.error("User email not found.");
        return;
      }
      const to = userResult[0].email;
      const subject = "Appointment Confirmation";
      const text = `Your appointment is confirmed on ${date} at ${time_slot}.`;
      sendEmail(to, subject, text);
    }
  );
};

// Book appointment for authenticated users
router.post("/", authenticateToken, (req, res) => {
  const { dentist_id, date, time_slot } = req.body;
  const user_id = req.user.id;

  const checkQuery = `
    SELECT * FROM appointments 
    WHERE dentist_id = ? AND date = ? AND time_slot = ?`;

  db.query(checkQuery, [dentist_id, date, time_slot], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    const insertQuery = `
      INSERT INTO appointments (user_id, dentist_id, date, time_slot)
      VALUES (?, ?, ?, ?)`;

    db.query(insertQuery, [user_id, dentist_id, date, time_slot], (err) => {
      if (err) {
        return res.status(500).json({ message: "Booking failed." });
      }

      // Send email notification
      sendConfirmationEmail(user_id, date, time_slot);

      res.status(201).json({ message: "Appointment booked successfully." });
    });
  });
});

// Book appointment for unauthenticated users
router.post("/unauthenticated", rateLimiter, (req, res) => {
  const { dentist_id, date, time_slot, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const checkQuery = `
    SELECT * FROM appointments 
    WHERE dentist_id = ? AND date = ? AND time_slot = ?`;

  db.query(checkQuery, [dentist_id, date, time_slot], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    const insertQuery = `
      INSERT INTO appointments (user_id, dentist_id, date, time_slot)
      VALUES (?, ?, ?, ?)`;

    db.query(insertQuery, [user_id, dentist_id, date, time_slot], (err) => {
      if (err) {
        return res.status(500).json({ message: "Booking failed." });
      }

      // Send email notification even if the user is not logged in
      sendConfirmationEmail(user_id, date, time_slot);

      res.status(201).json({ message: "Appointment booked successfully." });
    });
  });
});

// Send test email to the logged-in user's email
router.get("/test-email", authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.query("SELECT email FROM users WHERE id = ?", [user_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "User email not found." });
    }

    const to = result[0].email;
    const subject = "Test Email from Dental App";
    const text = "This is a test email sent to your account.";

    sendEmail(to, subject, text);
    res.send(`Test email sent to ${to}`);
  });
});

// Get user’s booked appointments
router.get("/my", authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const query = `
    SELECT a.*, d.name AS dentist_name
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    WHERE a.user_id = ? ORDER BY a.date`;

  db.query(query, [user_id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error loading appointments." });
    res.json(results);
  });
});

// UPDATE an appointment
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { time_slot } = req.body;

  db.query(
    "UPDATE appointments SET time_slot = ? WHERE id = ?",
    [time_slot, id],
    (err) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ message: "Update failed." });
      }

      res.json({ message: "Appointment updated successfully." });
    }
  );
});

// DELETE an appointment
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM appointments WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ message: "Delete failed." });
    }

    res.json({ message: "Appointment deleted successfully." });
  });
});

module.exports = router;
