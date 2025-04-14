const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("./utils/reminderScheduler");
const rateLimiter = require("./middleware/rateLimiter");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Route imports
const authRoutes = require("./routes/authRoutes");
const dentistRoutes = require("./routes/dentistRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/dentists", dentistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
