import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const bookedFromLogin = location.state?.bookedAppointment;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5000/api/appointments/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (bookedFromLogin) {
      const exists = appointments.some(
        (appt) =>
          appt.dentist === bookedFromLogin.dentist &&
          appt.time_slot === bookedFromLogin.time
      );

      if (!exists) {
        setAppointments((prev) => [
          ...prev,
          {
            id: Date.now(),
            dentist: bookedFromLogin.dentist,
            time_slot: bookedFromLogin.time,
            date: bookedFromLogin.date, // Assuming date is available here
          },
        ]);
      }
    }
  }, [bookedFromLogin, appointments]);

  const cancelAppointment = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to cancel this appointment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `http://localhost:5000/api/appointments/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (response.ok) {
            Swal.fire(
              "Canceled!",
              "The appointment has been canceled.",
              "success"
            );
            setAppointments((prev) => prev.filter((appt) => appt.id !== id));
          } else {
            Swal.fire("Error", data.message || "Failed to cancel.", "error");
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error", "Failed to cancel appointment", "error");
        }
      }
    });
  };

  const startEditing = (id, currentTime) => {
    setEditingId(id);
    setNewTime(currentTime);
  };

  const confirmReschedule = async (id) => {
    if (!newTime.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Time",
        text: "Please enter a valid time (HH:MM).",
      });
      return;
    }

    const formatTime = (time) => {
      const [hour, minute] = time.split(":");
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    };

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Time validation regex
    const formattedTime = formatTime(newTime);

    if (!timeRegex.test(formattedTime)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Format",
        text: "Please use HH:MM in 24-hour format.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ time_slot: formattedTime }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update appointment");
      }

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, time_slot: formattedTime } : appt
        )
      );

      setEditingId(null);
      setNewTime("");

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "The appointment has been rescheduled.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong!",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("bookedAppointment");
    navigate("/");
    window.location.reload();
  };

  // Function to format the date
  const formatDate = (date) => {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, "0");
    const day = newDate.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-[url('/Homepage.jpg')] bg-cover bg-center bg-no-repeat px-4 sm:px-6 py-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 text-center sm:text-left w-full sm:w-auto">
          My Appointments
        </h1>
        <div className="relative ml-auto sm:ml-0">
          <button onClick={() => setDropdownOpen((prev) => !prev)}>
            <FontAwesomeIcon
              icon={faUserCircle}
              size="2x"
              className="text-blue-600"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex right-4 mb-6">
          <button
            onClick={() => navigate("/schedule")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Appointment
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming appointments.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center sm:justify-start py-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="w-full sm:w-[300px] bg-white p-4 sm:p-6 rounded-xl shadow flex flex-col justify-between"
                >
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      size="3x"
                      className="text-blue-500 mb-2"
                    />
                    <h2 className="text-lg font-semibold text-gray-700">
                      {appt.dentist_name
                        ? appt.dentist_name
                        : "Dentist Name Not Available"}
                    </h2>
                    {editingId === appt.id ? (
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded w-full"
                      />
                    ) : (
                      <p className="text-gray-500">
                        {appt.time_slot} - {formatDate(appt.date)}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    {editingId === appt.id ? (
                      <button
                        onClick={() => confirmReschedule(appt.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(appt.id, appt.time_slot)}
                        className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
                      >
                        Reschedule
                      </button>
                    )}
                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
