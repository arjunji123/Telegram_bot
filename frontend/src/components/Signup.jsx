import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "./LoginValidation";
import "../Styles/LoginDesign.css";
import {  logo } from '../images';

function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/api-register",
          values
        );
        console.log("Server Response:", response);
        navigate("/payment"); // Redirect to the Payment page upon successful signup
      } catch (err) {
        if (err.response && err.response.status === 400) {
          const backendError = err.response.data.error;
          if (backendError.includes("Email")) {
            setErrors({
              ...errors,
              email: backendError, // Display the backend error message for email
            });
          } else if (backendError.includes("Mobile")) {
            setErrors({
              ...errors,
              mobile: backendError, // Display the backend error message for mobile
            });
          }
        } else {
          console.log("Axios Error:", err);
          setErrors({
            ...errors,
            general: "An unexpected error occurred. Please try again later.",
          });
        }
      }
    }
  };

  return (
<div className="bg-white flex justify-center items-center min-h-screen overflow-y-auto">
  <div className="w-full max-w-lg bg-black text-white h-full md:h-screen shadow-2xl ">

    {/* Logo and Welcome Section */}
    <div className="px-10  shadow-lg relative">
      <div className="flex justify-center py-4 space-x-1">
        <h1 className="font-poppins text-2xl font-extrabold">UNITRADE</h1>
        <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
      </div>
    </div>

    {/* Form Section */}
    <div className="p-8 space-y-8">
      <h2 className="text-4xl font-bold text-center mb-6 tracking-tight text-[#eaeaea]">Sign Up</h2>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-8">
  
  {/* name  Input */}
  <div className="relative">
    <input
      type="tel"
      name="name"
      value={values.name}
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Name."
    />
  </div>
  {/* Mobile Number Input */}
  <div className="relative">
    <input
      type="tel"
      name="mobile"
      value={values.mobile}
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Mobile No."
    />
  </div>

  {/* Email Input */}
  <div className="relative">
    <input
      type="email"
      name="email"
      value={values.email}
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Email"
    />
  </div>

  {/* Password Input */}
  <div className="relative">
    <input
      type="password"
      name="password"
      value={values.password}
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="Password"
    />
  </div>

  {/* UPI ID Input */}
  <div className="relative">
    <input
      type="text"
      name="upi"
      value={values.upi}
      onChange={handleInput}
      required
      className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
      placeholder="UPI ID"
    />
  </div>

  {/* Submit Button */}
  <div className="flex justify-center">
    <button
      type="submit"
      className="w-full py-4 border-white border-2 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transform transition-all duration-300 hover:scale-105"
    >
      Sign Up
    </button>
  </div>
  
</form>


      {/* Error Message */}
      {errors.general && <span className="text-red-500 text-center block mt-4">{errors.general}</span>}
    </div>

    {/* Footer Section */}
    <div className="bg-[#111113] py-6 text-center ">
      <p className="text-[#909090]">
        Already have an account?
        <a href="/login" className="text-white font-semibold hover:underline ml-1">Login</a>
      </p>
    </div>
  </div>
</div>

  
  );
}

export default Signup;
