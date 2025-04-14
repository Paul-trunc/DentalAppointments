const cron = require("node-cron");
const db = require("../db");
const sendEmail = require("./emailService");

// Function to send email reminder
const sendReminderEmail = (user_id, appointment_date, time_slot) => {
  // Get user's email
  db.query("SELECT email FROM users WHERE id = ?", [user_id], (err, result) => {
    if (err || result.length === 0) {
      console.error("User email not found.");
      return;
    }

    const to = result[0].email;
    const subject = "Upcoming Appointment Reminder";
    const text = `Reminder: You have an appointment on ${appointment_date} at ${time_slot}.`;

    // Send the reminder email
    sendEmail(to, subject, text);
  });
};

// Function to check if reminder has already been sent
const checkReminderAlreadySent = (appointmentId, type, callback) => {
  db.query(
    "SELECT * FROM appointment_reminders_sent WHERE appointment_id = ? AND reminder_type = ?",
    [appointmentId, type],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.length > 0);
    }
  );
};

// Function to mark reminder as sent
const markReminderSent = (appointmentId, type) => {
  db.query(
    "INSERT INTO appointment_reminders_sent (appointment_id, reminder_type) VALUES (?, ?)",
    [appointmentId, type],
    (err) => {
      if (err) console.error("Failed to mark reminder as sent:", err);
    }
  );
};

// Schedule a task to send reminders at 24, 16, 8, and 1 hour before the appointment
const scheduleReminders = () => {
  cron.schedule("* * * * *", () => {
    const currentTime = new Date();
    const checkQuery = `
      SELECT a.id, a.user_id, a.date, a.time_slot
      FROM appointments a
      WHERE a.date > NOW() AND a.date < NOW() + INTERVAL 1 DAY
    `;

    db.query(checkQuery, (err, results) => {
      if (err) {
        console.error("Error fetching upcoming appointments:", err);
        return;
      }

      // Reminder time intervals
      const thresholds = [
        { hours: 24, label: "24h" },
        { hours: 16, label: "16h" },
        { hours: 8, label: "8h" },
        { hours: 1, label: "1h" },
      ];

      // Loop through appointments and send reminders
      results.forEach((appointment) => {
        const appointmentTime = new Date(
          `${appointment.date} ${appointment.time_slot}`
        );
        const timeDifference = appointmentTime - currentTime;

        // Loop through each reminder threshold
        thresholds.forEach(({ hours, label }) => {
          const min = (hours - 1) * 60 * 60 * 1000;
          const max = hours * 60 * 60 * 1000;

          if (timeDifference <= max && timeDifference > min) {
            checkReminderAlreadySent(
              appointment.id,
              label,
              (err, alreadySent) => {
                if (!alreadySent) {
                  sendReminderEmail(
                    appointment.user_id,
                    appointment.date,
                    appointment.time_slot
                  );
                  markReminderSent(appointment.id, label);
                }
              }
            );
          }
        });
      });
    });
  });
};

scheduleReminders();
