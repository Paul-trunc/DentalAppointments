const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get User Profile
router.get("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT full_name AS name, email FROM users WHERE id = ?";

  try {
    const [results] = await db.promise().query(sql, [userId]);
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile (name and email)
router.put("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const sql = "UPDATE users SET full_name = ?, email = ? WHERE id = ?";
    await db.promise().query(sql, [name, email, userId]);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
