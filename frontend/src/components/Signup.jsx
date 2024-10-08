import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import { logo } from '../images';

function Signup() {
  const [values, setValues] = useState({
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",


    upi_id: "",
    referral_by: "02010C",
    user_type: "user",
  });

  const navigate = useNavigate();

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Form validation logic
  const validateForm = (values) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      toast.error("Email is required");
      return false;
    } else if (!emailRegex.test(values.email)) {
      toast.error("Invalid email format");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!values.mobile) {
      toast.error("Mobile number is required");
      return false;
    } else if (!mobileRegex.test(values.mobile)) {
      toast.error("Invalid mobile number. Must be 10 digits.");
      return false;
    }

    if (!values.password) {
      toast.error("Password is required");
      return false;
    } else if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (!values.confirmPassword) {
      toast.error("Confirm password is required");
      return false;
    } else if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true; // Return true if all validations pass
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm(values);
    if (!isValid) return; // Exit if validation fails
  
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/api-register",
        values
      );
      console.log("Server Response:", response);
      
      // Assuming the generated ID is in response.data.id
      const userId = response.data.user.id;
  console.log('userId', userId)
      toast.success("Registration successful!");
  
      setTimeout(() => {
        // Redirect to the Payment page with the generated userId
        navigate(`/payment/${userId}`);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const backendError = err.response.data.error;
        toast.error(backendError); // Display the backend error message
      } else {
        console.log("Axios Error:", err);
        toast.error("An error occurred during registration. Please try again.");
      }
    }
  };
  

  return (
    <div className="bg-white flex justify-center items-center min-h-screen overflow-y-auto">
      <div className="w-full max-w-lg bg-black text-white h-full md:h-screen shadow-2xl ">
        

        {/* Logo and Welcome Section */}
        <div className="px-10 shadow-lg relative">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />

          <div className="flex justify-center py-4 space-x-1">
            <h1 className="font-poppins text-2xl font-extrabold">UNITRADE</h1>
            <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-8">
          <h2 className="text-4xl font-bold text-center mb-6 tracking-tight text-[#eaeaea]">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-8">

            <div className="grid-cols-2 grid gap-2">
              <div className="relative">
                <input
                  type="text"
                  name="user_name"
                  value={values.user_name}
                  onChange={handleInput}
                  required
                  className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
                  placeholder="Name"
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
            <div className="grid-cols-2 grid gap-2">
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
              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleInput}
                  required
                  className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
            {/* UPI ID Input */}
            <div className="relative">
              <input
                type="text"
                name="upi_id"
                value={values.upi_id}
                onChange={handleInput}
                required
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
                placeholder="UPI ID"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                name="referral_by"
                value={values.referral_by}
                onChange={handleInput}
                required
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-500 transition duration-300 ease-in-out"
                placeholder="Referral By" disabled
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
          {/* Removed since errors are now alerted directly */}
        </div>

        {/* Footer Section */}
        <div className="bg-[#111113] py-6 text-center ">
          <p className="text-[#909090]">
            Already have an account?
            <Link to="/login" className="text-white font-semibold hover:underline ml-1">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
