const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Signup
router.post(
  "/signup",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 7 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (results.length > 0)
          return res.status(400).json({ message: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err, result) => {
            if (err)
              return res.status(500).json({ message: "Error saving user." });

            const token = jwt.sign(
              { id: result.insertId, email },
              process.env.SECRET_KEY,
              { expiresIn: "1h" }
            );
            res.status(201).json({ token, user: { name, email } });
          }
        );
      }
    );
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err || results.length === 0)
          return res
            .status(400)
            .json({ message: "Invalid email or password." });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
          return res
            .status(400)
            .json({ message: "Invalid email or password." });

        const token = jwt.sign({ id: user.id, email }, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });
        res
          .status(200)
          .json({ token, user: { id: user.id, name: user.full_name, email } });
      }
    );
  }
);

module.exports = router;
