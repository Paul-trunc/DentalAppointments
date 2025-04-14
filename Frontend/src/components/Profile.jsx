import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [editField, setEditField] = useState({ name: false, email: false });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          Swal.fire("Error", data.message || "Failed to load profile", "error");
          return;
        }

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch profile data", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Profile updated successfully!", "success");
        setEditField({ name: false, email: false });
        // Optionally redirect to dashboard after profile update
        navigate("/dashboard");
      } else {
        Swal.fire("Error", data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      Swal.fire("Error", "An error occurred while updating the profile", err);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/Homepage.jpg')] bg-cover bg-center flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon
            icon={faUserCircle}
            size="4x"
            className="text-blue-600"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">
          My Profile
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Name</label>
          <div className="flex items-center">
            {editField.name ? (
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mr-2"
              />
            ) : (
              <p className="flex-1">{profile.name}</p>
            )}
            <button
              onClick={() =>
                setEditField((prev) => ({ ...prev, name: !prev.name }))
              }
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <div className="flex items-center">
            {editField.email ? (
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full p-2 border rounded mr-2"
              />
            ) : (
              <p className="flex-1">{profile.email}</p>
            )}
            <button
              onClick={() =>
                setEditField((prev) => ({ ...prev, email: !prev.email }))
              }
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
          </div>
        </div>

        {editField.name || editField.email ? (
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4"
          >
            Save Changes
          </button>
        ) : null}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/Dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
