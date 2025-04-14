import React from "react";

const ServiceCard = ({ title, icon }) => (
  <div className="bg-white px-6 py-5 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 text-center w-52">
    <div className="text-4xl mb-2">{icon}</div>
    <h4 className="text-lg font-semibold text-blue-600">{title}</h4>
  </div>
);

export default ServiceCard;
