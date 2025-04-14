import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { parse, format } from "date-fns";

const BookingPage = () => {
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the user is authenticated
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.log("No auth token found. Redirecting to sign-in.");
      navigate("/sign-in");
    }
  }, [navigate]);

  // Fetch dentists from the backend
  useEffect(() => {
    const fetchDentists = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/dentists"); // API for dentists
        if (!response.ok) throw new Error("Failed to fetch dentists");
        const data = await response.json();
        setDentists(data);
      } catch (error) {
        console.error("Error fetching dentists:", error);
        setError("Failed to fetch dentists. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDentists();
  }, []);

  // Fetch available time slots when dentist or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDentist && selectedDate) {
        setSlotsLoading(true);
        try {
          const date = selectedDate.toISOString().split("T")[0];
          const res = await fetch(
            `http://localhost:5000/api/dentists/${selectedDentist}/slots?date=${date}`
          ); // API for available slots
          const data = await res.json();
          setTimeSlots(data);
        } catch (error) {
          console.error("Error fetching time slots:", error);
          setError("Failed to fetch time slots. Please try again.");
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchSlots();
  }, [selectedDentist, selectedDate]);

  // Handle appointment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDentist || !selectedSlot || !selectedDate) {
      setError("Please select a dentist, a date, and a time slot.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) {
      console.log("User is not authenticated. Redirecting to sign-in.");
      setError("User not authenticated. Please log in.");
      navigate("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];

      // Adjust parsing for 24-hour time format (HH:mm)
      console.log("Selected Slot:", selectedSlot); // Log to check if the format is correct
      const parsedTime = parse(selectedSlot, "HH:mm", new Date());
      if (isNaN(parsedTime)) {
        throw new Error(
          "Invalid time format. Please select a valid time slot."
        );
      }

      const formattedTime = format(parsedTime, "HH:mm");

      const response = await fetch("http://localhost:5000/api/appointments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id,
          dentist_id: selectedDentist,
          date: formattedDate,
          time_slot: formattedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Booking failed. Please try again."
        );
      }

      const appointmentData = await response.json();

      Swal.fire({
        title: "Appointment Booked!",
        text: `Thank you for booking with Dr. ${appointmentData.dentist_name}`,
        icon: "success",
        confirmButtonText: "Go to Dashboard",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Something went wrong. Please try again.");

      Swal.fire({
        title: "Booking Failed",
        text: err.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel button click to redirect to Dashboard
  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: "url('/Homepage.jpg')",
      }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Book an Appointment
        </h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Choose a Dentist
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={selectedDentist}
                onChange={(e) => {
                  setSelectedDentist(e.target.value);
                  setSelectedDate(null);
                  setSelectedSlot("");
                  setTimeSlots([]);
                }}
              >
                <option value="">-- Select --</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.name} ({dentist.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Select a Date
              </label>
              <DatePicker
                disabled={!selectedDentist}
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot("");
                }}
                className="w-full p-3 border border-gray-300 rounded-md"
                dateFormat="MMMM d, yyyy"
                placeholderText="Choose date"
                minDate={new Date()}
              />
            </div>

            {selectedDate && slotsLoading && (
              <p className="text-center text-gray-600">Loading time slots...</p>
            )}

            {selectedDate && !slotsLoading && timeSlots.length > 0 && (
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-4 rounded border text-sm ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-blue-100"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-md text-center font-medium bg-red-100 text-red-800">
            {error}
          </div>
        )}

        {location.pathname === "/schedule" && (
          <button
            onClick={handleCancel}
            className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold transition hover:bg-gray-600 mt-4"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
