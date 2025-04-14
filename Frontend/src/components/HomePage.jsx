import React from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";

const HomePage = () => {
  const navigate = useNavigate();

  const handleScheduleClick = () => {
    const authToken = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    if (authToken && user) {
      navigate("/schedule");
    } else {
      navigate("/sign-in", { state: { from: "/schedule" } });
    }
  };

  const handleLoginClick = () => {
    navigate("/sign-in");
  };

  return (
    <div
      className="min-h-screen w-screen text-gray-800 bg-cover bg-center relative"
      style={{ backgroundImage: `url(/Homepage.jpg)` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-8 py-4 bg-white/90 text-blue-600 shadow-md fixed top-0 z-50">
          <h1 className="text-2xl font-extrabold tracking-tight">
            PerfectSmile Dental
          </h1>
          <button
            onClick={handleLoginClick}
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-full font-semibold hover:bg-blue-100 transition duration-300"
          >
            Log in
          </button>
        </nav>

        {/* Hero */}
        <section className="h-screen flex items-center justify-center px-6 pt-20 text-center">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-extrabold text-blue-700 mb-4 leading-tight">
              Your Perfect Smile Starts Here
            </h2>
            <p className="text-xl text-gray-700">
              Expert dental care with modern technology and gentle hands.
            </p>
            <div>
              <button
                onClick={handleScheduleClick}
                className="bg-blue-600 text-white px-7 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition duration-300 mt-[50px]"
              >
                Schedule Now
              </button>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="px-6 py-20 text-center bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-blue-600 mb-4">About Us</h3>
            <p className="text-gray-700">
              At PerfectSmile Dental, we’re passionate about helping you achieve
              and maintain a beautiful, healthy smile. Our friendly team is here
              to provide personalized dental care in a comfortable and modern
              environment.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="px-6 py-20 text-center bg-blue-50/80 backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-blue-600 mb-10">
            Our Services
          </h3>
          <div className="flex justify-center gap-6 flex-wrap">
            <ServiceCard title="Teeth Cleaning" icon="🪥" />
            <ServiceCard title="Whitening" icon="✨" />
            <ServiceCard title="Braces & Aligners" icon="😁" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
